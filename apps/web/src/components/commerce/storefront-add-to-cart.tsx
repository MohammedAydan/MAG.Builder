'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';

const CART_STORAGE_KEY = 'nexpress:commerce:cart-id';
const CART_EVENT_NAME = 'nexpress-commerce-cart-changed';

type StorefrontVariantOption = Readonly<{
  externalId: string;
  priceLabel: string;
  title: string;
}>;

type StorefrontAddToCartProps = Readonly<{
  buttonLabel?: string;
  commerceStatus: 'disabled' | 'enabled' | 'misconfigured' | 'unavailable';
  ctaMode: 'add-to-cart' | 'none';
  loginHref?: string;
  loginMessage?: string;
  productTitle: string;
  variants: readonly StorefrontVariantOption[];
}>;

type ApiErrorPayload = {
  error?: string;
};

type ApiCartPayload = {
  cart?: {
    externalId?: string;
  };
};

async function readErrorMessage(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload;
  return payload.error ?? 'Commerce request failed.';
}

async function createMemberCart() {
  const response = await fetch('/api/commerce/cart', {
    method: 'POST',
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(`${response.status}:${message}`);
  }

  const payload = (await response.json()) as ApiCartPayload;
  const cartId = payload.cart?.externalId;

  if (!cartId) {
    throw new Error('500:Commerce cart response was incomplete.');
  }

  return cartId;
}

async function addItem(cartId: string, variantId: string, quantity: number) {
  const response = await fetch(`/api/commerce/cart/${encodeURIComponent(cartId)}/items`, {
    body: JSON.stringify({
      quantity,
      variantId,
    }),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(`${response.status}:${message}`);
  }
}

function readStoredCartId() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(CART_STORAGE_KEY);
}

function writeStoredCartId(cartId: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (cartId) {
    window.localStorage.setItem(CART_STORAGE_KEY, cartId);
  } else {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  }

  window.dispatchEvent(new CustomEvent(CART_EVENT_NAME, { detail: { cartId } }));
}

export function StorefrontAddToCart({
  buttonLabel = 'Add to cart',
  commerceStatus,
  ctaMode,
  loginHref = '/login',
  loginMessage = 'Sign in to add this product to your cart.',
  productTitle,
  variants,
}: StorefrontAddToCartProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.externalId ?? '');
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  if (ctaMode === 'none') {
    return null;
  }

  if (commerceStatus !== 'enabled') {
    return (
      <p className="text-sm text-[var(--color-ink-muted)]">
        Commerce is unavailable for this product right now.
      </p>
    );
  }

  if (variants.length === 0) {
    return (
      <p className="text-sm text-[var(--color-ink-muted)]">
        This product is currently unavailable.
      </p>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedVariantId) {
      setFeedback('Select a variant before adding this product.');
      return;
    }

    setIsPending(true);
    setFeedback(null);

    try {
      let cartId = readStoredCartId();

      if (!cartId) {
        cartId = await createMemberCart();
        writeStoredCartId(cartId);
      }

      try {
        await addItem(cartId, selectedVariantId, quantity);
      } catch (error) {
        const message = error instanceof Error ? error.message : '500:Commerce request failed.';

        if (message.startsWith('404:')) {
          cartId = await createMemberCart();
          writeStoredCartId(cartId);
          await addItem(cartId, selectedVariantId, quantity);
        } else {
          throw error;
        }
      }

      setFeedback(`${productTitle} was added to your cart.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '500:Commerce request failed.';

      if (message.startsWith('401:')) {
        setFeedback(loginMessage);
        return;
      }

      if (message.startsWith('404:')) {
        writeStoredCartId(null);
        setFeedback('Your previous cart was no longer available. Try again.');
        return;
      }

      setFeedback(message.includes(':') ? message.split(':').slice(1).join(':') : 'Commerce request failed.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit}
    >
      {variants.length > 1 ? (
        <label className="flex flex-col gap-2 text-sm text-[var(--color-ink)]">
          <span className="font-medium">Variant</span>
          <select
            className="rounded-[var(--radius-chip)] border border-[var(--color-border-strong)] bg-white px-3 py-2"
            onChange={(event) => setSelectedVariantId(event.target.value)}
            value={selectedVariantId}
          >
            {variants.map((variant) => (
              <option
                key={variant.externalId}
                value={variant.externalId}
              >
                {variant.title} - {variant.priceLabel}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-sm text-[var(--color-ink-muted)]">
          {variants[0]?.title} - {variants[0]?.priceLabel}
        </p>
      )}

      <label className="flex max-w-[8rem] flex-col gap-2 text-sm text-[var(--color-ink)]">
        <span className="font-medium">Quantity</span>
        <input
          className="rounded-[var(--radius-chip)] border border-[var(--color-border-strong)] bg-white px-3 py-2"
          max={99}
          min={1}
          onChange={(event) => setQuantity(Number(event.target.value))}
          type="number"
          value={quantity}
        />
      </label>

      <button
        className="inline-flex items-center justify-center rounded-[var(--radius-chip)] bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-ink)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? 'Adding…' : buttonLabel}
      </button>

      {feedback ? (
        <p className="text-sm text-[var(--color-ink-muted)]">
          {feedback.includes('Sign in')
            ? <a href={loginHref}>{feedback}</a>
            : feedback}
        </p>
      ) : null}
    </form>
  );
}

export const storefrontCartStorageKey = CART_STORAGE_KEY;
export const storefrontCartEventName = CART_EVENT_NAME;
