-- =====================================================
-- Pulse Marketplace - Seed Data
-- =====================================================
-- This file inserts sample Pulse items (surveys, polls, feedback)
-- converted from the original mock data
-- =====================================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE pulse_responses CASCADE;
-- TRUNCATE TABLE pulse_comments CASCADE;
-- TRUNCATE TABLE pulse_likes CASCADE;
-- TRUNCATE TABLE pulse_items CASCADE;

-- =====================================================
-- 1. Event Feedback: Digital Qatalyst Town Hall (Feedback)
-- =====================================================

INSERT INTO pulse_items (
    id,
    title,
    description,
    type,
    status,
    department,
    location_filter,
    questions,
    feedback_type,
    anonymous,
    allow_comments,
    visibility,
    tags,
    image_url,
    created_by_name,
    total_responses,
    total_views,
    total_likes,
    published_at,
    closes_at,
    is_featured,
    is_pinned,
    created_at,
    updated_at
) VALUES (
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    'Event Feedback: Digital Qatalyst Town Hall',
    'We''d love to hear your thoughts on the Digital Qatalyst Town Hall. Your feedback helps us improve future events!',
    'feedback',
    'published',
    'Stories',
    'Nairobi',
    '[
        {
            "id": "f1",
            "question": "What did you like most about the event?",
            "type": "text"
        },
        {
            "id": "f2",
            "question": "What could be improved?",
            "type": "text"
        },
        {
            "id": "f3",
            "question": "Rate your overall experience (1-5)",
            "type": "scale",
            "scale_min": 1,
            "scale_max": 5
        }
    ]'::jsonb,
    'general',
    false,
    true,
    'public',
    ARRAY['Event', 'Feedback'],
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'Events Team',
    450,
    600,
    89,
    '2025-11-16 00:00:00+00'::timestamptz,
    '2025-11-19 23:59:59+00'::timestamptz,
    false,
    false,
    '2025-11-16 00:00:00+00'::timestamptz,
    '2025-11-16 00:00:00+00'::timestamptz
);

-- =====================================================
-- 4. DWS Feedback: Share Your Experience (Feedback)
-- =====================================================
-- Note: Questions are stored in pulse_feedback_questions table via migration 20250106000005
-- This seed file creates the base pulse_item record

INSERT INTO pulse_items (
    id,
    title,
    description,
    type,
    status,
    department,
    location_filter,
    questions,
    feedback_type,
    anonymous,
    allow_comments,
    visibility,
    tags,
    image_url,
    created_by_name,
    total_responses,
    total_views,
    total_likes,
    published_at,
    closes_at,
    is_featured,
    is_pinned,
    created_at,
    updated_at
) VALUES (
    'd4e5f6a7-b8c9-0123-def0-234567890123'::uuid,
    'DWS Feedback: Share Your Experience',
    'Help us improve DWS! Share your thoughts on its usability, performance, and integration. Your feedback will guide future updates and enhance your experience.',
    'feedback',
    'published',
    'Solutions',
    'Riyadh',
    NULL,  -- Questions are stored in pulse_feedback_questions table
    'general',
    false,
    true,
    'public',
    ARRAY['DWS', 'Feedback', 'Product'],
    'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'Customer Success Team',
    100,
    250,
    12,
    '2025-11-18 00:00:00+00'::timestamptz,
    '2025-11-30 23:59:59+00'::timestamptz,
    false,
    false,
    '2025-11-18 00:00:00+00'::timestamptz,
    '2025-11-18 00:00:00+00'::timestamptz
);

-- =====================================================
-- 5. Marketing Campaign Feedback (Survey)
-- =====================================================

INSERT INTO pulse_items (
    id,
    title,
    description,
    type,
    status,
    department,
    location_filter,
    questions,
    survey_type,
    anonymous,
    allow_comments,
    visibility,
    tags,
    image_url,
    created_by_name,
    total_responses,
    total_views,
    total_likes,
    published_at,
    closes_at,
    is_featured,
    is_pinned,
    created_at,
    updated_at
) VALUES (
    'e5f6a7b8-c9d0-1234-ef01-345678901234'::uuid,
    'Marketing Campaign Feedback',
    'We''d like your input on our latest marketing campaign. Let us know how we can improve!',
    'survey',
    'published',
    'Intelligence',
    'Remote',
    '[
        {
            "id": "q1",
            "question": "How effective was the marketing campaign?",
            "type": "scale",
            "scale_min": 1,
            "scale_max": 5
        },
        {
            "id": "q2",
            "question": "What did you like about the campaign?",
            "type": "text"
        },
        {
            "id": "q3",
            "question": "What could be improved?",
            "type": "text"
        },
        {
            "id": "q4",
            "question": "Did the campaign influence your decision?",
            "type": "scale",
            "scale_min": 1,
            "scale_max": 5
        }
    ]'::jsonb,
    'single_page',
    false,
    true,
    'public',
    ARRAY['Marketing', 'Feedback', 'Campaign'],
    'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'Marketing Team',
    180,
    320,
    28,
    '2025-11-19 00:00:00+00'::timestamptz,
    '2025-11-25 23:59:59+00'::timestamptz,
    false,
    false,
    '2025-11-19 00:00:00+00'::timestamptz,
    '2025-11-19 00:00:00+00'::timestamptz
);

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify all items were inserted correctly:
-- SELECT id, title, type, status, department, location_filter, published_at 
-- FROM pulse_items 
-- ORDER BY published_at DESC;
