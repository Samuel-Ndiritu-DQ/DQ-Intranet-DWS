const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const competencySlugs = [
  'dq-competencies-emotional-intelligence',
  'dq-competencies-growth-mindset',
  'dq-competencies-trust',
  'dq-competencies-responsibility',
  'dq-competencies-perseverance',
  'dq-competencies-proactive',
  'dq-competencies-precision',
  'dq-competencies-learning',
  'dq-competencies-perceptive',
  'dq-competencies-purpose',
  'dq-competencies-customer',
  'dq-competencies-collaboration'
];

async function fixAllCompetencies() {
  console.log('Starting to fix all competency pages...\n');
  
  for (const slug of competencySlugs) {
    try {
      const { data: guide, error: fetchError } = await supabase
        .from('guides')
        .select('body')
        .eq('slug', slug)
        .single();

      if (fetchError) {
        console.error(`❌ Error fetching ${slug}:`, fetchError.message);
        continue;
      }

      if (!guide) {
        console.log(`⚠️  ${slug} not found, skipping...`);
        continue;
      }

      // Remove the "# Introduction" heading at the start
      let updatedBody = guide.body.replace(/^#\s+Introduction\s*\n+/m, '');

      // Only update if there was a change
      if (updatedBody !== guide.body) {
        const { error } = await supabase
          .from('guides')
          .update({ body: updatedBody })
          .eq('slug', slug);

        if (error) {
          console.error(`❌ Error updating ${slug}:`, error.message);
        } else {
          console.log(`✅ Updated ${slug}`);
        }
      } else {
        console.log(`⏭️  ${slug} - no changes needed`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${slug}:`, err.message);
    }
  }
  
  console.log('\n✅ All competency pages processed!');
}

fixAllCompetencies();
