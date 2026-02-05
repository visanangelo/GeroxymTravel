'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function updateCustomerProfile(fullName: string, phone: string) {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  const trimmedName = fullName.trim()
  const trimmedPhone = phone.trim()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  if (!user.email) {
    return { success: false, error: 'User email not available' }
  }

  if (!trimmedPhone) {
    return { success: false, error: 'Please provide a phone number.' }
  }

  // 1) Try to find customer linked by user_id
  let customerId: string | null = null

  const { data: byUser } = await serviceClient
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (byUser) {
    customerId = byUser.id
  } else {
    // 2) Fallback: look up by email (guest bookings before signup)
    const { data: byEmail } = await serviceClient
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .single()

    if (byEmail) {
      customerId = byEmail.id
    }
  }

  let errorMessage: string | null = null

  if (customerId) {
    // Update existing customer and ensure it is linked to the user
    const { error } = await serviceClient
      .from('customers')
      .update({
        full_name: trimmedName || user.email.split('@')[0],
        phone: trimmedPhone,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)

    if (error) {
      errorMessage = error.message
    }
  } else {
    // 3) No existing customer – create a new one for this user
    const { error } = await serviceClient.from('customers').insert({
      full_name: trimmedName || user.email.split('@')[0],
      email: user.email,
      phone: trimmedPhone,
      user_id: user.id,
    })

    if (error) {
      errorMessage = error.message
    }
  }

  if (errorMessage) {
    return { success: false, error: errorMessage }
  }

  revalidatePath('/account')
  return { success: true }
}

