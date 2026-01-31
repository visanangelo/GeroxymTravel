import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

/**
 * Allocate tickets and mark order as paid. Used by:
 * - finalizeOrder (server action, after auth check)
 * - Stripe webhook (after payment confirmed)
 * Idempotent: allocate_tickets throws if order status is not 'created'.
 */
export async function finalizeOrderLogic(orderId: string): Promise<{
  success: boolean
  seatNumbers: number[]
}> {
  const serviceClient = createServiceClient()

  const { data: order } = await serviceClient
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single()

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.status !== 'created') {
    return {
      success: true,
      seatNumbers: [],
    }
  }

  const { data, error } = await serviceClient.rpc('allocate_tickets', {
    order_id_param: orderId,
  })

  if (error) {
    throw new Error(`Failed to finalize order: ${error.message}`)
  }

  revalidatePath('/checkout')
  revalidatePath('/account')
  revalidatePath('/routes')

  const seatNumbers = (data || []).map((row: { seat_no: number }) => row.seat_no).sort((a, b) => a - b)
  return { success: true, seatNumbers }
}
