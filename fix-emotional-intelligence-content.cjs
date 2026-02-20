const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixContent() {
  try {
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

    // Remove the "# Introduction" heading at the start
    let updatedBody = guide.body.replace(/^#\s+Introduction\s*\n+/m, '');

    console.log('\nUpdated body preview:', updatedBody.substring(0, 300));

    // Update the guide
    const { data, error } = await supabase
      .from('guides')
      .update({ body: updatedBody })
      .eq('slug', 'dq-competencies-emotional-intelligence')
      .select();

    if (error) {
      console.error('Error updating guide:', error);
    } else {
      console.log('\n✅ Successfully updated Emotional Intelligence guide');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

fixContent();
