import { ReactNode } from 'react'

interface TagProps {
  tone?: 'accent' | 'neutral' | 'outline'
  children: ReactNode
}

export function Tag({ tone = 'neutral', children }: TagProps) {
  const toneClasses = {
    accent: 'tag-accent',
    neutral: 'tag-neutral',
    outline: 'tag-outline',
  }

  return <span className={`tag ${toneClasses[tone]}`}>{children}</span>
}
