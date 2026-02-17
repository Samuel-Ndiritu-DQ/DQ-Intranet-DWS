export type AiChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface AiChatRequest {
  messages: AiChatMessage[];
  context?: string | null;
  model?: string;
  temperature?: number;
  stream?: boolean;
}

export interface AiChatResponse {
  reply: string;
  finishReason?: string | null;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AiStreamOptions {
  onToken?: (token: string) => void;
  signal?: AbortSignal;
}

const DEFAULT_ENDPOINT =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_CHAT_ENDPOINT) || '/api/ai-chat';

export async function sendAiChat(
  payload: AiChatRequest,
  options?: AiStreamOptions
): Promise<AiChatResponse> {
  const useStream = payload.stream === true || typeof options?.onToken === 'function';
  const bodyPayload = useStream ? { ...payload, stream: true } : payload;

  const res = await fetch(DEFAULT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(useStream ? { Accept: 'text/event-stream' } : {}),
    },
    body: JSON.stringify(bodyPayload),
    signal: options?.signal,
  });

  if (useStream) {
    if (!res.ok || !res.body) {
      const detail = await res.text();
      throw new Error(`AI stream failed (${res.status}): ${detail || res.statusText}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffered = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffered += decoder.decode(value, { stream: true });

      const parts = buffered.split('\n\n');
      buffered = parts.pop() || '';

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') {
          reader.cancel();
          break;
        }
        try {
          const json = JSON.parse(data);
          const delta = json?.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            options?.onToken?.(delta);
          }
        } catch (err) {
          // ignore malformed chunk; continue
        }
      }
    }

    // Flush any remaining buffer
    if (buffered.length) {
      const line = buffered.trim();
      if (line.startsWith('data:')) {
        const data = line.slice(5).trim();
        if (data !== '[DONE]') {
          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              options?.onToken?.(delta);
            }
          } catch {
            // ignore
          }
        }
      }
    }

    if (!fullText.trim()) {
      throw new Error('AI stream ended without content');
    }
    return { reply: fullText };
  } else {
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`AI request failed (${res.status}): ${detail || res.statusText}`);
    }

    const data = await res.json();
    if (!data?.reply) {
      throw new Error('AI response did not include a reply');
    }

    return data as AiChatResponse;
  }
}

export async function checkAiHealth(): Promise<boolean> {
  try {
    const res = await fetch(DEFAULT_ENDPOINT, { method: 'GET' });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.ok);
  } catch {
    return false;
  }
}
