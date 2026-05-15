import { createElement } from 'react';
import type { BuilderExternalBlockRenderArgs, JsonObject } from '@nexpress/builder-core';
import {
  StorefrontCartBlock,
  StorefrontProductDetailBlock,
  StorefrontProductGridBlock,
  type CommerceCartProps,
  type CommerceProductDetailProps,
  type CommerceProductGridProps,
} from '@/components/commerce/storefront-blocks';

export function renderCommerceBuilderBlock(args: BuilderExternalBlockRenderArgs) {
  switch (args.type) {
    case 'commerce.product-grid':
      return createElement(StorefrontProductGridBlock, {
        props: args.props as JsonObject as CommerceProductGridProps,
      });
    case 'commerce.product-detail':
      return createElement(StorefrontProductDetailBlock, {
        props: args.props as JsonObject as CommerceProductDetailProps,
      });
    case 'commerce.cart':
      return createElement(StorefrontCartBlock, {
        props: args.props as JsonObject as CommerceCartProps,
      });
    default:
      return null;
  }
}
