'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, ShieldAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'

type DocumentType = {
  id: string
  name: string
  has_expiry: boolean
  is_system: boolean
}

export function DocumentTypesManager({ initialTypes }: { initialTypes: DocumentType[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [types, setTypes] = useState<DocumentType[]>(initialTypes)
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState('')
  const [newHasExpiry, setNewHasExpiry] = useState(true)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setLoading(true)
    const newType = { name: newName.trim(), has_expiry: newHasExpiry, is_system: false }

    const { data, error } = await supabase
      .from('document_types')
      .insert([newType])
      .select()
      .single()

    if (error) {
      alert(`Error adding document type: ${error.message}`)
    } else if (data) {
      setTypes([...types, data])
      setNewName('')
      setNewHasExpiry(true)
      router.refresh()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      alert('Cannot delete system document types.')
      return
    }

    if (!confirm('Are you sure you want to delete this document type? Existing documents of this type will be orphaned.')) {
      return
    }

    setLoading(true)
    const { error } = await supabase
      .from('document_types')
      .delete()
      .eq('id', id)

    if (error) {
      alert(`Error deleting document type: ${error.message}`)
    } else {
      setTypes(types.filter(t => t.id !== id))
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="double-bezel-outer">
        <div className="double-bezel-inner p-6 bg-card">
          <h2 className="text-lg font-bold mb-4">Add New Type</h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Type Name</label>
              <input 
                required 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Birth Certificate"
                className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
              />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <input 
                type="checkbox" 
                id="has_expiry"
                checked={newHasExpiry}
                onChange={(e) => setNewHasExpiry(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="has_expiry" className="text-sm font-medium">Has Expiry Date</label>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="inline-flex justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-spring hover:opacity-90 active:scale-[0.98] items-center gap-2 disabled:opacity-50"
            >
              <Plus size={16} strokeWidth={2} />
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>

      <div className="double-bezel-outer">
        <div className="double-bezel-inner overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/10 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Document Type</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Requires Expiry</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-card">
              {types.map((type) => (
                <tr key={type.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{type.name}</span>
                      {type.is_system && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary" title="System Type (Cannot be deleted)">
                          <ShieldAlert size={10} /> System
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {type.has_expiry ? (
                      <span className="text-emerald-600 dark:text-emerald-500 font-medium text-xs bg-emerald-500/10 px-2 py-1 rounded-md">Yes</span>
                    ) : (
                      <span className="text-muted-foreground font-medium text-xs bg-muted/50 px-2 py-1 rounded-md">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(type.id, type.is_system)}
                      disabled={type.is_system || loading}
                      className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-20 disabled:hover:text-muted-foreground p-2"
                      title={type.is_system ? "Cannot delete system type" : "Delete type"}
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
