import { createClient } from '@/lib/supabase/server'
import { FileText, Users, AlertTriangle, AlertCircle, CheckSquare, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch basic stats
  const { count: totalEmployees } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .is('deleted_at', null)

  const { count: totalDocuments } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Fetch expiring soon (next 30 days)
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  
  const { count: expiringSoon } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .lte('expiry_date', thirtyDaysFromNow.toISOString())
    .gt('expiry_date', new Date().toISOString())

  // Fetch expired
  const { count: expired } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .lte('expiry_date', new Date().toISOString())

  // Fetch pending visa tasks
  const { data: pendingTasks } = await supabase
    .from('visa_tasks')
    .select(`
      id, title, due_date,
      employees (first_name, last_name)
    `)
    .eq('status', 'pending')
    .is('deleted_at', null)
    .order('due_date', { ascending: true })
    .limit(5)

  // Fetch recent activity logs
  const { data: recentActivity } = await supabase
    .from('audit_logs')
    .select(`
      id, action, entity_type, created_at,
      profiles (full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 lg:h-[calc(100vh-10rem)] lg:overflow-hidden">
      <div className="max-w-2xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-2 sm:mt-4 text-sm sm:text-base lg:text-lg max-w-[65ch] leading-relaxed">
          Monitor your workforce compliance at a glance.
        </p>
      </div>
      
      {/* Stat Cards - Bento Grid approach */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 shrink-0">
        
        <div className="double-bezel-outer">
          <div className="double-bezel-inner p-3 sm:p-4 lg:p-6 flex flex-col justify-between min-h-[100px] sm:min-h-[120px] lg:min-h-[160px]">
            <div className="flex items-center gap-2 lg:gap-3 text-muted-foreground">
              <Users size={16} className="sm:hidden" strokeWidth={1.5} />
              <Users size={18} className="hidden sm:block" strokeWidth={1.5} />
              <span className="text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase tracking-wider">Active Employees</span>
            </div>
            <span className="text-2xl sm:text-3xl lg:text-5xl font-bold mt-2 sm:mt-4 tracking-tighter">{totalEmployees || 0}</span>
          </div>
        </div>

        <div className="double-bezel-outer">
          <div className="double-bezel-inner p-3 sm:p-4 lg:p-6 flex flex-col justify-between min-h-[100px] sm:min-h-[120px] lg:min-h-[160px]">
            <div className="flex items-center gap-2 lg:gap-3 text-muted-foreground">
              <FileText size={16} className="sm:hidden" strokeWidth={1.5} />
              <FileText size={18} className="hidden sm:block" strokeWidth={1.5} />
              <span className="text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase tracking-wider">Total Documents</span>
            </div>
            <span className="text-2xl sm:text-3xl lg:text-5xl font-bold mt-2 sm:mt-4 tracking-tighter">{totalDocuments || 0}</span>
          </div>
        </div>

        <div className="double-bezel-outer">
          <div className="double-bezel-inner p-3 sm:p-4 lg:p-6 flex flex-col justify-between min-h-[100px] sm:min-h-[120px] lg:min-h-[160px] bg-amber-500/5 dark:bg-amber-500/10">
            <div className="flex items-center gap-2 lg:gap-3 text-amber-600 dark:text-amber-500">
              <AlertTriangle size={16} className="sm:hidden" strokeWidth={1.5} />
              <AlertTriangle size={18} className="hidden sm:block" strokeWidth={1.5} />
              <span className="text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase tracking-wider">Expiring &lt; 30 Days</span>
            </div>
            <span className="text-2xl sm:text-3xl lg:text-5xl font-bold mt-2 sm:mt-4 tracking-tighter text-amber-600 dark:text-amber-500">{expiringSoon || 0}</span>
          </div>
        </div>

        <div className="double-bezel-outer">
          <div className="double-bezel-inner p-3 sm:p-4 lg:p-6 flex flex-col justify-between min-h-[100px] sm:min-h-[120px] lg:min-h-[160px] bg-destructive/5 dark:bg-destructive/10">
            <div className="flex items-center gap-2 lg:gap-3 text-destructive">
              <AlertCircle size={16} className="sm:hidden" strokeWidth={1.5} />
              <AlertCircle size={18} className="hidden sm:block" strokeWidth={1.5} />
              <span className="text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase tracking-wider">Expired</span>
            </div>
            <span className="text-2xl sm:text-3xl lg:text-5xl font-bold mt-2 sm:mt-4 tracking-tighter text-destructive">{expired || 0}</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 flex-1 min-h-0">
        {/* Pending Visa Tasks */}
        <div className="flex flex-col h-full min-h-0">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground border-b border-border/50 pb-2 shrink-0">
            <CheckSquare size={18} strokeWidth={1.5} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Pending Visa Tasks</h2>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {pendingTasks && pendingTasks.length > 0 ? pendingTasks.map((task: any) => (
              <div key={task.id} className="double-bezel-outer">
                <div className="double-bezel-inner p-4 bg-card flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{task.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.employees?.first_name} {task.employees?.last_name}
                    </p>
                  </div>
                  {task.due_date && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-8 text-center border border-dashed border-border/50 rounded-2xl">
                <p className="text-sm text-muted-foreground mb-4">No pending tasks at the moment.</p>
                <Link href="/dashboard/visa-tasks" className="text-xs font-semibold text-primary hover:underline">
                  Go to Task Board &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex flex-col h-full min-h-0">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground border-b border-border/50 pb-2 shrink-0">
            <Activity size={18} strokeWidth={1.5} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Recent Activity</h2>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {recentActivity && recentActivity.length > 0 ? recentActivity.map((log: any) => (
              <div key={log.id} className="double-bezel-outer">
                <div className="double-bezel-inner p-4 bg-card flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {log.profiles?.full_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{log.profiles?.full_name || 'System'}</span> {log.action} <span className="font-semibold">{log.entity_type}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center border border-dashed border-border/50 rounded-2xl">
                <p className="text-sm text-muted-foreground">No recent activity recorded.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
