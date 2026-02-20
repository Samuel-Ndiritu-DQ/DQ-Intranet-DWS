const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findDTO4T() {
  try {
    // Get all blueprint products
    const { data, error } = await supabase
      .from('guides')
      .select('id, slug, title')
      .eq('guide_type', 'blueprint');

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('All blueprint products:');
    data.forEach(item => {
      console.log(`- ${item.title} (${item.slug})`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

findDTO4T();
