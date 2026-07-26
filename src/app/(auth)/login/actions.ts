'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // get IP address (basic approach, better in middleware for real production)
  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for') || 'unknown'
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Check Rate Limit & Account Status
  const { data: allowed, error: checkError } = await supabase.rpc('check_login_attempts', {
    p_ip_address: ip,
    p_email: email,
  })

  if (!allowed) {
    return { error: 'Account disabled due to multiple failed login attempts. Please contact the owner.' }
  }

  // 2. Attempt Auth
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // 3. Log Failed Attempt
    await supabase.from('login_attempts').insert([
      { ip_address: ip, email: email, is_successful: false }
    ])

    return { error: error.message }
  }

  // Success
  await supabase.from('login_attempts').insert([
    { ip_address: ip, email: email, is_successful: true }
  ])

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}
