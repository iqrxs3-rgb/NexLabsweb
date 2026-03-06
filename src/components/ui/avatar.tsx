import React from 'react'

export function Avatar({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <span className={className || ''} style={{ display: 'inline-block' }}>{children}</span>
}

export function AvatarImage({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="h-8 w-8 rounded-full" />
}

export function AvatarFallback({ children }: { children?: React.ReactNode }) {
  return <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs">
    {children ?? 'U'}
  </span>
}
