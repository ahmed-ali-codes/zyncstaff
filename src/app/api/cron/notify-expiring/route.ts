import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    // 1. Authenticate the Cron request
    // This ensures only authorized services (like Vercel Cron) can trigger this endpoint
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const resendApiKey = process.env.RESEND_API_KEY

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error('Missing required environment variables')
    }

    // 2. Connect to Supabase using the Service Role Key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 3. Find documents expiring in the next 30 days
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const { data: expiringDocs, error: docError } = await supabase
      .from('documents')
      .select('id, document_number, expiry_date, employees(first_name, last_name), document_types(name)')
      .is('deleted_at', null)
      .lte('expiry_date', thirtyDaysFromNow.toISOString())
      .gt('expiry_date', new Date().toISOString())

    if (docError) throw docError

    if (!expiringDocs || expiringDocs.length === 0) {
      return NextResponse.json({ message: 'No documents expiring soon.' })
    }

    // 4. Fetch all active managers/owners to notify
    const { data: managers, error: managerError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('account_status', 'active')

    if (managerError) throw managerError

    const managerEmails = managers?.map(m => m.email) || []

    if (managerEmails.length === 0) {
      return NextResponse.json({ message: 'No active managers found to notify.' })
    }

    // 4.5 Create in-app notifications for the bell icon
    // First, clear old unread expiry notifications to avoid spam piling up
    await supabase
      .from('notifications')
      .delete()
      .eq('type', 'document_expiry')
      .eq('is_read', false)

    // Build a detailed message string listing the specific documents
    const docDetails = expiringDocs.map((doc: any) => {
      const empName = doc.employees ? `${doc.employees.first_name} ${doc.employees.last_name}` : 'Unknown Employee'
      const docType = doc.document_types?.name || 'Document'
      return `${docType} for ${empName}`
    }).join(', ')

    // If there are many, we might want to truncate, but for now we'll show them
    const messageText = expiringDocs.length === 1 
      ? `Expiring soon: ${docDetails}. Please review in the Vault.`
      : `${expiringDocs.length} documents expiring soon: ${docDetails}. Please review in the Vault.`

    const notificationsToInsert = managers.map(m => ({
      user_id: m.id,
      type: 'document_expiry',
      title: 'Documents Expiring Soon',
      message: messageText,
      is_read: false
    }))

    await supabase.from('notifications').insert(notificationsToInsert)

    // 5. Format the HTML Email Content
    let htmlContent = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #e11d48; margin-top: 0; font-size: 24px;">⚠️ Action Required: Documents Expiring Soon</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">The following employee documents will expire within the next 30 days. Please take action to renew them before they expire to maintain compliance.</p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <ul style="padding-left: 20px; color: #334155; margin: 0;">
    `
    
    expiringDocs.forEach((doc: any) => {
      const empName = doc.employees ? `${doc.employees.first_name} ${doc.employees.last_name}` : 'Unknown Employee'
      const docType = doc.document_types?.name || 'Document'
      htmlContent += `
        <li style="margin-bottom: 16px; font-size: 15px;">
          <strong style="color: #0f172a;">${docType}</strong> (${doc.document_number || 'No number'}) for <strong>${empName}</strong><br/>
          <span style="color: #e11d48; font-size: 14px; display: inline-block; margin-top: 4px; font-weight: 600;">
            Expires: ${new Date(doc.expiry_date).toLocaleDateString()}
          </span>
        </li>
      `
    })
    
    htmlContent += `
          </ul>
        </div>
        
        <p style="margin-top: 30px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://zyncstaff.com'}/dashboard/documents" style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Review Documents in Dashboard</a>
        </p>
      </div>
    `

    // 6. Send the email via Resend
    // Note: If your Resend account is unverified, 'onboarding@resend.dev' will only send to the email you signed up with.
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'ZyncStaff Alerts <onboarding@resend.dev>',
        to: managerEmails,
        subject: `⚠️ Action Required: ${expiringDocs.length} Document(s) Expiring Soon`,
        html: htmlContent,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(`Resend API Error: ${data.message || JSON.stringify(data)}`)
    }

    return NextResponse.json({ 
      message: 'Notifications sent successfully', 
      resendResponse: data,
      documentsCount: expiringDocs.length
    })

  } catch (err: any) {
    console.error('Error in cron job:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
