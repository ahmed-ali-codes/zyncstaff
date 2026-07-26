'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, UploadCloud, Loader2 } from 'lucide-react'
import Tesseract from 'tesseract.js'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'

export function UploadDocumentButton({ employees = [], documentTypes = [] }: { employees?: any[], documentTypes?: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ocrStatus, setOcrStatus] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  
  const [docTypes, setDocTypes] = useState<any[]>(documentTypes)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isCustomType, setIsCustomType] = useState(false)
  const [customTypeName, setCustomTypeName] = useState('')

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile) return alert("Please select a file to upload.")
    
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const employeeId = formData.get('employee_id') as string
    const docTypeId = formData.get('document_type_id') as string
    const docNumber = formData.get('document_number') as string
    const issueDate = formData.get('issue_date') as string
    const expiryDate = formData.get('expiry_date') as string

    try {
      // 1. OCR Processing (if it's an image)
      let ocrData = null
      if (selectedFile.type.startsWith('image/')) {
        setOcrStatus('Extracting text with OCR...')
        const result = await Tesseract.recognize(selectedFile, 'eng')
        ocrData = { text: result.data.text }
      }

      // 2. Handle Custom Document Type
      let finalDocTypeId = docTypeId
      if (isCustomType && customTypeName.trim()) {
        const { data: newType, error: typeErr } = await supabase
          .from('document_types')
          .insert({ name: customTypeName.trim(), is_system: false, has_expiry: true })
          .select('id')
          .single()
        
        if (typeErr) throw typeErr
        finalDocTypeId = newType.id
      }

      // 2.5 Check for existing document
      const { data: existingDocs, error: checkError } = await supabase
        .from('documents')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('document_type_id', finalDocTypeId)
        .is('deleted_at', null)
        .limit(1)
        
      if (checkError) throw checkError
      
      const existingDoc = existingDocs && existingDocs.length > 0 ? existingDocs[0] : null
      
      if (existingDoc) {
        if (!window.confirm("A document of this type already exists for this employee. Do you want to replace it and save the old file to version history?")) {
          setLoading(false)
          return
        }
      }

      // 3. Upload to Supabase Storage
      setOcrStatus('Uploading securely to Vault...')
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${employeeId}/${fileName}`

      // Convert File to ArrayBuffer to bypass React 19/Next.js fetch polyfill issues
      const fileBuffer = await selectedFile.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, fileBuffer, { 
          contentType: selectedFile.type,
          upsert: false 
        })

      if (uploadError) throw uploadError

      // 4. Save to documents table
      setOcrStatus('Saving records...')
      const { data: userData } = await supabase.auth.getUser()
      
      if (existingDoc) {
        // Find max version
        const { data: maxVersionData } = await supabase
          .from('document_versions')
          .select('version_number')
          .eq('document_id', existingDoc.id)
          .order('version_number', { ascending: false })
          .limit(1)
          
        const nextVersion = maxVersionData && maxVersionData.length > 0 ? maxVersionData[0].version_number + 1 : 1
        
        // Insert old version into history
        const { error: versionError } = await supabase.from('document_versions').insert({
          document_id: existingDoc.id,
          version_number: nextVersion,
          file_path: existingDoc.file_path,
          file_name: existingDoc.file_name,
          change_note: 'Updated via upload modal',
          created_by: userData.user?.id
        })
        if (versionError) throw versionError
        
        // Update existing document
        const { error: updateError } = await supabase.from('documents').update({
          document_number: docNumber || null,
          issue_date: issueDate || null,
          expiry_date: expiryDate || null,
          file_path: filePath,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          ocr_data: ocrData,
          uploaded_by: userData.user?.id,
          updated_at: new Date().toISOString()
        }).eq('id', existingDoc.id)
        if (updateError) throw updateError
      } else {
        // Normal insert
        const { error: dbError } = await supabase.from('documents').insert({
          employee_id: employeeId,
          document_type_id: finalDocTypeId,
          document_number: docNumber || null,
          issue_date: issueDate || null,
          expiry_date: expiryDate || null,
          file_path: filePath,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          ocr_data: ocrData,
          uploaded_by: userData.user?.id
        })
        if (dbError) throw dbError
      }

      // Reset state and close modal
      setIsCustomType(false)
      setCustomTypeName('')
      setIsOpen(false)
      setSelectedFile(null)
      router.refresh()
    } catch (err: any) {
      console.error("Upload Error:", err)
      alert(`Upload failed: ${err.message}`)
    } finally {
      setLoading(false)
      setOcrStatus('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger 
        render={
          <button 
            className="group relative inline-flex justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-spring hover:opacity-90 active:scale-[0.98] items-center gap-2"
          >
            <Plus size={16} strokeWidth={2} />
            <span>Upload Document</span>
          </button>
        }
      />

      <DialogContent className="max-w-2xl sm:max-w-2xl p-0 border-0 bg-transparent shadow-none" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Upload Document</DialogTitle>

        <div className="w-full double-bezel-outer bg-background shadow-2xl mx-auto">
          <div className="double-bezel-inner p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tighter">Upload to Vault</h2>
              <p className="text-sm text-muted-foreground mt-1">Securely upload and digitize compliance documents.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* File Drop Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }}
                onDrop={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setSelectedFile(e.dataTransfer.files[0])
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  selectedFile ? 'border-primary bg-primary/5' : 
                  isDragging ? 'border-primary bg-primary/10' : 
                  'border-border/50 hover:border-primary/50 hover:bg-muted/30'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileSelect}
                  accept="image/*,.pdf"
                />
                <UploadCloud className={`mx-auto mb-3 ${selectedFile ? 'text-primary' : 'text-muted-foreground'}`} size={32} strokeWidth={1.5} />
                {selectedFile ? (
                  <p className="text-sm font-semibold text-primary">{selectedFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium mb-1">Click to select or drag and drop</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">PDF, JPG, PNG up to 10MB</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Employee</label>
                  <select required name="employee_id" className="block w-full rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
                    <option value="">Select Employee...</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Document Type</label>
                  <select 
                    required={!isCustomType} 
                    name="document_type_id" 
                    onChange={(e) => setIsCustomType(e.target.value === 'custom')}
                    className="block w-full rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  >
                    <option value="">Select Type...</option>
                    {docTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                    <option value="custom">+ Add Custom Type</option>
                  </select>
                  
                  {isCustomType && (
                    <input 
                      type="text" 
                      required 
                      value={customTypeName}
                      onChange={(e) => setCustomTypeName(e.target.value)}
                      placeholder="Enter new type name..." 
                      className="mt-3 block w-full rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Document Number</label>
                  <input name="document_number" type="text" className="block w-full rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Issue Date</label>
                  <input name="issue_date" type="date" className="block w-full rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Expiry Date</label>
                  <input name="expiry_date" type="date" className="block w-full rounded-xl border border-input bg-background/50 px-4 py-3 sm:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
                </div>
              </div>

              <div className="pt-6 border-t border-border/50 flex justify-end gap-3 items-center">
                {loading && <span className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin" size={14}/> {ocrStatus}</span>}
                <button 
                  type="button" 
                  onClick={() => !loading && setIsOpen(false)}
                  className="px-6 py-3 text-sm font-semibold text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="inline-flex justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-spring hover:opacity-90 active:scale-[0.98] items-center gap-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Processing...' : 'Upload & Digitize'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
