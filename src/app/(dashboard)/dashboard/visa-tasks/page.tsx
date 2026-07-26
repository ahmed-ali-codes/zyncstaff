import { createClient } from '@/lib/supabase/server'
import { CheckSquare, Search, Plus, MoreVertical } from 'lucide-react'
import { NewTaskButton } from '@/components/visa-tasks/new-task-button'
import { KanbanBoard } from '@/components/visa-tasks/kanban-board'
import { ProceduresChecklist } from '@/components/visa-tasks/procedures-checklist'

export default async function VisaTasksPage() {
  const supabase = await createClient()

  const { data: tasks } = await supabase
    .from('visa_tasks')
    .select(`
      *,
      employees (first_name, last_name)
    `)
    .is('deleted_at', null)
    .order('due_date', { ascending: true })

  const { data: employees } = await supabase
    .from('employees')
    .select('id, first_name, last_name, employee_code')
    .is('deleted_at', null)
    .order('first_name', { ascending: true })

  const { data: procedures } = await supabase
    .from('procedures_checklist')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">Workflows</span>
          <h1 className="text-4xl font-bold tracking-tighter text-foreground">Visa Tasks</h1>
        </div>
        <div>
          <NewTaskButton employees={employees || []} />
        </div>
      </div>

      {/* Kanban Board Container */}
      <KanbanBoard initialTasks={tasks || []} />

      {/* Global Procedures Checklist */}
      <ProceduresChecklist initialProcedures={procedures || []} />
    </div>
  )
}
