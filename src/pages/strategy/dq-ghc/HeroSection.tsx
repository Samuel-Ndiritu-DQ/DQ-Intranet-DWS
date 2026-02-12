import React from 'react'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  imageUrl?: string
  badge?: string
}

export function HeroSection({ 
  title = 'DQ Golden Honeycomb of Competencies (GHC)', 
  subtitle = 'DQ Leadership • Digital Qatalyst',
  imageUrl,
  badge = 'Strategy Framework'
}: HeroSectionProps) {
  return (
    <div className="relative w-full h-[325px] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920)',
        }}
      >
        <div className="absolute inset-0 bg-[#030E31] bg-opacity-80"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-24 text-white">
        <div className="max-w-4xl">
          {badge && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-4">
              {badge}
            </span>
          )}

          <div className="text-sm text-white/90 mb-6 font-inter">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>

          <h1 className="text-[28px] font-bold mb-8 leading-tight font-inter whitespace-nowrap">
            {title}
          </h1>

          {subtitle && (
            <div className="flex items-center gap-3 text-[14px] text-white/90 font-inter">
              <span>{subtitle}</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20"></div>
    </div>
  )
}

