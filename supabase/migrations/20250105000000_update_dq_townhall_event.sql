-- Migration: Update DQ TOWNHALL (November) Event
-- Description: Updates the "UX/UI Design Principles" event to "DQ TOWNHALL (November)" with all new details
-- Date: 2025-01-05

-- First, ensure location_filter column exists (if it doesn't, this will be a no-op if column already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events_v2' AND column_name = 'location_filter'
  ) THEN
    ALTER TABLE events_v2 ADD COLUMN location_filter TEXT;
  END IF;
END $$;

-- Ensure department column exists (as TEXT[] array type)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events_v2' AND column_name = 'department'
  ) THEN
    ALTER TABLE events_v2 ADD COLUMN department TEXT[];
  END IF;
END $$;

-- Ensure metadata column exists (JSONB for flexible data storage)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events_v2' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE events_v2 ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- Update the event with all new details
UPDATE events_v2
SET
  title = 'DQ TOWNHALL (November)',
  description = 'The DQ Townhall is a company-wide meeting that brings together associates from all levels to discuss key organizational updates, initiatives, and priorities. The session provides a platform for sharing progress on ongoing projects, celebrating achievements, and fostering open communication across all departments.

Purpose: To inform, engage, and align associates on DQ''s vision, goals, and strategic priorities.

Agenda:
1. Welcome & Introduction – 5 minutes
2. Organizational Updates – 20 minutes
3. Key Updates Across Departments and Projects – TBU (To be updated)

What to Bring: A device with an internet connection and the meeting link. Meeting link will be provided after registration.',
  start_time = '2025-11-28 16:00:00+04:00'::timestamptz,
  end_time = '2025-11-28 17:00:00+04:00'::timestamptz,
  category = NULL,
  location = 'Remote',
  location_filter = 'Remote',
  meeting_link = '[Insert meeting link here]',
  is_virtual = true,
  is_all_day = false,
  max_attendees = 500,
  registration_required = true,
  organizer_name = 'Product Team - Digital Qatalyst Events',
  organizer_email = NULL,
  department = ARRAY['HRA (People)']::TEXT[],
  tags = ARRAY[]::TEXT[],
  metadata = jsonb_build_object(
    'agenda', jsonb_build_array(
      jsonb_build_object('item', 'Welcome & Introduction', 'duration', '5 minutes'),
      jsonb_build_object('item', 'Organizational Updates', 'duration', '20 minutes'),
      jsonb_build_object('item', 'Key Updates Across Departments and Projects', 'duration', 'TBU (To be updated)')
    ),
    'what_to_bring', 'A device with an internet connection and the meeting link. Meeting link will be provided after registration.',
    'registration_link', '[Insert event registration link here]'
  ),
  updated_at = NOW()
WHERE 
  title ILIKE '%UX/UI Design Principles%'
  OR title ILIKE '%UX%UI%Design%'
  OR (title ILIKE '%townhall%' AND title ILIKE '%november%');

-- If the event doesn't exist, create it
INSERT INTO events_v2 (
  title,
  description,
  start_time,
  end_time,
  category,
  location,
  location_filter,
  meeting_link,
  is_virtual,
  is_all_day,
  max_attendees,
  registration_required,
  organizer_name,
  department,
  status,
  tags,
  metadata,
  created_at,
  updated_at
)
SELECT
  'DQ TOWNHALL (November)',
  'The DQ Townhall is a company-wide meeting that brings together associates from all levels to discuss key organizational updates, initiatives, and priorities. The session provides a platform for sharing progress on ongoing projects, celebrating achievements, and fostering open communication across all departments.

Purpose: To inform, engage, and align associates on DQ''s vision, goals, and strategic priorities.

Agenda:
1. Welcome & Introduction – 5 minutes
2. Organizational Updates – 20 minutes
3. Key Updates Across Departments and Projects – TBU (To be updated)

What to Bring: A device with an internet connection and the meeting link. Meeting link will be provided after registration.',
  '2025-11-28 16:00:00+04:00'::timestamptz,
  '2025-11-28 17:00:00+04:00'::timestamptz,
  NULL,
  'Remote',
  'Remote',
  '[Insert meeting link here]',
  true,
  false,
  500,
  true,
  'Product Team - Digital Qatalyst Events',
  ARRAY['HRA (People)']::TEXT[],
  'published',
  ARRAY[]::TEXT[],
  jsonb_build_object(
    'agenda', jsonb_build_array(
      jsonb_build_object('item', 'Welcome & Introduction', 'duration', '5 minutes'),
      jsonb_build_object('item', 'Organizational Updates', 'duration', '20 minutes'),
      jsonb_build_object('item', 'Key Updates Across Departments and Projects', 'duration', 'TBU (To be updated)')
    ),
    'what_to_bring', 'A device with an internet connection and the meeting link. Meeting link will be provided after registration.',
    'registration_link', '[Insert event registration link here]'
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM events_v2 
  WHERE title = 'DQ TOWNHALL (November)'
);

-- Add comment for documentation
COMMENT ON COLUMN events_v2.description IS 'Event description including context, purpose, agenda, and what to bring';

