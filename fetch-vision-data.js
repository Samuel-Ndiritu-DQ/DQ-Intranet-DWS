const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchVisionData() {
  try {
    console.log('Fetching Vision guide data...')
    
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .eq('slug', 'dq-vision')
      .single()
    
    if (error) {
      console.error('Error fetching data:', error)
      return
    }
    
    if (data) {
      console.log('✅ Vision Guide Data Found:')
      console.log('ID:', data.id)
      console.log('Title:', data.title)
      console.log('Slug:', data.slug)
      console.log('Body Length:', data.body?.length || 0)
      console.log('Hero Image URL:', data.hero_image_url)
      console.log('Created At:', data.created_at)
      console.log('Updated At:', data.updated_at)
      
      console.log('\n--- BODY CONTENT ---')
      console.log(data.body)
      
      console.log('\n--- BODY PREVIEW (first 500 chars) ---')
      console.log(data.body?.substring(0, 500) + '...')
      
      // Check if body has markdown structure
      if (data.body) {
        const hasHeadings = data.body.includes('# ') || data.body.includes('## ')
        const hasLists = data.body.includes('- ') || data.body.includes('* ')
        const hasCodeBlocks = data.body.includes('```')
        
        console.log('\n--- CONTENT ANALYSIS ---')
        console.log('Has Headings:', hasHeadings)
        console.log('Has Lists:', hasLists)
        console.log('Has Code Blocks:', hasCodeBlocks)
        
        // Extract first paragraph
        const firstParagraph = data.body.split('\n\n')[0]
        console.log('First Paragraph:', firstParagraph)
      }
    } else {
      console.log('❌ No Vision guide found in database')
    }
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

fetchVisionData()
