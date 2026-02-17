-- ============================================================================
-- Seed Data: News & Announcements (Announcements, Guidelines, Notices)
-- Populates public.news with items for the "News & Announcements" tab.
-- Structure matches src/data/media/news.ts (NewsItem type).
-- Extend this file to include all Announcement / Guidelines / Notice items.
-- ============================================================================

INSERT INTO public.news (
  id, title, type, date, author, byline, views, excerpt, image,
  department, location, domain, tags, reading_time, news_type, news_source,
  focus_area, content, format, source, audio_url
) VALUES
-- Example: DXB EoY Event Postponement (Company News announcement)
(
  'dxb-eoy-event-postponement',
  'DXB EoY Event Postponement',
  'Announcement',
  '2025-12-19',
  'Fadil A',
  'DQ Operations',
  0,
  'Due to unfavourable weather conditions, the DQ Studios Y/E Annual Gathering scheduled for 19.12.2025 has been rescheduled for everyone''s safety.',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  'DQ Operations',
  'Dubai',
  'Operations',
  ARRAY['event','postponement','annual gathering','weather'],
  '<5',
  'Company News',
  'DQ Operations',
  'Culture & People',
  '# DXB EoY Event Postponement

Due to unfavourable weather conditions, the DQ Studios Y/E Annual Gathering scheduled for 19.12.2025 has been rescheduled for everyone''s safety.

We sincerely apologise for the inconvenience and appreciate your understanding.

To ensure the date chosen is convenient for DXB Associates. I will be sharing a poll shortly to confirm a date. Once confirmed, details regarding the rescheduled date will be shared after.',
  NULL,
  NULL,
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

-- TODO: Add additional INSERT statements here for all Announcement / Guidelines / Notice items
-- from src/data/media/news.ts that should appear under the "News & Announcements" tab.
