import type { Metadata } from 'next';
import CheckoutClient from '@/components/CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your DHAAGAÉ order. Secure checkout with multiple payment options.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
