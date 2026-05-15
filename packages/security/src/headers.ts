export const defaultSecurityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN" // Payload might need SAMEORIGIN if it frames itself, else DENY
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  }
];

export function getCspHeader(isDev: boolean = process.env.NODE_ENV === "development") {
  // A staged CSP that allows Payload CMS and Next.js to function
  // In production, we'd want to tighten this further.
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self' https: ws: wss:",
    "media-src 'self'",
    "object-src 'self' data:",
    "frame-src 'self'",
    "worker-src 'self' blob: data:",
    "child-src 'self' blob: data:"
  ];

  return {
    key: "Content-Security-Policy",
    value: csp.join("; ")
  };
}
