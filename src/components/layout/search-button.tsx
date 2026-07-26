'use client'

import { Search } from 'lucide-react'

export function SearchButton() {
  return (
    <button 
      onClick={() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
      }}
      className="flex items-center gap-2 text-muted-foreground bg-muted/30 hover:bg-muted/50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-colors border border-border/50"
    >
      <Search size={16} strokeWidth={1.5} />
      <span className="text-sm font-medium hidden sm:inline">Search employees, docs...</span>
      <kbd className="ml-2 sm:ml-4 text-[10px] font-mono bg-background border border-border px-1.5 sm:px-2 py-0.5 rounded-md hidden md:inline">⌘K</kbd>
    </button>
  )
}
