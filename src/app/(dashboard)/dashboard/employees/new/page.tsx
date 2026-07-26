'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewEmployeePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const newEmployee = {
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

    const { error } = await supabase.from('employees').insert([newEmployee])
    
    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard/employees')
      router.refresh()
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/employees" className="p-2 -ml-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">New Record</span>
          <h1 className="text-3xl font-bold tracking-tighter text-foreground">Add Employee</h1>
        </div>
      </div>

      <div className="double-bezel-outer">
        <div className="double-bezel-inner p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">First Name</label>
                <input required name="first_name" type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Last Name</label>
                <input required name="last_name" type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Employee Code</label>
                <input required name="employee_code" type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Email Address</label>
                <input name="email" type="email" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Department</label>
                <input name="department" type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Designation</label>
                <input name="designation" type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Phone</label>
                <input name="phone" type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Nationality</label>
                <input name="nationality" type="text" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Date of Joining</label>
                <input name="date_of_joining" type="date" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-muted-foreground" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Status</label>
                <select name="status" defaultValue="active" className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 flex justify-end gap-3">
              <Link href="/dashboard/employees" className="px-6 py-3 text-sm font-semibold text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors">
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={loading}
                className="inline-flex justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-spring hover:opacity-90 active:scale-[0.98] items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} strokeWidth={2} />
                <span>{loading ? 'Saving...' : 'Save Employee'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
