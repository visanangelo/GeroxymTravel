import { z } from 'zod'

const uuid = z.string().uuid('ID invalid')

/** Schema for createOfflineOrder FormData (admin). */
export const createOfflineOrderSchema = z.object({
  route_id: uuid,
  quantity: z.coerce.number().int().min(1).max(200),
  customer_name: z.string().min(1, 'Numele este obligatoriu').max(200).trim(),
  phone: z.string().min(1, 'Telefonul este obligatoriu').max(50).trim(),
})

export type CreateOfflineOrderInput = z.infer<typeof createOfflineOrderSchema>

/** Parse FormData for createOfflineOrder. Throws Error with first validation message. */
export function parseCreateOfflineOrderFormData(formData: FormData): CreateOfflineOrderInput {
  const raw = {
    route_id: formData.get('route_id'),
    quantity: formData.get('quantity'),
    customer_name: formData.get('customer_name'),
    phone: formData.get('phone'),
  }
  const parsed = createOfflineOrderSchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.errors[0]
    throw new Error(first?.message ?? 'Date invalide')
  }
  return parsed.data
}

/** Schema for finalizeOrder orderId. */
export const finalizeOrderSchema = z.object({
  orderId: uuid,
})

export type FinalizeOrderInput = z.infer<typeof finalizeOrderSchema>

/** Validate orderId for finalizeOrder. Throws ZodError with message. */
export function parseFinalizeOrderOrderId(orderId: unknown): string {
  const parsed = finalizeOrderSchema.safeParse({ orderId })
  if (!parsed.success) {
    const first = parsed.error.errors[0]
    throw new Error(first?.message ?? 'ID comandă invalid')
  }
  return parsed.data.orderId
}
