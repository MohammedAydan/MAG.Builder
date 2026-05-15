import { AsyncLocalStorage } from 'node:async_hooks';
import * as crypto from 'node:crypto';

export interface RequestContext {
  requestId: string;
  [key: string]: unknown;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

export function getRequestId(): string | undefined {
  return getRequestContext()?.requestId;
}

export function runWithRequestContext<R>(context: Partial<RequestContext>, callback: () => R): R {
  const requestId = context.requestId || crypto.randomUUID();
  const store = { ...context, requestId };
  return asyncLocalStorage.run(store, callback);
}
