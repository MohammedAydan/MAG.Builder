/**
 * Email action foundation for NexPress forms workflows.
 *
 * Phase 14 ships a provider-agnostic interface and a stub/no-op implementation.
 * A real email provider (e.g., Resend, SendGrid, SMTP) must be configured in a
 * future phase. The stub logs safely — it does NOT expose secrets, user data,
 * or internal config.
 *
 * Provider gap: No email provider is configured in Phase 14. Email actions
 * will no-op and return { sent: false, reason: 'no-provider' } until a
 * provider is integrated. Operators must configure EMAIL_PROVIDER_* variables
 * in a future phase to enable real email delivery.
 */

export type EmailRecipient = {
  /** Must be a valid email address. Validated before sending. */
  email: string;
  /** Display name — must not contain raw user-submitted content. */
  name?: string;
};

export type EmailActionConfig = {
  /** Reply-to email. Operator-configured only. */
  replyTo?: string;
  /** Recipient. Operator-configured only. */
  to: EmailRecipient;
};

export type EmailPayload = {
  /** Form slug for context. */
  formSlug: string;
  /** Safe summary — no raw field values, no secrets. */
  summary: string;
  /** Timestamp of submission. */
  submittedAt: string;
};

export type EmailActionResult =
  | { reason: string; sent: false }
  | { messageId?: string; sent: true };

export type EmailProviderKind = 'resend' | 'stub';

export type ResendEmailProviderConfig = {
  apiKey: string;
  from: string;
  replyTo?: string;
};

/**
 * Provider-agnostic email action interface.
 * Implement this interface to integrate a real email provider.
 */
export interface EmailProvider {
  send(config: EmailActionConfig, payload: EmailPayload): Promise<EmailActionResult>;
}

function buildEmailText(payload: EmailPayload) {
  return [
    `Form: ${payload.formSlug}`,
    `Submitted at: ${payload.submittedAt}`,
    `Summary: ${payload.summary}`,
  ].join('\n');
}

export class ResendEmailProvider implements EmailProvider {
  constructor(private readonly config: ResendEmailProviderConfig) {}

  async send(config: EmailActionConfig, payload: EmailPayload): Promise<EmailActionResult> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.config.from,
        to: [config.to.name ? `${config.to.name} <${config.to.email}>` : config.to.email],
        ...(config.replyTo ?? this.config.replyTo
          ? { reply_to: config.replyTo ?? this.config.replyTo }
          : {}),
        subject: `New submission for ${payload.formSlug}`,
        text: buildEmailText(payload),
      }),
    });

    if (!response.ok) {
      return { reason: `Email provider returned ${response.status}.`, sent: false };
    }

    const body = (await response.json().catch(() => ({}))) as { id?: string };
    return { ...(body.id ? { messageId: body.id } : {}), sent: true };
  }
}

/**
 * Stub email provider.
 *
 * Returns { sent: false, reason: 'no-provider' } for all calls.
 * Logs a warning without exposing secrets, tokens, or personal data.
 */
export const stubEmailProvider: EmailProvider = {
  async send(_config, _payload) {
    console.warn(
      '[email] No email provider is configured. Email action skipped. ' +
        'Configure an email provider in a future phase to enable email delivery.',
    );
    return { reason: 'no-provider', sent: false };
  },
};

/**
 * Execute an email action.
 *
 * Uses the stub provider in Phase 14.
 * The provider never receives raw user field values — only the form slug and
 * a safe summary string that the server constructs.
 */
export async function executeEmailAction(
  provider: EmailProvider,
  config: EmailActionConfig,
  payload: EmailPayload,
): Promise<EmailActionResult> {
  try {
    return await provider.send(config, payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[email] Email action failed:', message);
    return { reason: 'Email delivery failed.', sent: false };
  }
}
