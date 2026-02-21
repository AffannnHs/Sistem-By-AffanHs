import { cn } from '@/lib/utils'

import type React from 'react'

export default function Chip({
  className,
  children,
}: {
  className: string
  children: React.ReactNode
}) {
  return <div className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', className)}>{children}</div>
}

