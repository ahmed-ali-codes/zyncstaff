import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search, MoreVertical, Trash2, Eye, Pencil, Building2 } from 'lucide-react'
import { ExportButtons } from '@/components/ui/export-buttons'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

export default async function EmployeesPage() {
  const supabase = await createClient()

  // Fetch employees
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const exportData = employees?.map(emp => ({
    'Employee Code': emp.employee_code || 'N/A',
    'Name': `${emp.first_name} ${emp.last_name}`,
    'Email': emp.email || 'N/A',
    'Department': emp.department || 'N/A',
    'Designation': emp.designation || 'N/A',
    'Status': emp.status || 'Unknown'
  })) || []

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">Directory</span>
          <h1 className="text-4xl font-bold tracking-tighter text-foreground">Employees</h1>
        </div>
        <div>
          <Link 
            href="/dashboard/employees/new" 
            className="group relative inline-flex justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-spring hover:opacity-90 active:scale-[0.98] items-center gap-2"
          >
            <Plus size={16} strokeWidth={2} />
            <span>Add Employee</span>
          </Link>
        </div>
      </div>

      <div className="double-bezel-outer">
        <div className="double-bezel-inner">
          
          {/* Table Toolbar */}
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} strokeWidth={1.5} />
              <input 
                type="text" 
                placeholder="Search employees..." 
                className="w-full pl-9 pr-4 py-2 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <ExportButtons data={exportData} filename="employees_export" />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[600px]">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/10 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Employee</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Code</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Department</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {employees?.map((employee) => (
                  <tr key={employee.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/employees/${employee.id}`} className="block">
                        <div className="font-semibold text-foreground">{employee.first_name} {employee.last_name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{employee.designation}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{employee.employee_code}</td>
                    <td className="px-6 py-4">{employee.department || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        employee.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                              <MoreVertical size={16} strokeWidth={1.5} />
                            </button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem render={<Link href={`/dashboard/employees/${employee.id}`} />}>
                            <Eye size={14} className="mr-2" /> View Details
                          </DropdownMenuItem>
                          {/* We can add Edit and Delete actions later, they require client-side routing/mutations or dedicated routes */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {(!employees || employees.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No employees found. Add your first employee to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
