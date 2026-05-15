'use client';

import { useEffect, useState } from 'react';
import { storefrontCartEventName, storefrontCartStorageKey } from './storefront-add-to-cart';

type StorefrontCartProps = Readonly<{
  checkoutLabel: string;
  commerceStatus: 'disabled' | 'enabled' | 'misconfigured' | 'unavailable';
  emptyMessage: string;
  loginHref?: string;
  loginMessage: string;
  showCheckoutAction: boolean;
  title?: string;
}>;

type StorefrontCartSummary = Readonly<{
  currencyCode: string;
  externalId: string;
  itemCount: number;
  items: ReadonlyArray<{
    externalId: string;
    quantity: number;
    title: string;
    total: {
      amount: number;
      currencyCode: string;
    };
    unitPrice: {
      amount: number;
      currencyCode: string;
    };
  }>;
  total: {
    amount: number;
    currencyCode: string;
  };
}>;

type CartApiPayload = {
  cart?: StorefrontCartSummary;
  error?: string;
};

type CheckoutApiPayload = {
  error?: string;
  order?: {
    externalId: string;
    total: {
      amount: number;
      currencyCode: string;
    };
  };
};

function formatMoney(amount: number, currencyCode: string) {
  return new Intl.NumberFormat('en-US', {
    currency: currencyCode.toUpperCase(),
    style: 'currency',
  }).format(amount / 100);
}

function readStoredCartId() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(storefrontCartStorageKey);
}

function clearStoredCartId() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(storefrontCartStorageKey);
  window.dispatchEvent(new CustomEvent(storefrontCartEventName, { detail: { cartId: null } }));
}

async function loadCart(cartId: string) {
  const response = await fetch(`/api/commerce/cart/${encodeURIComponent(cartId)}`);
  const payload = (await response.json().catch(() => ({}))) as CartApiPayload;

  if (!response.ok) {
    throw new Error(`${response.status}:${payload.error ?? 'Commerce request failed.'}`);
  }

  if (!payload.cart) {
    throw new Error('500:Commerce cart response was incomplete.');
  }

  return payload.cart;
}

async function checkoutCart(cartId: string) {
  const response = await fetch(`/api/commerce/cart/${encodeURIComponent(cartId)}/checkout`, {
    method: 'POST',
  });
  const payload = (await response.json().catch(() => ({}))) as CheckoutApiPayload;

  if (!response.ok) {
    throw new Error(`${response.status}:${payload.error ?? 'Commerce request failed.'}`);
  }

  if (!payload.order) {
    throw new Error('500:Commerce checkout response was incomplete.');
  }

  return payload.order;
}

export function StorefrontCart({
  checkoutLabel,
  commerceStatus,
  emptyMessage,
  loginHref = '/login',
  loginMessage,
  showCheckoutAction,
  title,
}: StorefrontCartProps) {
  const [cart, setCart] = useState<StorefrontCartSummary | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (commerceStatus !== 'enabled') {
      return;
    }

    let cancelled = false;

    async function refreshCart() {
      const cartId = readStoredCartId();

      if (!cartId) {
        if (!cancelled) {
          setCart(null);
          setFeedback(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      try {
        const nextCart = await loadCart(cartId);

        if (!cancelled) {
          setCart(nextCart);
          setFeedback(null);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '500:Commerce request failed.';

        if (!cancelled) {
          if (message.startsWith('401:')) {
            setCart(null);
            setFeedback(loginMessage);
          } else if (message.startsWith('404:')) {
            clearStoredCartId();
            setCart(null);
            setFeedback(emptyMessage);
          } else {
            setCart(null);
            setFeedback(message.includes(':') ? message.split(':').slice(1).join(':') : 'Commerce request failed.');
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void refreshCart();

    function handleCartChange() {
      void refreshCart();
    }

    window.addEventListener(storefrontCartEventName, handleCartChange);

    return () => {
      cancelled = true;
      window.removeEventListener(storefrontCartEventName, handleCartChange);
    };
  }, [commerceStatus, emptyMessage, loginMessage]);

  async function handleCheckout() {
    if (!cart) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const order = await checkoutCart(cart.externalId);
      clearStoredCartId();
      setCart(null);
      setFeedback(`Checkout test order ${order.externalId} was recorded for ${formatMoney(order.total.amount, order.total.currencyCode)}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '500:Commerce request failed.';
      setFeedback(message.includes(':') ? message.split(':').slice(1).join(':') : 'Commerce request failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (commerceStatus !== 'enabled') {
    return (
      <div className="rounded-[var(--radius-surface)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-5 text-sm text-[var(--color-ink-muted)]">
        Commerce is unavailable for this storefront right now.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-[var(--radius-surface)] border border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-5">
      {title ? (
        <h3 className="text-xl font-semibold text-[var(--color-ink)]">{title}</h3>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-[var(--color-ink-muted)]">Loading cart…</p>
      ) : null}

      {!isLoading && (!cart || cart.itemCount < 1) ? (
        <p className="text-sm text-[var(--color-ink-muted)]">{feedback ?? emptyMessage}</p>
      ) : null}

      {!isLoading && cart && cart.itemCount > 0 ? (
        <>
          <ul className="space-y-3">
            {cart.items.map((item) => (
              <li
                key={item.externalId}
                className="rounded-[var(--radius-surface)] bg-white px-4 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">{item.title}</p>
                    <p className="text-sm text-[var(--color-ink-muted)]">
                      Qty {item.quantity} · {formatMoney(item.unitPrice.amount, item.unitPrice.currencyCode)} each
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {formatMoney(item.total.amount, item.total.currencyCode)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-[var(--color-border-strong)] pt-4">
            <p className="text-sm text-[var(--color-ink-muted)]">{cart.itemCount} item(s)</p>
            <p className="text-base font-semibold text-[var(--color-ink)]">
              {formatMoney(cart.total.amount, cart.total.currencyCode)}
            </p>
          </div>

          {showCheckoutAction ? (
            <button
              className="inline-flex items-center justify-center rounded-[var(--radius-chip)] bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-ink)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              onClick={handleCheckout}
              type="button"
            >
              {isSubmitting ? 'Processing…' : checkoutLabel}
            </button>
          ) : null}
        </>
      ) : null}

      {feedback && feedback === loginMessage ? (
        <p className="text-sm text-[var(--color-ink-muted)]">
          <a href={loginHref}>{feedback}</a>
        </p>
      ) : null}

      {feedback && feedback !== loginMessage && cart?.itemCount ? (
        <p className="text-sm text-[var(--color-ink-muted)]">{feedback}</p>
      ) : null}
    </div>
  );
}
