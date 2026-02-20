const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDTO4T() {
  try {
    // First, check if DTO4T exists
    const { data: existing, error: fetchError } = await supabase
      .from('guides')
      .select('id, slug, title')
      .ilike('slug', '%dto4t%');

    if (fetchError) {
      console.log('Error fetching:', fetchError.message);
      return;
    }

    if (!existing || existing.length === 0) {
      console.log('DTO4T not found');
      return;
    }

    console.log('Found DTO4T records:', existing);

    // Delete all matching records
    for (const record of existing) {
      const { error: deleteError } = await supabase
        .from('guides')
        .delete()
        .eq('id', record.id);

      if (deleteError) {
        console.error(`Error deleting ${record.slug}:`, deleteError);
      } else {
        console.log(`✅ Successfully deleted ${record.slug}!`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

removeDTO4T();
