import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your DHAAGAÉ order. Secure checkout with multiple payment options.',
};

export default function CheckoutPage() {
  return (
    <main className="container section-sm">
      <div className="mb-8">
        <p className="text-brand mb-2">Almost There</p>
        <h1 className="display-md text-plum">Checkout</h1>
      </div>

      <div className="card card-xl p-8 text-center">
        <div className="empty-state">
          <h2 className="empty-state-title">Checkout Flow</h2>
          <p className="empty-state-description">
            The full checkout experience will be implemented in Phase 3.
          </p>
          <a href="/cart" className="btn btn-ghost mt-4">Back to Cart</a>
        </div>
      </div>
    </main>
  );
}
