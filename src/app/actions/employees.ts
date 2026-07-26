'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteEmployeeAction(employeeId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'owner') {
    throw new Error("Only owners can delete employees")
  }

  const { error } = await supabase
    .from('employees')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', employeeId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/employees')
  return { success: true }
}

export async function updateEmployeeAction(id: string, updateData: any) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    throw new Error("Profile not found")
  }

  const { error } = await supabase
    .from('employees')
    .update(updateData)
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/employees')
  revalidatePath(`/dashboard/employees/${id}`, 'page')
  return { success: true }
}
