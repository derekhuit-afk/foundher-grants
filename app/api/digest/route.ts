import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Called by Vercel Cron — every Monday at 8am
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get all active subscribers with email alerts enabled
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, subscription_tier, founder_profiles(*), alert_preferences(*)')
    .in('subscription_tier', ['tier1', 'tier2'])
    .eq('alert_preferences.weekly_digest', true)

  if (!users?.length) return NextResponse.json({ sent: 0 })

  // Get newest grants (added in last 7 days)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: newGrants } = await supabase
    .from('grants')
    .select('*')
    .eq('is_active', true)
    .gte('created_at', oneWeekAgo)
    .order('max_amount', { ascending: false })
    .limit(5)

  // Get grants closing in 30 days
  const thirtyDaysOut = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const today = new Date().toISOString().split('T')[0]
  const { data: closingGrants } = await supabase
    .from('grants')
    .select('*')
    .eq('is_active', true)
    .gte('deadline', today)
    .lte('deadline', thirtyDaysOut)
    .order('deadline', { ascending: true })
    .limit(3)

  let sent = 0
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://foundher.com'

  for (const user of users) {
    const firstName = user.full_name?.split(' ')[0] || 'Founder'

    const newGrantsHtml = (newGrants || []).map(g => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0e2c4;">
          <strong style="color: #1c1917; font-family: Georgia, serif;">${g.name}</strong><br>
          <span style="color: #888; font-size: 13px;">${g.grantor_organization}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0e2c4; text-align: right; white-space: nowrap;">
          <strong style="color: #c75f28; font-family: Georgia, serif;">${g.amount_display || `Up to $${g.max_amount?.toLocaleString()}`}</strong>
        </td>
      </tr>
    `).join('')

    const closingHtml = (closingGrants || []).map(g => {
      const days = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0e2c4;">
            <strong style="color: #1c1917; font-family: Georgia, serif;">${g.name}</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0e2c4; text-align: right; color: ${days < 7 ? '#c75f28' : '#888'}; font-size: 13px; white-space: nowrap;">
            ${days} days left
          </td>
        </tr>
      `
    }).join('')

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#fdfaf5; font-family: 'DM Sans', system-ui, sans-serif;">
  <div style="max-width:580px; margin:0 auto; padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center; margin-bottom:32px;">
      <div style="display:inline-block; width:40px; height:40px; background:#c75f28; border-radius:50%; text-align:center; line-height:40px;">
        <span style="color:white; font-family:Georgia,serif; font-weight:700;">F</span>
      </div>
      <p style="font-family:Georgia,serif; font-size:20px; font-weight:600; color:#1c1917; margin:8px 0 0;">FoundHer Grants</p>
      <p style="color:#888; font-size:12px; margin:4px 0 0; text-transform:uppercase; letter-spacing:0.1em;">Weekly Grant Digest</p>
    </div>

    <!-- Greeting -->
    <h1 style="font-family:Georgia,serif; font-size:28px; font-weight:600; color:#1c1917; margin:0 0 12px;">Good morning, ${firstName}.</h1>
    <p style="color:#666; line-height:1.6; margin:0 0 32px;">Here's your weekly round-up of new grants and upcoming deadlines.</p>

    ${newGrants?.length ? `
    <!-- New Grants -->
    <div style="background:white; border-radius:16px; padding:24px; margin-bottom:24px; border:1px solid #f0e2c4;">
      <p style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.15em; color:#c75f28; margin:0 0 16px;">New This Week</p>
      <table width="100%" cellpadding="0" cellspacing="0">${newGrantsHtml}</table>
      <a href="${appUrl}/dashboard/grants" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#c75f28; color:white; text-decoration:none; border-radius:50px; font-size:13px; font-weight:500;">Browse All Grants →</a>
    </div>` : ''}

    ${closingGrants?.length ? `
    <!-- Closing Soon -->
    <div style="background:white; border-radius:16px; padding:24px; margin-bottom:24px; border:1px solid #f0e2c4;">
      <p style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.15em; color:#c75f28; margin:0 0 16px;">Closing Soon</p>
      <table width="100%" cellpadding="0" cellspacing="0">${closingHtml}</table>
    </div>` : ''}

    ${user.subscription_tier === 'tier1' ? `
    <!-- Upgrade CTA -->
    <div style="background:linear-gradient(135deg,#c75f28,#a8481e); border-radius:16px; padding:28px; margin-bottom:24px; text-align:center;">
      <p style="font-family:Georgia,serif; font-size:20px; color:white; font-weight:600; margin:0 0 8px;">Let AI write your applications</p>
      <p style="color:rgba(255,255,255,0.8); font-size:13px; margin:0 0 20px;">Upgrade to Grant Concierge and we handle every application for you. Average award: $18,500.</p>
      <a href="${appUrl}/pricing" style="display:inline-block; padding:12px 28px; background:white; color:#c75f28; text-decoration:none; border-radius:50px; font-weight:600; font-size:14px;">See Concierge Plan →</a>
    </div>` : ''}

    <!-- Footer -->
    <div style="text-align:center; padding-top:24px; border-top:1px solid #f0e2c4;">
      <p style="color:#aaa; font-size:12px; margin:0 0 8px;">FoundHer Grants — Built for women-owned and Indigenous-owned businesses</p>
      <a href="${appUrl}/dashboard/settings" style="color:#c75f28; font-size:12px;">Manage email preferences</a>
    </div>
  </div>
</body>
</html>`

    // Send via Resend
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `FoundHer Grants <${process.env.RESEND_FROM_EMAIL}>`,
        to: user.email,
        subject: `Your weekly grant digest — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
        html,
      }),
    })
    sent++
  }

  return NextResponse.json({ sent, newGrants: newGrants?.length || 0 })
}
