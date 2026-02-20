-- Migration: Add Event Type Filter Options to Database
-- Description: Adds event-type filter options to filter_options table for dynamic filtering
-- Date: 2025-01-05

-- Insert Event Type filter options for Events marketplace
INSERT INTO filter_options (filter_type, filter_category, option_value, option_label, display_order) VALUES
('event-type', 'events', 'Webinar', 'Webinar', 1),
('event-type', 'events', 'Workshop', 'Workshop', 2),
('event-type', 'events', 'Seminar', 'Seminar', 3),
('event-type', 'events', 'Panel', 'Panel', 4),
('event-type', 'events', 'Conference', 'Conference', 5),
('event-type', 'events', 'Networking', 'Networking', 6),
('event-type', 'events', 'Competition', 'Competition', 7),
('event-type', 'events', 'Pitch Day', 'Pitch Day', 8),
('event-type', 'events', 'Townhall', 'Townhall', 9)
ON CONFLICT (filter_type, filter_category, option_value) DO UPDATE
SET option_label = EXCLUDED.option_label,
    display_order = EXCLUDED.display_order;

-- Add comment for documentation
COMMENT ON TABLE filter_options IS 'Filter options for marketplace filtering. Supports filter_type (department, location, event-type) and filter_category (events, communities, pulse, both)';

