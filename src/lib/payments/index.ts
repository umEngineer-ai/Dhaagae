export type PaymentMethod = 'COD' | 'CARD' | 'JAZZCASH' | 'EASYPAISA';

export type PaymentResult =
  | { enabled: true; status: 'PENDING' | 'PROCESSING'; method: PaymentMethod }
  | { enabled: false; error: string };

/**
 * Payment providers intentionally remain server-side. COD is the only enabled
 * provider until a real gateway integration and credentials are configured.
 */
export function preparePayment(method: PaymentMethod): PaymentResult {
  if (method === 'COD') return { enabled: true, status: 'PENDING', method };
  return { enabled: false, error: 'This payment provider is not configured yet.' };
}
