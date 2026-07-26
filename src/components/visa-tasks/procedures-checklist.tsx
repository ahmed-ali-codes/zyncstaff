'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Edit2, Plus, Trash2, X, GripVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'

export type Procedure = {
  id: string
  title: string
  is_completed: boolean
  order_index: number
}

export function ProceduresChecklist({ initialProcedures }: { initialProcedures: Procedure[] }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [procedures, setProcedures] = useState<Procedure[]>(initialProcedures)
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [loading, setLoading] = useState(false)

  // Calculate stats
  const total = procedures.length
  const completed = procedures.filter(p => p.is_completed).length
  const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || loading) return

    setLoading(true)
    const newProcedure = {
      title: newTitle.trim(),
      is_completed: false,
      order_index: procedures.length,
    }

    // Optimistic UI
    const tempId = 'temp-' + Date.now()
    setProcedures([...procedures, { ...newProcedure, id: tempId }])
    setNewTitle('')

    const { data, error } = await supabase
      .from('procedures_checklist')
      .insert([newProcedure])
      .select()
      .single()

    if (error) {
      alert(`Error adding procedure: ${error.message}`)
      setProcedures(procedures) // Revert on error
    } else if (data) {
      setProcedures(prev => prev.map(p => p.id === tempId ? data : p))
      router.refresh()
    }
    setLoading(false)
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    
    // Optimistic UI
    setProcedures(procedures.map(p => p.id === id ? { ...p, is_completed: newStatus } : p))

    const { error } = await supabase
      .from('procedures_checklist')
      .update({ is_completed: newStatus })
      .eq('id', id)

    if (error) {
      alert(`Error updating status: ${error.message}`)
      setProcedures(procedures.map(p => p.id === id ? { ...p, is_completed: currentStatus } : p))
    } else {
      router.refresh()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this procedure?')) return

    // Optimistic UI
    const previousProcedures = [...procedures]
    setProcedures(procedures.filter(p => p.id !== id))

    const { error } = await supabase
      .from('procedures_checklist')
      .delete()
      .eq('id', id)

    if (error) {
      alert(`Error deleting procedure: ${error.message}`)
      setProcedures(previousProcedures)
    } else {
      router.refresh()
    }
  }

  const startEditing = (procedure: Procedure) => {
    setEditingId(procedure.id)
    setEditTitle(procedure.title)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null)
      return
    }

    const previousProcedures = [...procedures]
    
    // Optimistic UI
    setProcedures(procedures.map(p => p.id === id ? { ...p, title: editTitle.trim() } : p))
    setEditingId(null)

    const { error } = await supabase
      .from('procedures_checklist')
      .update({ title: editTitle.trim() })
      .eq('id', id)

    if (error) {
      alert(`Error updating title: ${error.message}`)
      setProcedures(previousProcedures)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="double-bezel-outer mt-12">
      <div className="double-bezel-inner p-6 sm:p-8 bg-card">
        
        {/* Header & Progress */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 border-b border-border/50 pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Master Procedures</h2>
            <p className="text-sm text-muted-foreground mt-1">Standard operating procedures and checklist for visa processing.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-muted/20 px-4 py-3 rounded-2xl border border-border/50">
            <div className="flex-1 w-32">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="text-right pl-4 border-l border-border/50">
              <div className="text-2xl font-bold">{completed}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">of {total} done</div>
            </div>
          </div>
        </div>

        {/* Add New Procedure Form */}
        <form onSubmit={handleAdd} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a new procedure step..."
              className="flex-1 appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition-all duration-300"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newTitle.trim()}
              className="inline-flex justify-center items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-spring hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              <Plus size={16} strokeWidth={2} />
              <span className="hidden sm:inline">Add Step</span>
            </button>
          </div>
        </form>

        {/* Checklist */}
        <div className="space-y-3">
          {procedures.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-2xl">
              <p className="text-muted-foreground text-sm">No procedures added yet. Start by adding a step above.</p>
            </div>
          ) : (
            procedures.map((procedure) => (
              <div 
                key={procedure.id}
                className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                  procedure.is_completed 
                    ? 'bg-muted/10 border-border/30 opacity-75' 
                    : 'bg-background border-border hover:border-primary/30 hover:shadow-sm'
                }`}
              >
                <button
                  onClick={() => handleToggle(procedure.id, procedure.is_completed)}
                  className={`flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                    procedure.is_completed
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-input bg-background hover:border-primary text-transparent'
                  }`}
                >
                  <Check size={14} strokeWidth={3} />
                </button>

                <div className="flex-1 min-w-0">
                  {editingId === procedure.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(procedure.id)}
                        onBlur={() => handleSaveEdit(procedure.id)}
                        autoFocus
                        className="w-full bg-background border-b border-primary px-1 py-0.5 text-sm focus:outline-none"
                      />
                    </div>
                  ) : (
                    <p className={`text-sm transition-all ${procedure.is_completed ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                      {procedure.title}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingId !== procedure.id && (
                    <button
                      onClick={() => startEditing(procedure)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted"
                      title="Edit step"
                    >
                      <Edit2 size={14} strokeWidth={2} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(procedure.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                    title="Delete step"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
