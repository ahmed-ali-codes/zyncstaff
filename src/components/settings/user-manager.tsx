'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, UserX, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function UserManager({ initialUsers, userRole, currentUserEmail }: { initialUsers: any[], userRole?: string, currentUserEmail?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null) // user ID being processed

  // The super admin email is set via the NEXT_PUBLIC_SUPER_ADMIN_EMAIL environment variable
  const isSuperAdmin = currentUserEmail === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL
  const canManageUsers = isSuperAdmin || userRole === 'owner'

  const toggleAccountStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active'
    
    if (newStatus === 'disabled' && !confirm('Are you sure you want to lock this user out of the system?')) {
      return
    }

    setLoading(userId)
    const { error } = await supabase
      .from('profiles')
      .update({ account_status: newStatus })
      .eq('id', userId)

    if (error) {
      alert(`Error updating account status: ${error.message}`)
    } else {
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div className="double-bezel-outer">
      <div className="double-bezel-inner overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/10 border-b border-border/50">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">User</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Role</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Account Status</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 bg-card">
            {initialUsers?.map((user: any) => {
              const isProcessing = loading === user.id
              return (
                <tr key={user.id} className={`hover:bg-muted/10 transition-colors ${isProcessing ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{user.full_name || 'No Name'}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className={`bg-muted/30 border border-border/50 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 capitalize ${!canManageUsers ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={user.role}
                      disabled={isProcessing || !canManageUsers}
                      onChange={async (e) => {
                        const newRole = e.target.value;
                        setLoading(user.id);
                        const { error } = await supabase
                          .from('profiles')
                          .update({ role: newRole })
                          .eq('id', user.id);
                        if (error) {
                          alert(`Error updating role: ${error.message}`);
                        } else {
                          router.refresh();
                        }
                        setLoading(null);
                      }}
                    >
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {user.account_status === 'disabled' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-semibold uppercase tracking-wider">
                        <UserX size={12} strokeWidth={2} /> Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">
                        <ShieldCheck size={12} strokeWidth={2} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => toggleAccountStatus(user.id, user.account_status || 'active')}
                      disabled={isProcessing || !canManageUsers}
                      className={`inline-flex justify-center items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                        !canManageUsers ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground' : 
                        user.account_status === 'disabled'
                          ? 'bg-primary text-primary-foreground hover:opacity-90'
                          : 'bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                      }`}
                    >
                      {isProcessing ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        user.account_status === 'disabled' ? 'Unlock Account' : 'Lock Account'
                      )}
                    </button>
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
