import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_JWT_SECRET;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Update guides to categorize them under "journey" or "history" sub_domain
 * 
 * Journey: Vision and Mission related guides
 * History: Guides about where DQ began, DQ origin, DQ history
 */
async function updateStrategySubdomains() {
  console.log('🔍 Searching for guides to categorize...\n');

  try {
    // 1. Find Vision and Mission guides - categorize as "journey"
    const visionMissionSlugs = [
      'dq-vision-and-mission',
      'dq-vision-mission',
      'dq-vision',
      'dq-mission',
      'vision-and-mission',
      'vision-mission'
    ];

    const visionMissionTitles = [
      'vision',
      'mission',
      'dq vision',
      'dq mission'
    ];

    console.log('📋 Step 1: Finding Vision & Mission guides for "journey" category...');
    
    // Search by slug
    const { data: guidesBySlug, error: slugError } = await supabase
      .from('guides')
      .select('id, slug, title, sub_domain, domain')
      .in('slug', visionMissionSlugs);

    if (slugError) {
      console.error('Error fetching by slug:', slugError);
    }

    // Search by title (case-insensitive)
    const { data: guidesByTitle, error: titleError } = await supabase
      .from('guides')
      .select('id, slug, title, sub_domain, domain')
      .or(visionMissionTitles.map(title => `title.ilike.%${title}%`).join(','));

    if (titleError) {
      console.error('Error fetching by title:', titleError);
    }

    // Combine and deduplicate
    const allVisionMissionGuides = [
      ...(guidesBySlug || []),
      ...(guidesByTitle || [])
    ].filter((guide, index, self) => 
      index === self.findIndex(g => g.id === guide.id)
    );

    console.log(`   Found ${allVisionMissionGuides.length} Vision/Mission guide(s):`);
    allVisionMissionGuides.forEach(guide => {
      console.log(`   - ${guide.title} (${guide.slug})`);
    });

    // Update Vision/Mission guides to include "journey" in sub_domain
    for (const guide of allVisionMissionGuides) {
      const currentSubDomain = guide.sub_domain || '';
      const subDomains = currentSubDomain.split(',').map(s => s.trim()).filter(Boolean);
      
      if (!subDomains.includes('journey')) {
        subDomains.push('journey');
        const newSubDomain = subDomains.join(',');
        
        const { error: updateError } = await supabase
          .from('guides')
          .update({ sub_domain: newSubDomain })
          .eq('id', guide.id);

        if (updateError) {
          console.error(`   ❌ Failed to update ${guide.title}:`, updateError);
        } else {
          console.log(`   ✅ Updated ${guide.title}: sub_domain = "${newSubDomain}"`);
        }
      } else {
        console.log(`   ⏭️  ${guide.title} already has "journey" in sub_domain`);
      }
    }

    // 2. Find History guides - categorize as "history"
    console.log('\n📋 Step 2: Finding History guides for "history" category...');
    
    const historyKeywords = [
      'where dq began',
      'dq began',
      'dq origin',
      'dq history',
      'dq founding',
      'dq started',
      'dq beginning',
      'how dq started',
      'dq story',
      'dq evolution'
    ];

    // Search by title and summary for history-related content
    const { data: historyGuides, error: historyError } = await supabase
      .from('guides')
      .select('id, slug, title, sub_domain, domain, summary')
      .or(historyKeywords.map(keyword => 
        `title.ilike.%${keyword}%,summary.ilike.%${keyword}%`
      ).join(','));

    if (historyError) {
      console.error('Error fetching history guides:', historyError);
    }

    // Also check for guides with "history" in slug
    const { data: historyBySlug, error: historySlugError } = await supabase
      .from('guides')
      .select('id, slug, title, sub_domain, domain')
      .ilike('slug', '%history%');

    if (historySlugError) {
      console.error('Error fetching history guides by slug:', historySlugError);
    }

    // Combine and deduplicate
    const allHistoryGuides = [
      ...(historyGuides || []),
      ...(historyBySlug || [])
    ].filter((guide, index, self) => 
      index === self.findIndex(g => g.id === guide.id)
    );

    console.log(`   Found ${allHistoryGuides.length} History guide(s):`);
    allHistoryGuides.forEach(guide => {
      console.log(`   - ${guide.title} (${guide.slug})`);
    });

    // Update History guides to include "history" in sub_domain
    for (const guide of allHistoryGuides) {
      const currentSubDomain = guide.sub_domain || '';
      const subDomains = currentSubDomain.split(',').map(s => s.trim()).filter(Boolean);
      
      if (!subDomains.includes('history')) {
        subDomains.push('history');
        const newSubDomain = subDomains.join(',');
        
        const { error: updateError } = await supabase
          .from('guides')
          .update({ sub_domain: newSubDomain })
          .eq('id', guide.id);

        if (updateError) {
          console.error(`   ❌ Failed to update ${guide.title}:`, updateError);
        } else {
          console.log(`   ✅ Updated ${guide.title}: sub_domain = "${newSubDomain}"`);
        }
      } else {
        console.log(`   ⏭️  ${guide.title} already has "history" in sub_domain`);
      }
    }

    console.log('\n✅ Update complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Vision/Mission guides updated: ${allVisionMissionGuides.length}`);
    console.log(`   - History guides updated: ${allHistoryGuides.length}`);

  } catch (error) {
    console.error('❌ Error updating guides:', error);
    process.exit(1);
  }
}

// Run the update
updateStrategySubdomains();

