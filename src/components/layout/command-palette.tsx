'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, User, FileText, CheckSquare, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ type: string, id: string, title: string, subtitle: string }[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const fetchResults = async () => {
      setLoading(true)
      const searchQuery = `%${query}%`

      // Search Employees
      const { data: employees } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_code, email')
        .is('deleted_at', null)
        .or(`first_name.ilike.${searchQuery},last_name.ilike.${searchQuery},email.ilike.${searchQuery}`)
        .limit(3)

      // Search Documents
      const { data: documents } = await supabase
        .from('documents')
        .select('id, file_name, document_number, employee_id')
        .is('deleted_at', null)
        .or(`file_name.ilike.${searchQuery},document_number.ilike.${searchQuery}`)
        .limit(3)

      // Search Tasks
      const { data: tasks } = await supabase
        .from('visa_tasks')
        .select('id, title, status')
        .is('deleted_at', null)
        .ilike('title', searchQuery)
        .limit(3)

      const formattedResults = []

      if (employees) {
        formattedResults.push(...employees.map(e => ({
          type: 'employee',
          id: e.id,
          title: `${e.first_name} ${e.last_name}`,
          subtitle: e.email || e.employee_code || 'Employee'
        })))
      }

      if (documents) {
        formattedResults.push(...documents.map(d => ({
          type: 'document',
          id: d.id, // Linking to employee page since docs don't have their own page yet
          linkId: d.employee_id,
          title: d.file_name,
          subtitle: `Doc: ${d.document_number || 'Unknown'}`
        })))
      }

      if (tasks) {
        formattedResults.push(...tasks.map(t => ({
          type: 'task',
          id: t.id,
          title: t.title,
          subtitle: `Status: ${t.status}`
        })))
      }

      setResults(formattedResults)
      setLoading(false)
    }

    const timeoutId = setTimeout(fetchResults, 300)
    return () => clearTimeout(timeoutId)
  }, [query, supabase])

  const handleSelect = (item: any) => {
    setOpen(false)
    setQuery('')
    
    if (item.type === 'employee') {
      router.push(`/dashboard/employees/${item.id}`)
    } else if (item.type === 'document') {
      router.push(`/dashboard/employees/${item.linkId}`)
    } else if (item.type === 'task') {
      router.push(`/dashboard/visa-tasks`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 border-0 bg-transparent shadow-none" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <div className="double-bezel-outer bg-background relative overflow-hidden">
          <div className="double-bezel-inner">
            <div className="flex items-center border-b border-border/50 px-4">
              <Search className="text-muted-foreground mr-3" size={20} />
              <input
                autoFocus
                placeholder="Search employees, documents, tasks..."
                className="flex-1 bg-transparent py-5 text-sm outline-none placeholder:text-muted-foreground text-foreground"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-2">
                {loading && <span className="text-xs text-muted-foreground animate-pulse">Searching...</span>}
                <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">ESC</span>
                </kbd>
              </div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto p-2">
              {results.length === 0 && query && !loading && (
                <p className="p-4 text-center text-sm text-muted-foreground">No results found.</p>
              )}
              
              {results.length === 0 && !query && (
                <div className="p-4 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <p className="text-sm">Start typing to search across your vault.</p>
                  <p className="text-xs mt-2 opacity-50">Tip: You can press <kbd className="font-mono bg-muted/50 px-1 rounded">Cmd+K</kbd> anywhere to open this menu.</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-1">
                  {results.map((item, idx) => (
                    <button
                      key={`${item.type}-${item.id}-${idx}`}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/50 rounded-xl transition-colors text-left"
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {item.type === 'employee' && <User size={16} />}
                        {item.type === 'document' && <FileText size={16} />}
                        {item.type === 'task' && <CheckSquare size={16} />}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-sm text-foreground truncate">{item.title}</span>
                        <span className="text-xs text-muted-foreground truncate">{item.subtitle}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
