import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const from = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

const resend = apiKey ? new Resend(apiKey) : null

export type SendEmailParams = {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

/**
 * Send a single email via Resend API.
 * No-op if RESEND_API_KEY is not set (e.g. local dev without env).
 */
export async function sendEmail(params: SendEmailParams): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[email] RESEND_API_KEY not set, skipping send:', params.to, params.subject)
    }
    return { ok: false, error: 'RESEND_API_KEY not configured' }
  }

  const to = Array.isArray(params.to) ? params.to : [params.to]
  const { data, error } = await resend.emails.send({
    from: from as string,
    to,
    subject: params.subject,
    html: params.html,
    replyTo: params.replyTo,
  })

  if (error) {
    console.error('[email] Resend error:', error)
    return { ok: false, error: error.message }
  }
  return { ok: true, id: data?.id }
}

/**
 * Send booking confirmation email (stub: subject + simple HTML).
 * TODO: integrate with order data and optional PDF attachment when SmartBill is ready.
 */
export async function sendBookingConfirmation(params: {
  to: string
  orderId: string
  locale?: string
  /** Optional: attach invoice PDF when available */
  pdfBuffer?: Buffer
  pdfFilename?: string
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const subject = params.locale === 'ro' ? 'Confirmare rezervare' : 'Booking confirmation'
  const html = `
    <p>${params.locale === 'ro' ? 'Bună ziua,' : 'Hello,'}</p>
    <p>${params.locale === 'ro' ? 'Rezervarea ta a fost confirmată.' : 'Your booking has been confirmed.'}</p>
    <p>${params.locale === 'ro' ? 'Număr comandă:' : 'Order ID:'} <strong>${params.orderId}</strong></p>
    <p>${params.locale === 'ro' ? 'Poți vedea detaliile în contul tău.' : 'You can view details in your account.'}</p>
  `.trim()

  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[email] sendBookingConfirmation skipped (no RESEND_API_KEY):', params.to, params.orderId)
    }
    return { ok: false, error: 'RESEND_API_KEY not configured' }
  }

  const attachments =
    params.pdfBuffer && params.pdfFilename
      ? [{ filename: params.pdfFilename, content: params.pdfBuffer }]
      : undefined

  const { data, error } = await resend.emails.send({
    from: from as string,
    to: params.to,
    subject,
    html,
    attachments,
  })

  if (error) {
    console.error('[email] sendBookingConfirmation error:', error)
    return { ok: false, error: error.message }
  }
  return { ok: true, id: data?.id }
}
