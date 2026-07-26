'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ProfileDropdownProps {
  fullName: string
  role: string
}

export function ProfileDropdown({ fullName, role }: ProfileDropdownProps) {
  const router = useRouter()
  const initials = fullName ? fullName[0].toUpperCase() : 'U'

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 outline-none group cursor-pointer">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{fullName}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{role}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold transition-transform group-hover:scale-105">
          {initials}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
        <div className="px-2 py-2 sm:hidden block">
          <p className="text-sm font-semibold text-foreground">{fullName}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{role}</p>
        </div>
        <div className="sm:hidden block">
          <DropdownMenuSeparator className="my-2" />
        </div>
        
        <Link href="/dashboard/settings">
          <DropdownMenuItem className="cursor-pointer rounded-xl flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted focus:bg-muted">
            <Settings size={16} strokeWidth={1.5} />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer rounded-xl flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
