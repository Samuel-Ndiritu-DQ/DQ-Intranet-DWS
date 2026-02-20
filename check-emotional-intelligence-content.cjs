const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContent() {
  try {
    const { data: guide, error } = await supabase
      .from('guides')
      .select('body')
      .eq('slug', 'dq-competencies-emotional-intelligence')
      .single();

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('First 800 characters of body:');
    console.log(guide.body.substring(0, 800));
    console.log('\n---\n');
  } catch (err) {
    console.error('Error:', err);
  }
}

checkContent();
