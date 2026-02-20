const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAllProducts() {
  try {
    // Get all products in the Products domain
    const { data, error } = await supabase
      .from('guides')
      .select('id, slug, title, domain, guide_type')
      .eq('domain', 'Products');

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('All products in Products domain:');
    data.forEach(item => {
      console.log(`- ${item.title} (${item.slug}) - Type: ${item.guide_type}`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

findAllProducts();
