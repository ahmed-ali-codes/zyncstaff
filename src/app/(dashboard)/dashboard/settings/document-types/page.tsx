import { createClient } from '@/lib/supabase/server'
import { DocumentTypesManager } from '@/components/settings/document-types-manager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function DocumentTypesPage() {
  const supabase = await createClient()

  const { data: documentTypes } = await supabase
    .from('document_types')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings" className="p-2 -ml-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Settings</span>
          <h1 className="text-3xl font-bold tracking-tighter text-foreground">Document Types</h1>
        </div>
      </div>
      
      <p className="text-muted-foreground max-w-3xl">
        Manage the types of documents that can be uploaded for employees. System document types are required for core functionality and cannot be deleted.
      </p>

      <DocumentTypesManager initialTypes={documentTypes || []} />
    </div>
  )
}
