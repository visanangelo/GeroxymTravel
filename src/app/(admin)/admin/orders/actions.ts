'use server'

import { createOfflineOrder as createOfflineOrderShared } from '@/lib/admin/orders-actions'

export async function createOfflineOrder(formData: FormData, _locale: string) {
  return createOfflineOrderShared(formData, undefined)
}
