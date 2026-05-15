export const DEFAULT_SENSITIVE_KEYS = [
  "password",
  "secret",
  "token",
  "apikey",
  "api_key",
  "authorization",
  "database_url",
  "payload_secret",
  "medusa"
];

export function isSensitiveKey(key: string, sensitiveKeys: string[] = DEFAULT_SENSITIVE_KEYS): boolean {
  const lowerKey = key.toLowerCase();
  return sensitiveKeys.some(sensitiveKey => lowerKey.includes(sensitiveKey));
}

export function redactSensitiveFields(obj: unknown, sensitiveKeys: string[] = DEFAULT_SENSITIVE_KEYS): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveFields(item, sensitiveKeys));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (isSensitiveKey(key, sensitiveKeys)) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = redactSensitiveFields(value, sensitiveKeys);
    }
  }

  return result;
}
