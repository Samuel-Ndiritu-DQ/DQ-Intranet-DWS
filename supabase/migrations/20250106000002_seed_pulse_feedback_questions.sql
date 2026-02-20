-- Migration: Seed pulse_feedback_questions with Digital Qatalyst Townhall questions
-- Description: Inserts all feedback questions organized by category
-- Date: 2025-01-06

-- Get the event ID for "Digital Qatalyst Town Hall" pulse item
DO $$
DECLARE
  townhall_event_id UUID;
  question_order INTEGER := 0;
BEGIN
  -- Find the pulse item ID for Digital Qatalyst Town Hall
  SELECT id INTO townhall_event_id
  FROM pulse_items
  WHERE title ILIKE '%Digital Qatalyst Town Hall%'
  OR title ILIKE '%Digital Qatalyst Townhall%'
  LIMIT 1;

  -- If not found, use the known ID from seed file
  IF townhall_event_id IS NULL THEN
    townhall_event_id := 'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid;
  END IF;

  -- Only insert if questions don't already exist for this event
  IF NOT EXISTS (
    SELECT 1 FROM pulse_feedback_questions 
    WHERE event_id = townhall_event_id
  ) THEN
    -- Event Content & Value
    INSERT INTO pulse_feedback_questions (category, question, event_id, question_type, scale_min, scale_max, display_order) VALUES
    ('Event Content & Value', 'What did you like the most about the Townhall?', townhall_event_id, 'text', NULL, NULL, question_order + 1),
    ('Event Content & Value', 'What stuck with you the most from the Townhall?', townhall_event_id, 'text', NULL, NULL, question_order + 2),
    ('Event Content & Value', 'What part of the Townhall did you find most valuable?', townhall_event_id, 'text', NULL, NULL, question_order + 3),
    ('Event Content & Value', 'How useful was the information shared during the Townhall?', townhall_event_id, 'scale', 1, 5, question_order + 4),
    ('Event Content & Value', 'Do you feel the content was aligned with your work and priorities?', townhall_event_id, 'scale', 1, 5, question_order + 5);

    question_order := question_order + 5;

    -- Engagement & Interaction
    INSERT INTO pulse_feedback_questions (category, question, event_id, question_type, scale_min, scale_max, display_order) VALUES
    ('Engagement & Interaction', 'How engaging did you find the Townhall overall?', townhall_event_id, 'scale', 1, 5, question_order + 1),
    ('Engagement & Interaction', 'How effective was the Q&A session?', townhall_event_id, 'scale', 1, 5, question_order + 2),
    ('Engagement & Interaction', 'Did you feel there were enough opportunities to participate or share input?', townhall_event_id, 'scale', 1, 5, question_order + 3),
    ('Engagement & Interaction', 'Would you have liked more interaction or networking opportunities?', townhall_event_id, 'text', NULL, NULL, question_order + 4);

    question_order := question_order + 4;

    -- Reflection & Takeaways
    INSERT INTO pulse_feedback_questions (category, question, event_id, question_type, scale_min, scale_max, display_order) VALUES
    ('Reflection & Takeaways', 'What is one practical action you plan to implement after this Townhall?', townhall_event_id, 'text', NULL, NULL, question_order + 1),
    ('Reflection & Takeaways', 'What new ideas will you focus on implementing in your role?', townhall_event_id, 'text', NULL, NULL, question_order + 2),
    ('Reflection & Takeaways', 'What''s one thing you will do differently after attending?', townhall_event_id, 'text', NULL, NULL, question_order + 3),
    ('Reflection & Takeaways', 'Was there a specific insight or moment that inspired you?', townhall_event_id, 'text', NULL, NULL, question_order + 4);

    question_order := question_order + 4;

    -- Event Logistics & Experience
    INSERT INTO pulse_feedback_questions (category, question, event_id, question_type, scale_min, scale_max, display_order) VALUES
    ('Event Logistics & Experience', 'How would you rate the overall experience?', townhall_event_id, 'scale', 1, 5, question_order + 1),
    ('Event Logistics & Experience', 'How satisfied were you with the virtual platform?', townhall_event_id, 'scale', 1, 5, question_order + 2),
    ('Event Logistics & Experience', 'Did you face any technical issues?', townhall_event_id, 'text', NULL, NULL, question_order + 3),
    ('Event Logistics & Experience', 'Was the pacing of the event appropriate?', townhall_event_id, 'scale', 1, 5, question_order + 4),
    ('Event Logistics & Experience', 'How would you rate the effectiveness of the presenters?', townhall_event_id, 'scale', 1, 5, question_order + 5);

    question_order := question_order + 5;

    -- Improvements & Suggestions
    INSERT INTO pulse_feedback_questions (category, question, event_id, question_type, scale_min, scale_max, display_order) VALUES
    ('Improvements & Suggestions', 'What could be improved for future Townhalls?', townhall_event_id, 'text', NULL, NULL, question_order + 1),
    ('Improvements & Suggestions', 'Any specific topics or speakers you want next time?', townhall_event_id, 'text', NULL, NULL, question_order + 2),
    ('Improvements & Suggestions', 'General suggestions for improving structure or content?', townhall_event_id, 'text', NULL, NULL, question_order + 3);

    question_order := question_order + 3;

    -- Overall Impact
    INSERT INTO pulse_feedback_questions (category, question, event_id, question_type, scale_min, scale_max, display_order) VALUES
    ('Overall Impact', 'Do you feel more connected to the company after attending?', townhall_event_id, 'scale', 1, 5, question_order + 1),
    ('Overall Impact', 'Did the Townhall increase your motivation or connection?', townhall_event_id, 'scale', 1, 5, question_order + 2),
    ('Overall Impact', 'Did it change your perspective on any topic? How?', townhall_event_id, 'text', NULL, NULL, question_order + 3),
    ('Overall Impact', 'Would you like follow-up materials (recording, summary, action points)?', townhall_event_id, 'text', NULL, NULL, question_order + 4);

    RAISE NOTICE 'Successfully seeded % feedback questions for Digital Qatalyst Townhall', question_order + 4;
  ELSE
    RAISE NOTICE 'Questions already exist for this event. Skipping seed.';
  END IF;
END $$;

