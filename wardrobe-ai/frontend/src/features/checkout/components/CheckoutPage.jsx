'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { Input, Label } from '@/components/ui/input';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { useOnboardingGuard } from '@/features/profile/hooks/useOnboardingGuard';
import { useCartStore } from '@/features/commerce/store/useCartStore';
import { useOrderStore } from '@/features/checkout/store/useOrderStore';
import { CHECKOUT_PROCESSING_MS } from '@/features/checkout/constants/checkoutOptions';
import { CheckoutOrderSummary } from '@/features/checkout/components/CheckoutOrderSummary';
import { OrderSuccess } from '@/features/checkout/components/OrderSuccess';
import { PaymentMethodSelector } from '@/features/checkout/components/PaymentMethodSelector';

const INITIAL_SHIPPING = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  pincode: '',
};

export function CheckoutPage() {
  const router = useRouter();
  const { ready } = useOnboardingGuard();

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const placeOrder = useOrderStore((state) => state.placeOrder);
  const lastOrder = useOrderStore((state) => state.lastOrder);
  const clearLastOrder = useOrderStore((state) => state.clearLastOrder);

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [shipping, setShipping] = useState(INITIAL_SHIPPING);
  const [phase, setPhase] = useState('checkout');
  const [placedOrder, setPlacedOrder] = useState(null);

  const estimatedTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    closeCart();
  }, [closeCart]);

  useEffect(() => {
    if (!ready || phase !== 'checkout') return;
    if (items.length === 0 && !placedOrder) {
      router.replace('/catalog');
    }
  }, [ready, items.length, phase, placedOrder, router]);

  const updateShipping = (field) => (event) => {
    setShipping((current) => ({ ...current, [field]: event.target.value }));
  };

  const isFormValid =
    shipping.fullName.trim() &&
    shipping.email.trim() &&
    shipping.address.trim() &&
    shipping.city.trim() &&
    shipping.pincode.trim().length >= 6;

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    if (!isFormValid || items.length === 0 || phase === 'processing') return;

    setPhase('processing');

    await new Promise((resolve) => {
      setTimeout(resolve, CHECKOUT_PROCESSING_MS);
    });

    const order = placeOrder({
      items,
      paymentMethod,
      shipping,
      total: estimatedTotal,
    });

    clearCart();
    setPlacedOrder(order);
    setPhase('success');
  };

  if (!ready) {
    return null;
  }

  if (phase === 'success' && (placedOrder || lastOrder)) {
    return (
      <DashboardLayout>
        <div className="min-h-full bg-background">
          <OrderSuccess order={placedOrder ?? lastOrder} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative min-h-full bg-background">
        {phase === 'processing' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-sm border border-borderColor bg-white dark:bg-[#150d22]/95 px-8 py-10 text-center shadow-2xl backdrop-blur-md">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-slate-900 dark:text-white" />
              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-700 dark:text-gray-400">
                Secure Payment
              </p>
              <h2 className="mt-2 font-playfair text-xl font-semibold text-slate-900 dark:text-white">
                Processing Payment...
              </h2>
              <p className="mt-2 text-sm text-slate-700 dark:text-gray-400">
                Please wait while we confirm your order.
              </p>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:px-12">
          <Link
            href="/catalog"
            onClick={() => clearLastOrder()}
            className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-gray-400 transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Catalog
          </Link>

          <header className="mb-10 border-b border-borderColor pb-6">
            <h1 className="font-playfair text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Checkout
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-700 dark:text-gray-400">
              <Lock className="h-3.5 w-3.5" />
              Secure, encrypted checkout — payment UI mock only
            </p>
          </header>

          <form onSubmit={handlePlaceOrder} className="lg:grid lg:grid-cols-5 lg:gap-12">
            <div className="space-y-10 lg:col-span-3">
              <section>
                <h2 className="font-playfair text-lg font-semibold text-slate-900 dark:text-white">
                  Shipping Details
                </h2>
                <p className="mt-1 text-sm text-slate-700 dark:text-gray-400">
                  Where should we deliver your curated pieces?
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={shipping.fullName}
                      onChange={updateShipping('fullName')}
                      placeholder="Aisha Sharma"
                      required
                      className="mt-2 rounded-none border-gray-300 bg-white dark:bg-[#150d22]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shipping.email}
                      onChange={updateShipping('email')}
                      placeholder="you@example.com"
                      required
                      className="mt-2 rounded-none border-gray-300 bg-white dark:bg-[#150d22]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={shipping.address}
                      onChange={updateShipping('address')}
                      placeholder="Flat 4B, 12 Fashion Street"
                      required
                      className="mt-2 rounded-none border-gray-300 bg-white dark:bg-[#150d22]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shipping.city}
                      onChange={updateShipping('city')}
                      placeholder="Mumbai"
                      required
                      className="mt-2 rounded-none border-gray-300 bg-white dark:bg-[#150d22]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input
                      id="pincode"
                      value={shipping.pincode}
                      onChange={updateShipping('pincode')}
                      placeholder="400001"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      className="mt-2 rounded-none border-gray-300 bg-white dark:bg-[#150d22]"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="font-playfair text-lg font-semibold text-slate-900 dark:text-white">
                  Payment Method
                </h2>
                <p className="mt-1 text-sm text-slate-700 dark:text-gray-400">Select how you would like to pay.</p>
                <div className="mt-6">
                  <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
                </div>
              </section>

              <button
                type="submit"
                disabled={!isFormValid || items.length === 0 || phase === 'processing'}
                className="w-full bg-magenta py-5 text-xs font-bold uppercase tracking-[0.3em] text-white transition-colors hover:bg-magenta disabled:cursor-not-allowed disabled:bg-gray-300 lg:max-w-md"
              >
                Place Order · {items.length > 0 ? `₹${estimatedTotal.toLocaleString('en-IN')}` : ''}
              </button>
            </div>

            <div className="mt-10 lg:col-span-2 lg:mt-0">
              <CheckoutOrderSummary items={items} />
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CheckoutPage;
