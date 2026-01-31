'use server'

import { createServiceClient } from '@/lib/supabase/service'

/**
 * Link existing customer to user account after signup
 * Called after user signs up with email that matches an existing customer
 */
export async function linkCustomerAfterSignup(userEmail: string, userId: string) {
  const serviceClient = createServiceClient()

  try {
    // Call the SQL function to link customer to user
    const { error } = await serviceClient.rpc('link_customer_to_user', {
      customer_email: userEmail,
      user_uuid: userId,
    })

    if (error) {
      console.error('Error linking customer to user:', error)
      return { success: false, error: error.message }
    }

    // Also update orders.user_id for orders that belong to this customer
    // This ensures my-bookings can find them
    const { data: customer } = await serviceClient
      .from('customers')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (customer) {
      const { error: updateError } = await serviceClient
        .from('orders')
        .update({ user_id: userId })
        .eq('customer_id', customer.id)
        .is('user_id', null) // Only update orders without user_id

      if (updateError) {
        console.error('Error updating orders user_id:', updateError)
        // Don't throw - customer is linked, orders will be visible via customer_id policy
      }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error linking customer:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

