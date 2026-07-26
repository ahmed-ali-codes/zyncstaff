'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { deleteEmployeeAction } from '@/app/actions/employees'

export function EmployeeActions({ employeeId, userRole }: { employeeId: string, userRole?: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    
    try {
      await deleteEmployeeAction(employeeId)
      router.push('/dashboard/employees')
    } catch (error: any) {
      alert(`Error deleting employee: ${error.message}`)
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/dashboard/employees/${employeeId}/edit`} className="inline-flex justify-center rounded-full bg-muted/50 hover:bg-muted px-4 py-2 text-sm font-semibold transition-colors items-center gap-2">
        <Edit size={16} strokeWidth={2} />
        <span>Edit</span>
      </Link>
      {userRole === 'owner' && (
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 px-4 py-2 text-sm font-semibold transition-colors items-center gap-2 disabled:opacity-50"
        >
          <Trash2 size={16} strokeWidth={2} />
          <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
        </button>
      )}
    </div>
  )
}
