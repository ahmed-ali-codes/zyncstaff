'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function getTableName(type: string) {
  switch (type) {
    case 'employee': return 'employees'
    case 'document': return 'documents'
    case 'visa_task': return 'visa_tasks'
    default: throw new Error('Unknown type')
  }
}

export async function restoreItemAction(id: string, type: string) {
  const supabase = await createClient()
  const tableName = getTableName(type)

  const { error } = await supabase
    .from(tableName)
    .update({ deleted_at: null })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/trash')
  return { success: true }
}

export async function hardDeleteItemAction(id: string, type: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'owner') {
    throw new Error("Only owners can permanently delete items")
  }

  const tableName = getTableName(type)

  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/trash')
  return { success: true }
}
