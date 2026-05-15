export function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      // We generally omit stack traces for safe logging to external systems unless in strict debug mode.
      // But for internal server logs, stack traces are useful. We will include it here, but 
      // the application should be careful when exposing this to clients.
      stack: error.stack,
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return { message: 'Unknown error', details: String(error) };
}

/**
 * Creates a generic safe error object to be returned to clients, ensuring
 * no sensitive internal details or stack traces are leaked.
 */
export function safeClientError(error: unknown, fallbackMessage = "An unexpected error occurred"): Record<string, unknown> {
  return {
    error: fallbackMessage
  };
}
