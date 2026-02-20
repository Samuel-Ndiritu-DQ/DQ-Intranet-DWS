const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllProducts() {
  try {
    // Search for all products that might be shown on blueprints page
    const { data, error } = await supabase
      .from('guides')
      .select('id, slug, title, domain, guide_type, status')
      .or('title.ilike.%dtmp%,title.ilike.%dto4t%,title.ilike.%tmaas%,title.ilike.%dtma%,title.ilike.%dtmb%,title.ilike.%dtmi%,title.ilike.%plant%');

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Found products:');
    data.forEach(item => {
      console.log(`\n- Title: ${item.title}`);
      console.log(`  Slug: ${item.slug}`);
      console.log(`  Domain: ${item.domain}`);
      console.log(`  Type: ${item.guide_type}`);
      console.log(`  Status: ${item.status}`);
      console.log(`  ID: ${item.id}`);
    });

    console.log(`\n\nTotal found: ${data.length}`);
  } catch (err) {
    console.error('Error:', err);
  }
}

checkAllProducts();
