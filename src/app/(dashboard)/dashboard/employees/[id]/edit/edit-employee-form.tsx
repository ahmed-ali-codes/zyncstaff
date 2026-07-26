'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import Link from 'next/link'
import { updateEmployeeAction } from '@/app/actions/employees'

export function EditEmployeeForm({ employee, id }: { employee: any, id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const updateData = {
      employee_code: formData.get('employee_code'),
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email') || null,
      department: formData.get('department') || null,
      designation: formData.get('designation') || null,
      phone: formData.get('phone') || null,
      nationality: formData.get('nationality') || null,
      date_of_joining: formData.get('date_of_joining') || null,
      status: formData.get('status') || 'active',
    }

    try {
      await updateEmployeeAction(id, updateData)
      router.push(`/dashboard/employees/${id}`)
    } catch (error: any) {
      alert(`Error updating employee: ${error.message}`)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">First Name</label>
          <input required name="first_name" defaultValue={employee.first_name} type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Last Name</label>
          <input required name="last_name" defaultValue={employee.last_name} type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Employee Code</label>
          <input required name="employee_code" defaultValue={employee.employee_code} type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors font-mono" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Email Address</label>
          <input name="email" defaultValue={employee.email || ''} type="email" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Department</label>
          <input name="department" defaultValue={employee.department || ''} type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Designation</label>
          <input name="designation" defaultValue={employee.designation || ''} type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Phone</label>
          <input name="phone" defaultValue={employee.phone || ''} type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Nationality</label>
          <input name="nationality" defaultValue={employee.nationality || ''} type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Date of Joining</label>
          <input name="date_of_joining" defaultValue={employee.date_of_joining || ''} type="date" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-muted-foreground" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Status</label>
          <select name="status" defaultValue={employee.status || 'active'} className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      <div className="pt-6 border-t border-border/50 flex justify-end gap-3">
        <Link href={`/dashboard/employees/${id}`} className="px-6 py-3 text-sm font-semibold text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors">
          Cancel
        </Link>
        <button 
          type="submit" 
          disabled={loading}
          className="inline-flex justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-spring hover:opacity-90 active:scale-[0.98] items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} strokeWidth={2} />
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  )
}
