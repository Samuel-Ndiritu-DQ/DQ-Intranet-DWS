-- ============================================================================
-- Seed Data: Blogs / Insights (Thought Leadership, non-podcast)
-- Populates public.news with items for the "Blogs" (Insights) tab.
-- Items come from NewsItem where type = 'Thought Leadership' and format != 'Podcast'.
-- ============================================================================

INSERT INTO public.news (
  id, title, type, date, author, byline, views, excerpt, image,
  department, location, domain, tags, reading_time, news_type, news_source,
  focus_area, content, format, source, audio_url
) VALUES
-- Example Thought Leadership blog: "Is Beijing Building the World's First AI Superstate?"
(
  'beijing-ai-superstate',
  'Is Beijing Building the World''s First AI Superstate?',
  'Thought Leadership',
  '2025-12-12',
  'Dr. Stéphane Niango',
  'Dr. Stéphane Niango',
  98,
  'While the U.S. pushes a loud "compute nationalism" agenda, China is quietly executing a parallel strategy that is more coordinated, vertically integrated, and harder to track.',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  NULL,
  NULL,
  'Business',
  ARRAY['Geopolitics & Technology'],
  '5–10',
  'Company News',
  'DQ Leadership',
  'GHC',
  '# Is Beijing Building the World''s First AI Superstate?

While the U.S. pushes a loud "compute nationalism" agenda, China is quietly executing a parallel strategy that is more coordinated, vertically integrated, and harder to track.

There is a strange calm around China''s AI strategy right now. No loud announcements. No flashy political statements. No weekly executive orders.

**Just… quiet expansion.**

But behind that silence, something massive is unfolding: China is building compute capacity at a speed the world has never seen before.

While the U.S. under Trump is pushing a loud and public "compute nationalism" agenda, China is executing a parallel strategy—one that is arguably more coordinated, more vertically integrated, and far harder for the outside world to track.

So the question is worth asking:

**Is China quietly building the world''s first AI superstate?**

Let''s unpack what''s actually happening.

## China Doesn''t Announce the Plan — It Already Builds It

Unlike the U.S., China does not debate infrastructure at length.

**It activates.**

Here''s what gives China a structural advantage in the AI infrastructure race:

### 1. State-directed industrial capacity

China can mobilize:

- land
- labour
- energy
- construction
- logistics

at national scale without hitting the political bottlenecks Western countries face.

### 2. Full-stack control of hardware supply chains

From raw materials → to wafer fabrication → to packaging → to datacenter rack assembly

China has built more of the chain internally than any other nation.

### 3. Rapid build cycles

A hyperscale datacenter in the U.S. may take 24–36 months to complete.

In China, it can be done in 10–14 months—sometimes less.

And while export controls limit China''s access to the newest Nvidia chips, it still produces:

- competitive domestic GPUs
- specialized AI ASICs
- custom accelerators
- and enormous distributed compute clusters

China is not slowing down—it is diversifying.',
  'Blog',
  'DigitalQatalyst',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  date = EXCLUDED.date,
  author = EXCLUDED.author,
  byline = EXCLUDED.byline,
  views = EXCLUDED.views,
  excerpt = EXCLUDED.excerpt,
  image = EXCLUDED.image,
  department = EXCLUDED.department,
  location = EXCLUDED.location,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  reading_time = EXCLUDED.reading_time,
  news_type = EXCLUDED.news_type,
  news_source = EXCLUDED.news_source,
  focus_area = EXCLUDED.focus_area,
  content = EXCLUDED.content,
  format = EXCLUDED.format,
  source = EXCLUDED.source,
  audio_url = EXCLUDED.audio_url,
  updated_at = NOW();

-- TODO: Add additional INSERT statements here for all non-podcast Thought Leadership items
-- from src/data/media/news.ts that should appear under the "Blogs / Insights" tab.
