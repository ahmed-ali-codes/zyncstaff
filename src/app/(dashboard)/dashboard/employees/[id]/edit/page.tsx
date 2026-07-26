import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EditEmployeeForm } from './edit-employee-form'

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (!employee) {
    notFound()
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/employees/${id}`} className="p-2 -ml-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Edit Record</span>
          <h1 className="text-3xl font-bold tracking-tighter text-foreground">Edit Employee</h1>
        </div>
      </div>

      <div className="double-bezel-outer">
        <div className="double-bezel-inner p-8">
          <EditEmployeeForm employee={employee} id={id} />
        </div>
      </div>
    </div>
  )
}
