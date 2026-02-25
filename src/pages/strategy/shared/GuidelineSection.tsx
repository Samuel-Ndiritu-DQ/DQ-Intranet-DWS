import React from 'react'

interface GuidelineSectionProps {
  id: string
  title: string
  children: React.ReactNode
}

// Helper function to parse content with type markers
function parseContentWithMarkers(content: string) {
  const contentTypes = {
    'HIGHLIGHT:': { className: 'font-semibold text-gray-900' },
    'PROBLEM:': { className: 'font-semibold text-gray-900' },
    'KEY_INSIGHT:': { className: 'font-medium text-gray-700 bg-gray-50 border-l-4 border-gray-300 pl-4 py-3 my-4' },
    'CONSEQUENCE:': { className: 'font-semibold text-gray-900' },
    'FEATURES:': { className: 'font-semibold text-gray-900' },
    'CAPABILITIES:': { className: 'font-semibold text-gray-900' },
    'DELIVERS:': { className: 'font-semibold text-gray-900' },
    'ARCHITECTURE:': { className: 'font-normal text-gray-700' },
    'USAGE:': { className: 'font-semibold text-gray-900' },
    'AI_PERSONAS:': { className: 'font-semibold text-gray-900' },
    'MODELS:': { className: 'font-normal text-gray-700' },
    'RESULTS:': { className: 'font-normal text-gray-700' },
    'DIFFERENTIATORS:': { className: 'font-normal text-gray-700' },
    'QUESTION:': { className: 'font-normal text-gray-700' },
    'CTA:': { className: 'font-semibold text-center text-gray-900 text-lg' }
  }

  for (const [marker, config] of Object.entries(contentTypes)) {
    if (content.startsWith(marker)) {
      const text = content.substring(marker.length).trim()
      return {
        type: marker,
        text,
        config
      }
    }
  }
  
  return null
}

export function GuidelineSection({ id, title, children }: GuidelineSectionProps) {
  const isProTipSection = title.toLowerCase().startsWith('pro tip')

  if (isProTipSection) {
    return (
      <section id={id} className="mb-16 scroll-mt-24">
        <div
          className="mb-6 p-6 rounded-lg border-l-4"
          style={{ backgroundColor: 'var(--guidelines-primary-surface)', borderColor: 'var(--guidelines-primary)' }}
        >
          <p className="text-lg font-semibold text-gray-800 mb-2">
            {title}
          </p>
          <div className="text-gray-700 leading-relaxed">
            {children}
          </div>
        </div>
      </section>
    )
  }

  // Process children to handle lists and content types
  const processedChildren = React.Children.toArray(children)
  const enhancedChildren: React.ReactNode[] = []
  let currentList: string[] = []
  let inList = false

  processedChildren.forEach((child, index) => {
    if (React.isValidElement(child) && typeof child.props.children === 'string') {
      const content = child.props.children
      
      if (content === 'LIST_START') {
        inList = true
        currentList = []
        return
      }
      
      if (content === 'LIST_END') {
        if (currentList.length > 0) {
          enhancedChildren.push(
            <ul key={`list-${index}`} className="mb-6 ml-4 space-y-2">
              {currentList.map((item, idx) => {
                // Check if the item has a colon to make text before it bold
                const colonIndex = item.indexOf(':')
                if (colonIndex > 0) {
                  const beforeColon = item.substring(0, colonIndex)
                  const afterColon = item.substring(colonIndex)
                  return (
                    <li key={idx} className="flex items-start">
                      <span className="text-gray-700 text-base leading-relaxed">
                        • <strong>{beforeColon}</strong>{afterColon}
                      </span>
                    </li>
                  )
                } else {
                  return (
                    <li key={idx} className="flex items-start">
                      <span className="text-gray-700 text-base leading-relaxed">• {item}</span>
                    </li>
                  )
                }
              })}
            </ul>
          )
        }
        inList = false
        currentList = []
        return
      }
      
      if (inList && content.trim() !== '') {
        currentList.push(content)
        return
      }
      
      // Handle empty paragraphs
      if (content.trim() === '') {
        enhancedChildren.push(<div key={index} className="mb-4" />)
        return
      }
      
      // Parse content with markers
      const parsed = parseContentWithMarkers(content)
      
      if (parsed) {
        const { text, config } = parsed
        
        if (parsed.type === 'KEY_INSIGHT:') {
          enhancedChildren.push(
            <div key={index} className={config.className}>
              {text}
            </div>
          )
        } else {
          // Check if the text contains a colon or question mark, indicating a label followed by content
          const colonIndex = text.indexOf(':')
          const questionIndex = text.indexOf('?')
          
          // Find the first separator (colon or question mark) within first 50 chars
          let separatorIndex = -1
          let separator = ''
          
          if (colonIndex > 0 && colonIndex < 50) {
            separatorIndex = colonIndex
            separator = ':'
          }
          if (questionIndex > 0 && questionIndex < 50 && (separatorIndex === -1 || questionIndex < separatorIndex)) {
            separatorIndex = questionIndex
            separator = '?'
          }
          
          if (separatorIndex > 0) {
            const label = text.substring(0, separatorIndex + 1)
            const content = text.substring(separatorIndex + 1).trim()
            
            enhancedChildren.push(
              <div key={index} className="mb-4">
                <div className={`font-semibold text-gray-900 mb-2`}>{label}</div>
                {content && <div className="text-gray-700 text-base leading-relaxed">{content}</div>}
              </div>
            )
          } else {
            // No clear label separation, render as single block
            enhancedChildren.push(
              <div key={index} className={`mb-4 ${config.className}`}>
                {text}
              </div>
            )
          }
        }
        return
      }
      
      // Regular content - handle inline markdown
      const processInlineMarkdown = (text: string) => {
        // Handle bold text **text**
        const parts = text.split(/(\*\*[^*]+\*\*)/g)
        return parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2)
            return <strong key={idx} className="text-gray-900 font-semibold">{boldText}</strong>
          }
          return part
        })
      }

      enhancedChildren.push(
        <p key={index} className="mb-4 text-gray-700 text-base leading-relaxed">
          {processInlineMarkdown(content)}
        </p>
      )
    } else if (!inList) {
      enhancedChildren.push(child)
    }
  })

  return (
    <section id={id} className="mb-12 scroll-mt-24">
      {/* Title with decorative left border */}
      <div className="relative flex items-center mb-6">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#030E31] via-[#0A1A3B] to-transparent"></div>
        <h2 className="text-2xl font-bold text-gray-900 pl-6 leading-tight">
          {title}
        </h2>
      </div>
      
      {/* Content */}
      <div className="space-y-4 pl-6">
        {enhancedChildren}
      </div>
    </section>
  )
}

