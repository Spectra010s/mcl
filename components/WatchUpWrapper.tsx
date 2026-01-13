'use client'

import { WatchupProvider, WatchupProviderProps } from 'watchup-react'

// Use the exported WatchupProviderProps interface here
export default function WatchupProviderWrapper({ children, ...props }: WatchupProviderProps) {
  return <WatchupProvider {...props}>{children}</WatchupProvider>
}
