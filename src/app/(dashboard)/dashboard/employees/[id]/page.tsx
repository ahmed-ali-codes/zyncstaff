import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { EmployeeActions } from './employee-actions'
import { DocumentActions } from '@/components/documents/document-actions'

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Wait for params to resolve
  const { id } = await params

  // Fetch current user and their role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  const userRole = profile?.role

  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  const { data: documents } = await supabase
    .from('documents')
    .select(`
      *,
      document_types (name)
    `)
    .eq('employee_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (!employee) notFound()

  // Calculate Compliance Score
  const totalDocs = documents?.length || 0
  const expiredDocs = documents?.filter((doc: any) => 
    doc.expiry_date && new Date(doc.expiry_date) < new Date()
  ).length || 0
  
  const complianceScore = totalDocs === 0 ? null : Math.round(((totalDocs - expiredDocs) / totalDocs) * 100)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/employees" className="p-2 -ml-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Employee Profile</span>
            <h1 className="text-4xl font-bold tracking-tighter text-foreground">{employee.first_name} {employee.last_name}</h1>
          </div>
        </div>
        <EmployeeActions employeeId={employee.id} userRole={userRole} />
      </div>

      <div className="double-bezel-outer">
        <div className="double-bezel-inner p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Identity Column */}
            <div className="space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Identity</h3>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Employee Code</p>
                <p className="font-mono">{employee.employee_code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p>{employee.email || '-'}</p>
              </div>
            </div>

            {/* Role Column */}
            <div className="space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Role</h3>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Department</p>
                <p>{employee.department || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Designation</p>
                <p>{employee.designation || '-'}</p>
              </div>
            </div>

            {/* Status Column */}
            <div className="space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Status</h3>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  employee.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                }`}>
                  {employee.status}
                </span>
              </div>
            </div>

            {/* Compliance Score Column */}
            <div className="space-y-6 lg:border-l lg:border-border/50 lg:pl-12">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Compliance</h3>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Document Health</p>
                {complianceScore === null ? (
                  <span className="text-sm font-semibold text-muted-foreground">No Documents</span>
                ) : (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className={`text-3xl font-bold tracking-tighter ${
                      complianceScore === 100 ? 'text-emerald-600' :
                      complianceScore >= 50 ? 'text-amber-500' : 'text-destructive'
                    }`}>
                      {complianceScore}%
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                      complianceScore === 100 ? 'bg-emerald-500/10 text-emerald-600' :
                      complianceScore >= 50 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {complianceScore === 100 ? 'Perfect' : 'Action Needed'}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tabs for Documents and Visa Tasks will go here */}
      <div className="pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tighter">Documents</h2>
          {/* We can place an upload button here if needed */}
        </div>
        <div className="double-bezel-outer">
          <div className="double-bezel-inner">
            {documents && documents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/10 border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-semibold tracking-wider">Document Type</th>
                      <th className="px-6 py-4 font-semibold tracking-wider">Doc Number</th>
                      <th className="px-6 py-4 font-semibold tracking-wider">Expiry</th>
                      <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {documents.map((doc: any) => {
                      const isExpiringSoon = doc.expiry_date && new Date(doc.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      const isExpired = doc.expiry_date && new Date(doc.expiry_date) < new Date()

                      return (
                        <tr key={doc.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <FileText size={16} strokeWidth={1.5} />
                              </div>
                              <span className="font-semibold text-foreground">{doc.document_types?.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{doc.document_number || '-'}</td>
                          <td className="px-6 py-4">
                            {doc.expiry_date ? (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                isExpired ? 'bg-destructive/10 text-destructive' : 
                                isExpiringSoon ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500' : 
                                'bg-emerald-500/10 text-emerald-600'
                              }`}>
                                {new Date(doc.expiry_date).toLocaleDateString()}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <DocumentActions documentId={doc.id} fileUrl={doc.file_path} userRole={userRole} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground mb-4">No documents uploaded for this employee yet.</p>
                <Link href="/dashboard/documents" className="inline-flex justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-spring hover:opacity-90 active:scale-[0.98]">
                  Upload Document
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
