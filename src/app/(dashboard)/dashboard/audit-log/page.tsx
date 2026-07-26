import { createClient } from '@/lib/supabase/server'
import { Activity } from 'lucide-react'

export default async function AuditLogPage() {
  const supabase = await createClient()

  // Fetch recent activity logs
  const { data: logs } = await supabase
    .from('audit_logs')
    .select(`
      id, action, entity_type, created_at, details,
      profiles (full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">System</span>
          <h1 className="text-4xl font-bold tracking-tighter text-foreground flex items-center gap-3">
            <Activity className="text-muted-foreground" size={32} strokeWidth={2} />
            Audit Log
          </h1>
        </div>
      </div>
      
      <p className="text-muted-foreground max-w-3xl mb-8">
        A chronological record of system events. Note: Some actions may require database triggers to be configured before they appear here.
      </p>

      <div className="double-bezel-outer">
        <div className="double-bezel-inner overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/10 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Timestamp</th>
                <th className="px-6 py-4 font-semibold tracking-wider">User</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Action</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-card">
              {logs && logs.length > 0 ? logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{log.profiles?.full_name || 'System User'}</span>
                      <span className="text-xs text-muted-foreground">{log.profiles?.email || 'System Action'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-foreground">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground capitalize">{log.entity_type.replace('_', ' ')}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  )
}
