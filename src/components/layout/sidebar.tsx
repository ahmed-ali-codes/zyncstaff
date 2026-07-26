'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, FolderOpen, CheckSquare, ShieldAlert, Trash2, Settings, LogOut, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Employees', href: '/dashboard/employees', icon: Users },
  { name: 'Documents', href: '/dashboard/documents', icon: FolderOpen },
  { name: 'Visa Tasks', href: '/dashboard/visa-tasks', icon: CheckSquare },
  { name: 'Audit Log', href: '/dashboard/audit-log', icon: ShieldAlert },
  { name: 'Trash', href: '/dashboard/trash', icon: Trash2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    }
  }

  const sidebarContent = (
    <>
      <div className="h-16 lg:h-20 flex items-center px-6 lg:px-8 border-b border-border/50 shrink-0">
        <h1 className="text-xl font-bold tracking-tighter text-foreground">ZyncStaff</h1>
        {/* Close button only on mobile */}
        <button 
          onClick={() => setMobileOpen(false)} 
          className="lg:hidden ml-auto p-2 text-muted-foreground hover:text-foreground rounded-lg"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 lg:py-6 px-3 lg:px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href} className="relative block">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <div
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 lg:p-4 border-t border-border/50 space-y-1 shrink-0">
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200">
          <Settings size={18} strokeWidth={1.5} />
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger trigger — rendered in topbar area */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-foreground transition-colors shadow-sm"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:flex flex-col w-64 2xl:w-72 bg-card border-r border-border h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar — slide-over drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-card border-r border-border z-[70] flex flex-col lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
