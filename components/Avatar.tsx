'use client'

import { useState } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'

interface AvatarProps {
  src: string
  alt: string
  size?: number
  className?: string
}

export default function Avatar({ src, alt, size = 64, className = '' }: AvatarProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-purple-500/10 dark:bg-purple-500/10 rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <User className="w-1/2 h-1/2 text-purple-600 dark:text-purple-400" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={() => setError(true)}
    />
  )
} 