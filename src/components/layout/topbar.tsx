import { createClient } from '@/lib/supabase/server'
import { SearchButton } from './search-button'
import { NotificationDropdown } from './notification-dropdown'
import { ProfileDropdown } from './profile-dropdown'

export async function Topbar() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  let notifications: any[] = []
  let unreadCount = 0

  if (user) {
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()
      
    profile = profileData

    // Fetch notifications
    const { data: notificationsData } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (notificationsData) {
      notifications = notificationsData
      unreadCount = notificationsData.filter((n: any) => !n.is_read).length
    }
  }

  return (
    <header className="h-14 sm:h-16 lg:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-background border-b border-border/50 sticky top-0 z-30">
      {/* Left side — search (with left padding on mobile for hamburger) */}
      <div className="flex-1 flex items-center pl-10 lg:pl-0">
        <SearchButton />
      </div>

      {/* Right side — notifications & profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationDropdown 
          initialNotifications={notifications} 
          unreadCount={unreadCount} 
        />
        
        <div className="h-8 w-px bg-border/50 mx-1 sm:mx-2 hidden sm:block"></div>
        
        <ProfileDropdown 
          fullName={profile?.full_name || 'System User'} 
          role={profile?.role || 'User'} 
        />
      </div>
    </header>
  )
}
