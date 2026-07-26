import { createClient } from '@/lib/supabase/server'
import { UploadDocumentButton } from '@/components/documents/upload-button'
import { DocumentActions } from '@/components/documents/document-actions'
import { ExportButtons } from '@/components/ui/export-buttons'
import Link from 'next/link'
import { Plus, Search, Eye, Download, MoreVertical, FileText } from 'lucide-react'

export default async function DocumentsPage() {
  const supabase = await createClient()

  // Fetch current user and their role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  const userRole = profile?.role

  // Fetch documents with employee details and doc type
  const { data: documents } = await supabase
    .from('documents')
    .select(`
      *,
      employees (first_name, last_name),
      document_types (name)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const { data: employees } = await supabase
    .from('employees')
    .select('id, first_name, last_name, employee_code')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('first_name', { ascending: true })

  const { data: documentTypes } = await supabase
    .from('document_types')
    .select('id, name, has_expiry')
    .order('name')

  const exportData = documents?.map(doc => ({
    'Document Type': doc.document_types?.name || 'Unknown',
    'Document Number': doc.document_number || 'N/A',
    'Employee': doc.employees ? `${doc.employees.first_name} ${doc.employees.last_name}` : 'Unknown',
    'Expiry Date': doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'N/A'
  })) || []

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">Vault</span>
          <h1 className="text-4xl font-bold tracking-tighter text-foreground">Documents</h1>
        </div>
        <div>
          <UploadDocumentButton employees={employees || []} documentTypes={documentTypes || []} />
        </div>
      </div>

      <div className="double-bezel-outer">
        <div className="double-bezel-inner">
          
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} strokeWidth={1.5} />
              <input 
                type="text" 
                placeholder="Search documents by number or employee..." 
                className="w-full pl-9 pr-4 py-2 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <ExportButtons data={exportData} filename="documents_export" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[600px]">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/10 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Document Type</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Employee</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Doc Number</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Expiry</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {documents?.map((doc: any) => {
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
                      <td className="px-6 py-4 text-muted-foreground">
                        {doc.employees?.first_name} {doc.employees?.last_name}
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
                {(!documents || documents.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No documents found in the vault.
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
