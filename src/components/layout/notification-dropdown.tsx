'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Check, Inbox } from 'lucide-react'
import { markNotificationsAsReadAction } from '@/app/actions/notifications'
import { useState, useTransition } from 'react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

interface NotificationDropdownProps {
  initialNotifications: Notification[]
  unreadCount: number
}

export function NotificationDropdown({ initialNotifications, unreadCount }: NotificationDropdownProps) {
  const [isPending, startTransition] = useTransition()
  
  const handleMarkAsRead = async () => {
    startTransition(async () => {
      await markNotificationsAsReadAction()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        onClick={handleMarkAsRead}
        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors outline-none cursor-pointer"
      >
        <Bell size={20} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl overflow-hidden shadow-xl border border-border/50">
        <div className="px-4 py-3 bg-muted/30 border-b border-border/50 flex justify-between items-center">
          <h4 className="text-sm font-bold tracking-tighter">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {unreadCount} Unread
            </span>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {initialNotifications.length > 0 ? (
            <div className="divide-y divide-border/30">
              {initialNotifications.map((notification) => (
                <div key={notification.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex gap-3">
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${notification.is_read ? 'bg-transparent' : 'bg-primary'}`} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{notification.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground mb-3">
                <Inbox size={20} strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">No new notifications.</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
