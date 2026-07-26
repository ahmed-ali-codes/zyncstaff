'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RotateCcw, Trash2, FileText, Users, CheckSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { restoreItemAction, hardDeleteItemAction } from '@/app/actions/trash'

export type TrashItem = {
  id: string
  type: 'employee' | 'document' | 'visa_task'
  title: string
  deleted_at: string
}

export function TrashManager({ initialItems }: { initialItems: TrashItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState<TrashItem[]>(initialItems)
  const [loading, setLoading] = useState<string | null>(null) // ID of item being processed

  const handleRestore = async (id: string, type: string) => {
    setLoading(id)
    
    try {
      await restoreItemAction(id, type)
      setItems(items.filter(i => i.id !== id))
    } catch (error: any) {
      alert(`Error restoring item: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleHardDelete = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this item? This action cannot be undone and will permanently remove all associated records.')) {
      return
    }

    setLoading(id)
    
    try {
      await hardDeleteItemAction(id, type)
      setItems(items.filter(i => i.id !== id))
    } catch (error: any) {
      alert(`Error permanently deleting item: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="double-bezel-outer">
        <div className="double-bezel-inner p-12 flex flex-col items-center justify-center text-center bg-card">
          <Trash2 size={48} strokeWidth={1} className="text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground mb-4">Trash is completely empty.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="double-bezel-outer">
      <div className="double-bezel-inner overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/10 border-b border-border/50">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Item Type</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Name / Title</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Deleted On</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 bg-card">
            {items.map((item) => {
              const isProcessing = loading === item.id

              return (
                <tr key={item.id} className={`hover:bg-muted/10 transition-colors ${isProcessing ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {item.type === 'employee' && <><Users size={16} /> <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Employee</span></>}
                      {item.type === 'document' && <><FileText size={16} /> <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Document</span></>}
                      {item.type === 'visa_task' && <><CheckSquare size={16} /> <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Visa Task</span></>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">{item.title}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {new Date(item.deleted_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleRestore(item.id, item.type)}
                        disabled={isProcessing}
                        className="text-muted-foreground hover:text-emerald-500 transition-colors p-2 flex items-center gap-1 text-xs font-semibold rounded-md hover:bg-emerald-500/10"
                        title="Restore item"
                      >
                        <RotateCcw size={14} strokeWidth={2} /> Restore
                      </button>
                      <button 
                        onClick={() => handleHardDelete(item.id, item.type)}
                        disabled={isProcessing}
                        className="text-muted-foreground hover:text-destructive transition-colors p-2 flex items-center gap-1 text-xs font-semibold rounded-md hover:bg-destructive/10"
                        title="Permanently Delete"
                      >
                        <Trash2 size={14} strokeWidth={2} /> Delete Forever
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
