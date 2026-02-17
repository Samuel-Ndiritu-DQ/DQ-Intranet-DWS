/**
 * Script to check which strategy filter options have matching guides
 * This ensures each filter option has service cards related to it
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Strategy filter options
const STRATEGY_TYPES = [
  { id: 'journey', name: 'Journey' },
  { id: 'history', name: 'History' }
]

const STRATEGY_FRAMEWORKS = [
  { id: 'ghc', name: 'GHC' },
  { id: '6xd', name: '6xD (Digital Framework)' }
]

async function checkStrategyFilters() {
  console.log('🔍 Checking strategy filter coverage...\n')
  
  // Fetch all strategy guides
  const { data: guides, error } = await supabase
    .from('guides')
    .select('id, title, slug, sub_domain, domain, guide_type')
    .or('domain.ilike.%Strategy%,guide_type.ilike.%Strategy%')
    .eq('status', 'Approved')
  
  if (error) {
    console.error('❌ Error fetching guides:', error)
    return
  }
  
  console.log(`📊 Total Strategy Guides: ${guides?.length || 0}\n`)
  
  // Check Strategy Type coverage
  console.log('📋 Strategy Type Filter Coverage:')
  console.log('─'.repeat(50))
  
  for (const type of STRATEGY_TYPES) {
    const matching = guides?.filter(g => {
      const subDomain = (g.sub_domain || '').toLowerCase()
      return subDomain.includes(type.id.toLowerCase()) || 
             subDomain === type.id.toLowerCase()
    }) || []
    
    const hasCards = matching.length > 0
    const status = hasCards ? '✅' : '❌'
    console.log(`${status} ${type.name} (${type.id}): ${matching.length} guides`)
    
    if (matching.length > 0 && matching.length <= 5) {
      matching.forEach(g => {
        console.log(`   - ${g.title} (${g.slug})`)
      })
    } else if (matching.length > 5) {
      matching.slice(0, 3).forEach(g => {
        console.log(`   - ${g.title} (${g.slug})`)
      })
      console.log(`   ... and ${matching.length - 3} more`)
    }
  }
  
  console.log('\n')
  
  // Check Framework/Program coverage
  console.log('🔧 Framework/Program Filter Coverage:')
  console.log('─'.repeat(50))
  
  for (const framework of STRATEGY_FRAMEWORKS) {
    const matching = guides?.filter(g => {
      const subDomain = (g.sub_domain || '').toLowerCase()
      const domain = (g.domain || '').toLowerCase()
      const guideType = (g.guide_type || '').toLowerCase()
      const allText = `${subDomain} ${domain} ${guideType}`.toLowerCase()
      
      if (framework.id === '6xd') {
        return allText.includes('6xd') || 
               allText.includes('digital-framework') ||
               allText.includes('digital framework')
      } else if (framework.id === 'ghc') {
        return allText.includes('ghc') ||
               allText.includes('golden honeycomb')
      }
      return false
    }) || []
    
    const hasCards = matching.length > 0
    const status = hasCards ? '✅' : '❌'
    console.log(`${status} ${framework.name} (${framework.id}): ${matching.length} guides`)
    
    if (matching.length > 0 && matching.length <= 5) {
      matching.forEach(g => {
        console.log(`   - ${g.title} (${g.slug})`)
      })
    } else if (matching.length > 5) {
      matching.slice(0, 3).forEach(g => {
        console.log(`   - ${g.title} (${g.slug})`)
      })
      console.log(`   ... and ${matching.length - 3} more`)
    }
  }
  
  console.log('\n')
  
  // Summary
  console.log('📈 Summary:')
  console.log('─'.repeat(50))
  
  const strategyTypesWithCards = STRATEGY_TYPES.filter(type => {
    const matching = guides?.filter(g => {
      const subDomain = (g.sub_domain || '').toLowerCase()
      return subDomain.includes(type.id.toLowerCase()) || 
             subDomain === type.id.toLowerCase()
    }) || []
    return matching.length > 0
  })
  
  const frameworksWithCards = STRATEGY_FRAMEWORKS.filter(framework => {
    const matching = guides?.filter(g => {
      const subDomain = (g.sub_domain || '').toLowerCase()
      const domain = (g.domain || '').toLowerCase()
      const guideType = (g.guide_type || '').toLowerCase()
      const allText = `${subDomain} ${domain} ${guideType}`.toLowerCase()
      
      if (framework.id === '6xd') {
        return allText.includes('6xd') || 
               allText.includes('digital-framework') ||
               allText.includes('digital framework')
      } else if (framework.id === 'ghc') {
        return allText.includes('ghc') ||
               allText.includes('golden honeycomb')
      }
      return false
    }) || []
    return matching.length > 0
  })
  
  console.log(`Strategy Types with cards: ${strategyTypesWithCards.length}/${STRATEGY_TYPES.length}`)
  console.log(`Frameworks with cards: ${frameworksWithCards.length}/${STRATEGY_FRAMEWORKS.length}`)
  
  // Recommendations
  console.log('\n💡 Recommendations:')
  console.log('─'.repeat(50))
  
  const typesWithoutCards = STRATEGY_TYPES.filter(type => {
    const matching = guides?.filter(g => {
      const subDomain = (g.sub_domain || '').toLowerCase()
      return subDomain.includes(type.id.toLowerCase()) || 
             subDomain === type.id.toLowerCase()
    }) || []
    return matching.length === 0
  })
  
  const frameworksWithoutCards = STRATEGY_FRAMEWORKS.filter(framework => {
    const matching = guides?.filter(g => {
      const subDomain = (g.sub_domain || '').toLowerCase()
      const domain = (g.domain || '').toLowerCase()
      const guideType = (g.guide_type || '').toLowerCase()
      const allText = `${subDomain} ${domain} ${guideType}`.toLowerCase()
      
      if (framework.id === '6xd') {
        return allText.includes('6xd') || 
               allText.includes('digital-framework') ||
               allText.includes('digital framework')
      } else if (framework.id === 'ghc') {
        return allText.includes('ghc') ||
               allText.includes('golden honeycomb')
      }
      return false
    }) || []
    return matching.length === 0
  })
  
  if (typesWithoutCards.length > 0) {
    console.log(`⚠️  Remove Strategy Types without cards:`)
    typesWithoutCards.forEach(type => {
      console.log(`   - ${type.name} (${type.id})`)
    })
  }
  
  if (frameworksWithoutCards.length > 0) {
    console.log(`⚠️  Remove Frameworks without cards:`)
    frameworksWithoutCards.forEach(framework => {
      console.log(`   - ${framework.name} (${framework.id})`)
    })
  }
  
  if (typesWithoutCards.length === 0 && frameworksWithoutCards.length === 0) {
    console.log('✅ All filter options have matching guides!')
  }
}

checkStrategyFilters().catch(console.error)

