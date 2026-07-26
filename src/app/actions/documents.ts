'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteDocumentAction(documentId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'owner') {
    throw new Error("Only owners can delete documents")
  }

  const { error } = await supabase
    .from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', documentId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/documents')
  revalidatePath('/dashboard/employees/[id]', 'page')
  return { success: true }
}

export async function getDownloadUrlAction(filePath: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase.storage.from('documents').createSignedUrl(filePath, 60)
  
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Could not generate download link")
  }

  return data.signedUrl
}
