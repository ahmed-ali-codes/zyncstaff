'use client'

import { useState } from 'react'
import { MoreVertical, Eye, Download, Trash2, History } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { deleteDocumentAction, getDownloadUrlAction } from '@/app/actions/documents'
import { DocumentHistoryModal } from './document-history-modal'

export function DocumentActions({ documentId, fileUrl, userRole }: { documentId: string, fileUrl: string, userRole?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const handleDownload = async () => {
    try {
      const url = await getDownloadUrlAction(fileUrl)
      window.open(url, '_blank')
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to move this document to trash?")) return
    setLoading(true)
    
    try {
      await deleteDocumentAction(documentId)
      // The server action handles revalidation
    } catch (error: any) {
      alert(`Error deleting document: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button onClick={handleDownload} className="text-muted-foreground hover:text-foreground p-1 transition-colors" title="Preview/Download">
          <Download size={16} strokeWidth={1.5} />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground p-1 transition-colors focus:outline-none">
            <MoreVertical size={16} strokeWidth={1.5} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border/50 rounded-xl">
            <DropdownMenuItem onClick={handleDownload} className="cursor-pointer gap-2 py-2.5">
              <Eye size={14} /> Preview
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => setIsHistoryOpen(true)} className="cursor-pointer gap-2 py-2.5">
              <History size={14} /> View History
            </DropdownMenuItem>

            {userRole === 'owner' && (
              <DropdownMenuItem onClick={handleDelete} disabled={loading} className="cursor-pointer gap-2 py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash2 size={14} /> Move to Trash
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DocumentHistoryModal 
        documentId={documentId} 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
    </>
  )
}
