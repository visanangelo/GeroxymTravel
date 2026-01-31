'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function updateCustomerProfile(
  fullName: string,
  phone: string
) {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Find customer by user_id
  const { data: customer } = await serviceClient
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!customer) {
    return { success: false, error: 'Customer not found' }
  }

  // Update customer
  const { error } = await serviceClient
    .from('customers')
    .update({
      full_name: fullName,
      phone: phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customer.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/account')
  return { success: true }
}

