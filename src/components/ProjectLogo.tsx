import { useState } from 'react'

interface ProjectLogoProps {
  name: string
  imageUrl: string | null
  size?: 'sm' | 'md' | 'lg'
}

export function ProjectLogo({ name, imageUrl, size = 'md' }: ProjectLogoProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl',
  }

  const containerClass = `${sizeClasses[size]} rounded-lg flex items-center justify-center font-bold shrink-0 overflow-hidden bg-gradient-to-br from-[#1a1a1d] to-[#0f0f11]`

  // Fallback: initials from project name
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={containerClass}>
      {imageUrl && !imageError ? (
        <>
          <img
            src={imageUrl}
            alt={name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.warn(`Failed to load image for ${name}: ${imageUrl}`)
              setImageError(true)
            }}
          />
          {!imageLoaded && (
            <span className="text-[#6b6b70]">{initials}</span>
          )}
        </>
      ) : (
        <span className="text-[#6b6b70]">{initials}</span>
      )}
    </div>
  )
}
