'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { getDownloadUrlAction } from '@/app/actions/documents'
import { Download, History, FileText } from 'lucide-react'

export function DocumentHistoryModal({ 
  documentId, 
  isOpen, 
  onClose 
}: { 
  documentId: string, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!isOpen) return

    const fetchVersions = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('document_versions')
        .select(`
          *,
          profiles:created_by (full_name)
        `)
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })

      if (error) {
        console.error("Error fetching versions:", error)
      } else {
        setVersions(data || [])
      }
      setLoading(false)
    }

    fetchVersions()
  }, [documentId, isOpen, supabase])

  const handleDownload = async (fileUrl: string) => {
    try {
      const url = await getDownloadUrlAction(fileUrl)
      window.open(url, '_blank')
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 border-0 bg-transparent shadow-none" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Version History</DialogTitle>
        <div className="double-bezel-outer bg-background relative overflow-hidden">
          <div className="double-bezel-inner p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <History size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tighter">Version History</h2>
                <p className="text-sm text-muted-foreground mt-0.5">View and download previous versions of this document.</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {loading ? (
                <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
                  Loading history...
                </div>
              ) : versions.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-border/50 rounded-xl">
                  <p className="text-sm text-muted-foreground">No previous versions exist for this document.</p>
                </div>
              ) : (
                versions.map((version) => (
                  <div key={version.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-background border border-border/50 flex items-center justify-center text-muted-foreground">
                        <FileText size={16} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">Version {version.version_number}</span>
                          <span className="text-xs text-muted-foreground">• {version.file_name}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span>Updated: {new Date(version.created_at).toLocaleDateString()} at {new Date(version.created_at).toLocaleTimeString()}</span>
                          {version.profiles?.full_name && (
                            <span>By: {version.profiles.full_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownload(version.file_path)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                      title="Download Version"
                    >
                      <Download size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
