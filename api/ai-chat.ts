import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DWS_KNOWLEDGE } from '../src/data/dwsChatKnowledge.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChatRole = 'system' | 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type EmbedRecord = {
  topicId: string;
  text: string;
  embedding: number[];
};

// ---------------------------------------------------------------------------
// Constants & Configuration
// ---------------------------------------------------------------------------

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const DEFAULT_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small';
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;

const MAX_CONTEXT_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 30;
const MAX_TOKENS = 600;
const RETRIEVAL_TOP_K = 3;
const RETRIEVAL_MIN_SCORE = 0.2;
const ALLOWED_ROLES: ChatRole[] = ['system', 'user', 'assistant'];

// ---------------------------------------------------------------------------
// Shared OpenAI helpers (eliminates repeated header / fetch boilerplate)
// ---------------------------------------------------------------------------

function openAiHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  };
}

async function openAiFetch<T = any>(path: string, body: object): Promise<T> {
  const resp = await fetch(`${OPENAI_BASE_URL}${path}`, {
    method: 'POST',
    headers: openAiHeaders(),
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    throw new Error(`OpenAI ${path} failed (${resp.status}): ${detail}`);
  }

  return resp.json() as Promise<T>;
}

/** Raw streaming fetch — returns the Response so the caller can pipe it. */
async function openAiStreamFetch(body: object): Promise<Response> {
  const resp = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: openAiHeaders(),
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    throw new Error(`OpenAI stream failed (${resp.status}): ${detail}`);
  }

  return resp;
}

// ---------------------------------------------------------------------------
// Prompt helpers
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT_BASE =
  "You are the DQ Digital Workspace AI Assistant. Be concise, specific, and actionable. " +
  "You can answer anything about DQ, the Digital Workspace, onboarding, services, learning, " +
  "governance, or general knowledge. If a question is unclear, ask a brief clarifying question. " +
  "If you don't have high confidence, say so and propose the next step. " +
  "Respond in Markdown with short paragraphs or bullets.";

function buildSystemPrompt(context?: string): string {
  if (!context) return SYSTEM_PROMPT_BASE;
  const trimmed = String(context).slice(0, MAX_CONTEXT_LENGTH);
  return `${SYSTEM_PROMPT_BASE}\n\nUse this DWS context when relevant:\n${trimmed}`;
}

function sanitizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((m) => ({
      role: ALLOWED_ROLES.includes(m?.role) ? (m.role as ChatRole) : ('user' as ChatRole),
      content: typeof m?.content === 'string' ? m.content.trim() : '',
    }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_HISTORY_MESSAGES);
}

// ---------------------------------------------------------------------------
// Embedding / RAG helpers
// ---------------------------------------------------------------------------

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}

let cachedEmbeddings: EmbedRecord[] | null = null;

async function fetchEmbeddings(texts: string[]): Promise<number[][]> {
  const data = await openAiFetch<{ data: { embedding: number[] }[] }>('/embeddings', {
    model: DEFAULT_EMBED_MODEL,
    input: texts.map((t) => t.slice(0, MAX_CONTEXT_LENGTH)),
  });
  return data.data.map((d) => d.embedding);
}

async function getKnowledgeEmbeddings(): Promise<EmbedRecord[]> {
  if (cachedEmbeddings) return cachedEmbeddings;

  const entries = Object.entries(DWS_KNOWLEDGE).map(([topicId, entry]) => ({
    topicId,
    text: `${entry.summary}\n\n${entry.details}`,
  }));

  const vectors = await fetchEmbeddings(entries.map((e) => e.text));

  cachedEmbeddings = entries.map((entry, idx) => ({
    ...entry,
    embedding: vectors[idx],
  }));

  return cachedEmbeddings;
}

async function buildRetrievalContext(query: string): Promise<string | null> {
  try {
    const [records, [queryVec]] = await Promise.all([
      getKnowledgeEmbeddings(),
      fetchEmbeddings([query]),
    ]);

    const scored = records
      .map((r) => ({ ...r, score: cosineSimilarity(r.embedding, queryVec) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, RETRIEVAL_TOP_K)
      .filter((r) => r.score > RETRIEVAL_MIN_SCORE);

    if (!scored.length) return null;

    return scored
      .map((r, i) => `DQ Context #${i + 1} (score ${(r.score * 100).toFixed(1)}):\n${r.text}`)
      .join('\n\n---\n\n');
  } catch (err) {
    console.error('Retrieval context error', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// CORS helper
// ---------------------------------------------------------------------------

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ---------------------------------------------------------------------------
// Route handlers — each is a small, focused function
// ---------------------------------------------------------------------------

function handleOptions(res: VercelResponse) {
  setCors(res);
  return res.status(204).end();
}

function handleGet(res: VercelResponse) {
  setCors(res);
  if (!OPENAI_API_KEY) {
    return res.status(503).json({ ok: false, error: 'OPENAI_API_KEY not configured' });
  }
  return res.status(200).json({ ok: true, model: DEFAULT_MODEL, embedModel: DEFAULT_EMBED_MODEL });
}

async function handleStreamResponse(upstream: Response, res: VercelResponse) {
  setCors(res);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  if (!upstream.body) {
    return res.status(500).json({ error: 'Upstream streaming body missing' });
  }

  const reader = (upstream.body as any).getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) res.write(Buffer.from(value));
  }
  res.end();
}

function handleJsonResponse(data: any, res: VercelResponse) {
  const reply = data?.choices?.[0]?.message?.content?.trim?.();
  if (!reply) {
    return res.status(500).json({ error: 'AI provider did not return a message' });
  }

  setCors(res);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    reply,
    finishReason: data?.choices?.[0]?.finish_reason ?? null,
    usage: data?.usage ?? null,
  });
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured in the server environment.' });
  }

  const { messages: rawMessages, context, temperature, model, stream } = req.body ?? {};
  const messages = sanitizeMessages(rawMessages);
  if (!messages.length) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const lastUserMessage = messages[messages.length - 1].content;
  const retrievalContext = await buildRetrievalContext(lastUserMessage);
  const mergedContext = [context, retrievalContext].filter(Boolean).join('\n\n');
  const systemPrompt = buildSystemPrompt(mergedContext || undefined);

  const payload = {
    model: typeof model === 'string' && model.trim() ? model.trim() : DEFAULT_MODEL,
    temperature: typeof temperature === 'number' ? Math.min(Math.max(temperature, 0), 1) : 0.2,
    max_tokens: MAX_TOKENS,
    stream: !!stream,
    messages: [{ role: 'system' as const, content: systemPrompt }, ...messages].slice(-MAX_HISTORY_MESSAGES),
  };

  if (stream) {
    const upstream = await openAiStreamFetch(payload);
    return handleStreamResponse(upstream, res);
  }

  const data = await openAiFetch('/chat/completions', payload);
  return handleJsonResponse(data, res);
}

// ---------------------------------------------------------------------------
// Main handler — thin dispatcher
// ---------------------------------------------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case 'OPTIONS': return handleOptions(res);
      case 'GET': return handleGet(res);
      case 'POST': return handlePost(req, res);
      default:
        res.setHeader('Allow', 'GET, POST, OPTIONS');
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('AI chat handler error', error);
    return res.status(500).json({
      error: 'Failed to generate AI response',
      detail: error?.message || String(error),
    });
  }
}
