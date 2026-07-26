'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePasswordAction(password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    throw new Error(error.message)
  }

  // Audit log
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('audit_logs').insert({
      action: 'UPDATE',
      entity_type: 'password',
      entity_id: user.id,
      user_id: user.id,
      details: { message: 'User changed their password' }
    })
  }

  revalidatePath('/dashboard/settings')
}
