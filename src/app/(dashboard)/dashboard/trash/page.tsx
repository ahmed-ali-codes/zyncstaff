import { createClient } from '@/lib/supabase/server'
import { TrashManager, TrashItem } from '@/components/trash/trash-manager'
import { Trash2 } from 'lucide-react'

export default async function TrashPage() {
  const supabase = await createClient()

  // Fetch deleted employees
  const { data: employees } = await supabase
    .from('employees')
    .select('id, first_name, last_name, deleted_at')
    .not('deleted_at', 'is', null)

  // Fetch deleted documents
  const { data: documents } = await supabase
    .from('documents')
    .select('id, document_types(name), deleted_at')
    .not('deleted_at', 'is', null)

  // Fetch deleted tasks
  const { data: tasks } = await supabase
    .from('visa_tasks')
    .select('id, title, deleted_at')
    .not('deleted_at', 'is', null)

  const items: TrashItem[] = []

  if (employees) {
    employees.forEach(e => items.push({
      id: e.id,
      type: 'employee',
      title: `${e.first_name} ${e.last_name}`,
      deleted_at: e.deleted_at
    }))
  }

  if (documents) {
    documents.forEach(d => items.push({
      id: d.id,
      type: 'document',
      title: d.document_types?.name || 'Unknown Document',
      deleted_at: d.deleted_at
    }))
  }

  if (tasks) {
    tasks.forEach(t => items.push({
      id: t.id,
      type: 'visa_task',
      title: t.title,
      deleted_at: t.deleted_at
    }))
  }

  // Sort by most recently deleted first
  items.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime())

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">System</span>
          <h1 className="text-4xl font-bold tracking-tighter text-foreground flex items-center gap-3">
            <Trash2 className="text-muted-foreground" size={32} strokeWidth={2} />
            Trash
          </h1>
        </div>
      </div>
      
      <p className="text-muted-foreground max-w-3xl">
        Items here have been soft-deleted. You can restore them to their original location, or permanently delete them from the database.
      </p>

      <TrashManager initialItems={items} />
    </div>
  )
}
