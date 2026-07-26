import { createClient } from '@/lib/supabase/server'
import { UserManager } from '@/components/settings/user-manager'
import { ChangePassword } from '@/components/settings/change-password'

export default async function SettingsPage() {
  const supabase = await createClient()

  // Fetch profiles (managers)
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  const userRole = profile?.role

  return (
    <div className="space-y-12 max-w-4xl">
      <div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">Preferences</span>
        <h1 className="text-4xl font-bold tracking-tighter text-foreground">Settings</h1>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tighter">Security</h2>
        <ChangePassword />
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tighter">User Management</h2>
        
        <UserManager initialUsers={users || []} userRole={userRole} currentUserEmail={user?.email} />
      </div>
    </div>
  )
}
