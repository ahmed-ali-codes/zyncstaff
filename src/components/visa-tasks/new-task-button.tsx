'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'

export function NewTaskButton({ employees }: { employees: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const newTask = {
      title: formData.get('title'),
      description: formData.get('description'),
      employee_id: formData.get('employee_id') || null,
      due_date: formData.get('due_date') || null,
      status: formData.get('status') || 'pending',
    }

    const { error } = await supabase.from('visa_tasks').insert([newTask])
    
    if (error) {
      alert(`Error creating task: ${error.message}`)
    } else {
      setIsOpen(false)
      router.refresh()
    }
    
    setLoading(false)
  }

  function handleOpenChange(open: boolean) {
    if (!loading) {
      setIsOpen(open)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger 
        render={
          <button className="group relative inline-flex justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-spring hover:opacity-90 active:scale-[0.98] items-center gap-2">
            <Plus size={16} strokeWidth={2} />
            <span>New Task</span>
          </button>
        }
      />

      <DialogContent className="sm:max-w-xl max-w-xl p-0 border-0 bg-transparent shadow-none" aria-describedby={undefined} showCloseButton={false}>
        <DialogTitle className="sr-only">New Task</DialogTitle>
        <div className="double-bezel-outer bg-background relative overflow-hidden">
          <div className="double-bezel-inner p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tighter">New Task</h2>
              <button 
                onClick={() => handleOpenChange(false)}
                className="p-2 -mr-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Title</label>
                <input required name="title" type="text" placeholder="e.g. Apply for Work Visa" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</label>
                <textarea name="description" rows={3} placeholder="Task details..." className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Assign to Employee</label>
                  <select name="employee_id" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-foreground">
                    <option value="">-- No Employee --</option>
                    {employees?.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Due Date</label>
                  <input name="due_date" type="date" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Initial Status</label>
                <select name="status" defaultValue="pending" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="pt-6 border-t border-border/50 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="inline-flex justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-spring hover:opacity-90 active:scale-[0.98] items-center gap-2 w-full sm:w-auto disabled:opacity-50"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  <span>{loading ? 'Creating...' : 'Create Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
