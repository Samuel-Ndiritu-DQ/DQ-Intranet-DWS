type AnyRequest = {
  method?: string;
  headers: Record<string, string | undefined> & { host?: string; 'x-forwarded-proto'?: string };
  url?: string;
  body?: unknown;
  [key: string]: unknown;
};

type AnyResponse = {
  status?: (code: number) => AnyResponse;
  json?: (body: unknown) => void;
  setHeader?: (k: string, v: string) => void;
  end?: (body?: unknown) => void;
  [key: string]: unknown;
};

import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { createHash } from 'node:crypto';

type GuideRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  hero_image_url?: string | null;
  updated_at?: string | null;
  download_count?: number | null;
  guide_type?: string | null;
  domain?: string | null;
  function_area?: string | null;
  status?: string | null;
  has_more?: boolean;
  cursor?: string | number | null;
};

type FacetRow = {
  domain?: string | null;
  guide_type?: string | null;
  function_area?: string | null;
  status?: string | null;
};

const buildUrl = (req: AnyRequest) => {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host || 'localhost';
  return new URL(`${proto}://${host}${req.url || ''}`);
};

const parseCsv = (params: URLSearchParams, key: string) =>
  (params.get(key) || '').split(',').map(v => v.trim()).filter(Boolean);

const buildSortParam = (raw: string) => {
  if (raw === 'downloads' || raw === 'relevance') return 'downloads';
  return 'updated';
};

const countBy = (arr: FacetRow[] | null | undefined, key: 'domain'|'guide_type'|'function_area'|'status') => {
  const m = new Map<string, number>();
  for (const r of arr || []) {
    const v = r?.[key];
    if (!v) continue;
    m.set(v, (m.get(v) || 0) + 1);
  }
  return Array.from(m.entries())
    .map(([id, cnt]) => ({ id, name: id, count: cnt }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const sendNotAllowed = (res: AnyResponse) => {
  res.status?.(405);
  res.json?.({ error: 'Method not allowed' });
};

const sendWithEtag = (res: AnyResponse, body: unknown, inm?: string) => {
  const json = JSON.stringify(body);
  const etag = 'W/"' + createHash('sha1').update(json).digest('hex') + '"';
  res.setHeader?.('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.setHeader?.('ETag', etag);
  if (inm && inm === etag) { res.status?.(304); res.end?.(); return true; }
  res.status?.(200); res.end?.(json); return false;
};

const fetchGuides = async (urlObj: URL, req: AnyRequest, res: AnyResponse) => {
  const q = urlObj.searchParams.get('q') || '';
  const sortParam = (urlObj.searchParams.get('sort') || 'relevance') as string;
  const sort = buildSortParam(sortParam);
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(urlObj.searchParams.get('pageSize') || '12', 10)));
  const cursor = urlObj.searchParams.get('cursor') || '';
  const domains = parseCsv(urlObj.searchParams, 'domain');
  const types = parseCsv(urlObj.searchParams, 'guide_type');
  const functions = parseCsv(urlObj.searchParams, 'function_area');
  const status = (urlObj.searchParams.get('status') || 'Approved');

  const { data, error } = await supabaseAdmin.rpc('rpc_guides_search', {
    q: q || null,
    domains: domains.length ? domains : null,
    types: types.length ? types : null,
    functions: functions.length ? functions : null,
    status_filter: status || null,
    sort,
    limit_count: pageSize,
    after: cursor || null,
  });
  if (error) throw error;

  const rows = (data as GuideRow[]) || [];
  const items = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    heroImageUrl: r.hero_image_url ?? null,
    lastUpdatedAt: r.updated_at ?? null,
    downloadCount: r.download_count ?? null,
    guideType: r.guide_type ?? null,
    domain: r.domain ?? null,
    functionArea: r.function_area ?? null,
    status: r.status ?? null,
  }));
  const last = rows[rows.length - 1];
  const hasMore = !!(last && last.has_more);
  const nextCursor = last ? String(last.cursor || '') : null;

  let facetBase = supabaseAdmin.from('guides').select('domain,guide_type,function_area,status');
  if (q) facetBase = facetBase.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
  if (status) facetBase = facetBase.eq('status', status);
  if (domains.length) facetBase = facetBase.in('domain', domains);
  if (types.length) facetBase = facetBase.in('guide_type', types);
  if (functions.length) facetBase = facetBase.in('function_area', functions);
  const { data: facetRows, error: facetErr } = await facetBase;
  if (facetErr) throw facetErr;
  const facets = {
    domain: countBy(facetRows || [], 'domain'),
    guide_type: countBy(facetRows || [], 'guide_type'),
    function_area: countBy(facetRows || [], 'function_area'),
    status: countBy(facetRows || [], 'status'),
  };

  const body = { items, total: items.length, facets, cursor: nextCursor, has_more: hasMore };
  const inm = req.headers['if-none-match'];
  sendWithEtag(res, body, inm);
};

export default async function handler(req: AnyRequest, res: AnyResponse) {
  try {
    if (req.method !== 'GET') {
      sendNotAllowed(res);
      return;
    }
    const urlObj = buildUrl(req);
    await fetchGuides(urlObj, req, res);
    return;
  } catch (err: unknown) {
    console.error('api/guides error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    res.status?.(500); res.json?.({ error: message });
  }
}
