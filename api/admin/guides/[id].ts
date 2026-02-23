import { supabaseAdmin } from '../../lib/supabaseAdmin'

type AnyRequest = { method?: string; headers: Record<string,string|undefined>; url?: string; [k:string]: any }
type AnyResponse = { status?: (c:number)=>AnyResponse; json?: (b:any)=>void }

function parseJSONBody(req: AnyRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (c: any) => (data += c))
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}) } catch (e) { reject(e) } })
    req.on('error', reject)
  })
}

const GHC_SLUGS = new Set(['dq-vision', 'dq-hov', 'dq-persona', 'dq-agile-tms', 'dq-agile-sos', 'dq-agile-flows', 'dq-agile-6xd'])

function validateGHCSlug(existingSlug: string, newSlug: string | undefined): string | null {
  if (!GHC_SLUGS.has(existingSlug)) return null
  if (!newSlug || newSlug === existingSlug) return null
  if (GHC_SLUGS.has(newSlug)) {
    return `Cannot change GHC element slug from "${existingSlug}" to "${newSlug}". Each GHC element must have a unique, fixed slug.`
  }
  return null
}

async function validateSlugUniqueness(id: string, newSlug: string | undefined, currentSlug: string): Promise<string | null> {
  if (!newSlug || newSlug === currentSlug) return null
  const { data: slugCheck, error: slugError } = await supabaseAdmin
    .from('guides')
    .select('id, slug')
    .eq('slug', newSlug)
    .neq('id', id)
    .maybeSingle()
  if (slugError) throw slugError
  if (slugCheck) {
    return `Slug "${newSlug}" is already in use by guide "${slugCheck.id}". Each guide must have a unique slug.`
  }
  return null
}

function buildUpdateData(body: Record<string, unknown>): Record<string, unknown> {
  const updateData: Record<string, unknown> = {}
  for (const key of Object.keys(body)) {
    if (body[key] !== undefined && key !== '_diff') {
      updateData[key] = body[key]
    }
  }
  return updateData
}

async function handlePut(req: AnyRequest, res: AnyResponse, id: string): Promise<void> {
  const body = await parseJSONBody(req)

  const { data: existingGuide, error: fetchError } = await supabaseAdmin
    .from('guides')
    .select('id, slug, title, body')
    .eq('id', id)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!existingGuide) {
    res.status?.(404); res.json?.({ error: 'Guide not found' }); return
  }

  const ghcSlugError = validateGHCSlug(existingGuide.slug, body.slug)
  if (ghcSlugError) {
    res.status?.(400); res.json?.({ error: ghcSlugError }); return
  }

  const slugUniquenessError = await validateSlugUniqueness(id, body.slug, existingGuide.slug)
  if (slugUniquenessError) {
    res.status?.(400); res.json?.({ error: slugUniquenessError }); return
  }

  // For GHC guides, log body content changes to prevent accidental content sharing
  if (GHC_SLUGS.has(existingGuide.slug) && body.body && body.body !== existingGuide.body) {
    console.log(`[Admin] GHC Guide Update: ${existingGuide.slug} (ID: ${id})`)
    console.log(`[Admin] Body length changed: ${existingGuide.body?.length || 0} -> ${body.body.length}`)
  }

  const { error } = await supabaseAdmin
    .from('guides')
    .update(buildUpdateData(body))
    .eq('id', id)

  if (error) throw error

  const slugChange = body.slug && body.slug !== existingGuide.slug ? ` -> ${body.slug}` : ''
  console.log(`[Admin] Updated guide: id=${id}, slug=${existingGuide.slug}${slugChange}`)

  await supabaseAdmin.from('guides_versions').insert({
    guide_id: id,
    version: 'auto',
    changed_at: new Date().toISOString(),
    diff_summary: body._diff || 'update'
  })
  res.status?.(200); res.json?.({ ok: true })
}

async function handleDelete(res: AnyResponse, id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('guides').delete().eq('id', id)
  if (error) throw error
  res.status?.(200); res.json?.({ ok: true })
}

export default async function handler(req: AnyRequest, res: AnyResponse) {
  try {
    const host = req.headers.host || 'localhost'
    const proto = req.headers['x-forwarded-proto'] || 'https'
    const url = new URL(`${proto}://${host}${req.url}`)
    const id = url.pathname.split('/').pop() as string

    if (req.method === 'PUT') return await handlePut(req, res, id)
    if (req.method === 'DELETE') return await handleDelete(res, id)

    res.status?.(405); res.json?.({ error: 'Method not allowed' })
  } catch (e: unknown) {
    res.status?.(500); res.json?.({ error: e instanceof Error ? e.message : 'Server error' })
  }
}
