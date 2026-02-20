const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAllBlueprints() {
  try {
    // Get all guides and check their domains
    const { data, error } = await supabase
      .from('guides')
      .select('id, slug, title, domain, guide_type, status')
      .order('title');

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`Total guides: ${data.length}\n`);
    
    // Group by domain
    const byDomain = {};
    data.forEach(item => {
      const domain = item.domain || 'No Domain';
      if (!byDomain[domain]) byDomain[domain] = [];
      byDomain[domain].push(item);
    });

    Object.keys(byDomain).sort().forEach(domain => {
      console.log(`\n${domain} (${byDomain[domain].length} items):`);
      byDomain[domain].forEach(item => {
        console.log(`  - ${item.title} (${item.slug}) [${item.guide_type || 'no type'}]`);
      });
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

findAllBlueprints();
