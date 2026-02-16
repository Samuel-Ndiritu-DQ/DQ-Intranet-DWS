import { supabaseAdmin } from '../lib/supabaseAdmin.js';

type AnyRequest = {
  method?: string;
  headers: Record<string, string | undefined> & { host?: string; 'x-forwarded-proto'?: string };
  url?: string;
  [key: string]: unknown;
};

type AnyResponse = {
  status?: (code: number) => AnyResponse;
  json?: (body: unknown) => void;
  setHeader?: (k: string, v: string) => void;
  end?: (body?: unknown) => void;
  [key: string]: unknown;
};

type GuideFacetRow = {
  domain?: string | null;
  guide_type?: string | null;
  function_area?: string | null;
  status?: string | null;
};

export default async function handler(req: AnyRequest, res: AnyResponse) {
  try {
    if (req.method !== 'GET') { res.status?.(405); res.json?.({ error: 'Method not allowed' }); return; }
    // Pull distinct values from guides for simplified facets
    const { data, error } = await supabaseAdmin
      .from('guides')
      .select('domain,guide_type,function_area,status');
    if (error) throw error;
    const uniq = (arr: GuideFacetRow[] | null | undefined, key: 'domain'|'guide_type'|'function_area'|'status') => {
      const set = new Set<string>();
      for (const r of arr || []) {
        const value = r?.[key];
        if (value) set.add(String(value));
      }
      return Array.from(set).sort().map((name, i) => ({ id: i + 1, name }));
    };
    const out = {
      domain: uniq(data || [], 'domain'),
      guideType: uniq(data || [], 'guide_type'),
      functionArea: uniq(data || [], 'function_area'),
      status: uniq(data || [], 'status'),
    };
    res.status?.(200); res.json?.(out);
  } catch (err: unknown) {
    console.error('api/guides/taxonomies error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    res.status?.(500); res.json?.({ error: message });
  }
}
