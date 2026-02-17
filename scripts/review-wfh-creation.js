import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function reviewWFHCreation() {
  console.log('🔍 Reviewing WFH Guidelines creation...\n');

  // Get Forum Guidelines as reference
  const { data: forumGuide } = await supabase
    .from('guides')
    .select('slug, title, body')
    .eq('slug', 'forum-guidelines')
    .maybeSingle();

  // Get WFH Guidelines
  const { data: wfhGuide } = await supabase
    .from('guides')
    .select('*')
    .eq('slug', 'dq-wfh-guidelines')
    .maybeSingle();

  if (!wfhGuide) {
    console.log('❌ WFH Guidelines not found');
    return;
  }

  console.log('='.repeat(80));
  console.log('WFH GUIDELINES - FULL CONTENT');
  console.log('='.repeat(80));
  console.log(wfhGuide.body);
  console.log('\n' + '='.repeat(80));

  // Analyze structure
  console.log('\n📊 STRUCTURE ANALYSIS');
  console.log('='.repeat(80));

  const featureBoxes = (wfhGuide.body?.match(/<div class="feature-box">/g) || []).length;
  const sections = (wfhGuide.body?.match(/##\s+[^\n]+/g) || []).length;
  const tables = (wfhGuide.body?.match(/\|.*\|/g) || []).length;
  const bulletPoints = (wfhGuide.body?.match(/^-\s+/gm) || []).length;

  console.log(`\n📦 Feature Boxes: ${featureBoxes}`);
  console.log(`📑 Sections (H2): ${sections}`);
  console.log(`📊 Table rows: ${Math.floor(tables / 3)} (estimated)`);
  console.log(`• Bullet points: ${bulletPoints}`);

  // Extract sections
  const sectionMatches = wfhGuide.body?.match(/##\s+([^\n]+)/g) || [];
  console.log(`\n📋 Sections List:`);
  sectionMatches.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.replace('## ', '').trim()}`);
  });

  // Check for tables
  const hasCoreComponentsTable = wfhGuide.body?.includes('| # | Program | Description |');
  const hasRolesTable = wfhGuide.body?.includes('| Key Steps | Description |');

  console.log(`\n📊 Tables:`);
  console.log(`   Core Components: ${hasCoreComponentsTable ? '✅' : '❌'}`);
  console.log(`   Roles & Responsibilities: ${hasRolesTable ? '✅' : '❌'}`);

  // Compare with Forum Guidelines format
  if (forumGuide) {
    console.log('\n' + '='.repeat(80));
    console.log('COMPARISON WITH FORUM GUIDELINES');
    console.log('='.repeat(80));

    const forumBoxes = (forumGuide.body?.match(/<div class="feature-box">/g) || []).length;
    const forumSections = (forumGuide.body?.match(/##\s+[^\n]+/g) || []).length;
    const forumBullets = (forumGuide.body?.match(/^-\s+/gm) || []).length;

    console.log(`\nFeature Boxes:`);
    console.log(`   Forum: ${forumBoxes}`);
    console.log(`   WFH: ${featureBoxes}`);
    console.log(`   Match: ${featureBoxes > 0 ? '✅' : '❌'}`);

    console.log(`\nSections:`);
    console.log(`   Forum: ${forumSections}`);
    console.log(`   WFH: ${sections}`);
    console.log(`   Match: ${sections > 0 ? '✅' : '❌'}`);

    console.log(`\nBullet Points:`);
    console.log(`   Forum: ${forumBullets}`);
    console.log(`   WFH: ${bulletPoints}`);
    console.log(`   Match: ${bulletPoints > 0 ? '✅' : '❌'}`);

    // Check format style
    console.log(`\n📐 Format Style Check:`);
    const wfhHasLongParagraphs = (wfhGuide.body?.match(/[^.\n]{200,}/g) || []).length;
    const forumHasLongParagraphs = (forumGuide.body?.match(/[^.\n]{200,}/g) || []).length;
    
    console.log(`   Long paragraphs (>200 chars):`);
    console.log(`   Forum: ${forumHasLongParagraphs}`);
    console.log(`   WFH: ${wfhHasLongParagraphs}`);
    console.log(`   Issue: ${wfhHasLongParagraphs > forumHasLongParagraphs ? '⚠️ WFH has more long paragraphs' : '✅'}`);

    // Check for context/overview sections (should be minimal)
    const hasContext = wfhGuide.body?.includes('Context') || wfhGuide.body?.includes('context');
    const hasOverview = wfhGuide.body?.includes('Overview') || wfhGuide.body?.includes('overview');
    
    console.log(`\n⚠️  Potential Issues:`);
    if (hasContext) {
      console.log(`   ❌ Has "Context" section - Forum Guidelines don't have this`);
    }
    if (hasOverview) {
      console.log(`   ⚠️  Has "Overview" section - Forum Guidelines don't have this`);
    }
    if (!hasContext && !hasOverview) {
      console.log(`   ✅ No Context/Overview sections - matches Forum format`);
    }
  }

  // Check content length per section
  console.log('\n' + '='.repeat(80));
  console.log('CONTENT LENGTH PER SECTION');
  console.log('='.repeat(80));

  const featureBoxRegex = /<div class="feature-box">\s*\n([\s\S]*?)\n\s*<\/div>/g;
  let match;
  let sectionNum = 1;
  
  while ((match = featureBoxRegex.exec(wfhGuide.body || '')) !== null) {
    const sectionContent = match[1].trim();
    const headingMatch = sectionContent.match(/^##\s+(.+)$/m);
    const heading = headingMatch ? headingMatch[1] : 'No heading';
    const contentLength = sectionContent.length;
    const hasTable = sectionContent.includes('|');
    const bulletCount = (sectionContent.match(/^-\s+/gm) || []).length;
    
    console.log(`\nSection ${sectionNum}: ${heading}`);
    console.log(`   Length: ${contentLength} chars`);
    console.log(`   Has table: ${hasTable ? '✅' : '❌'}`);
    console.log(`   Bullet points: ${bulletCount}`);
    
    // Show first 150 chars
    const preview = sectionContent.replace(/##\s+[^\n]+\n/, '').trim().substring(0, 150);
    console.log(`   Preview: ${preview}${preview.length >= 150 ? '...' : ''}`);
    
    sectionNum++;
  }

  // Final assessment
  console.log('\n' + '='.repeat(80));
  console.log('FINAL ASSESSMENT');
  console.log('='.repeat(80));
  
  const issues = [];
  const good = [];

  if (featureBoxes < 5) {
    issues.push('Too few feature boxes');
  } else {
    good.push(`Has ${featureBoxes} feature boxes`);
  }

  if (!hasCoreComponentsTable || !hasRolesTable) {
    issues.push('Missing required tables');
  } else {
    good.push('Has both required tables');
  }

  if (sections < 5) {
    issues.push('Too few sections');
  } else {
    good.push(`Has ${sections} sections`);
  }

  if (bulletPoints < 5) {
    issues.push('Too few bullet points');
  } else {
    good.push(`Has ${bulletPoints} bullet points`);
  }

  console.log(`\n✅ Good:`);
  good.forEach(g => console.log(`   - ${g}`));

  if (issues.length > 0) {
    console.log(`\n❌ Issues:`);
    issues.forEach(i => console.log(`   - ${i}`));
  } else {
    console.log(`\n✅ No major issues found!`);
  }

  console.log(`\n📋 Overall: ${issues.length === 0 ? '✅ Format looks correct!' : '⚠️  Some issues to address'}`);
}

reviewWFHCreation().catch(console.error);


