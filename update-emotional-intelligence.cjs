const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateEmotionalIntelligence() {
  try {
    // First, get the current content
    const { data: guide, error: fetchError } = await supabase
      .from('guides')
      .select('body')
      .eq('slug', 'dq-competencies-emotional-intelligence')
      .single();

    if (fetchError) {
      console.error('Error fetching guide:', fetchError);
      return;
    }

    console.log('Current body preview:', guide.body.substring(0, 300));

    // Replace "## Overview\n\n### Introduction" with "## Introduction"
    const updatedBody = guide.body.replace(/## Overview\s*\n\s*### Introduction/g, '## Introduction');

    // Update the guide
    const { data, error } = await supabase
      .from('guides')
      .update({ body: updatedBody })
      .eq('slug', 'dq-competencies-emotional-intelligence')
      .select();

    if (error) {
      console.error('Error updating guide:', error);
    } else {
      console.log('✅ Successfully updated Emotional Intelligence guide');
      console.log('Updated body preview:', updatedBody.substring(0, 300));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

updateEmotionalIntelligence();
