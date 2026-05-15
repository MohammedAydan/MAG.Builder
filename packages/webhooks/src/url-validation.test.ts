import { isSafeWebhookUrl, WebhookUrlSchema } from './url-validation';
import { describe, expect, it } from 'vitest';

describe('Webhook URL Validation', () => {
  it('allows safe https urls', () => {
    expect(isSafeWebhookUrl('https://example.com/webhook')).toBe(true);
  });

  it('allows safe http urls', () => {
    expect(isSafeWebhookUrl('http://example.com/webhook')).toBe(true);
  });

  it('rejects localhost', () => {
    expect(isSafeWebhookUrl('https://localhost:3000/webhook')).toBe(false);
  });

  it('rejects 127.0.0.1', () => {
    expect(isSafeWebhookUrl('http://127.0.0.1/webhook')).toBe(false);
  });

  it('rejects internal IPs (10.x.x.x)', () => {
    expect(isSafeWebhookUrl('http://10.0.0.1/webhook')).toBe(false);
  });

  it('rejects internal IPs (172.16.x.x)', () => {
    expect(isSafeWebhookUrl('http://172.16.0.1/webhook')).toBe(false);
  });

  it('rejects internal IPs (192.168.x.x)', () => {
    expect(isSafeWebhookUrl('http://192.168.1.1/webhook')).toBe(false);
  });

  it('rejects cloud metadata IPs', () => {
    expect(isSafeWebhookUrl('http://169.254.169.254/latest/meta-data/')).toBe(false);
  });

  it('rejects data/file/javascript urls', () => {
    expect(isSafeWebhookUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeWebhookUrl('file:///etc/passwd')).toBe(false);
    expect(isSafeWebhookUrl('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D')).toBe(false);
  });
  
  it('schema validates', () => {
    expect(WebhookUrlSchema.safeParse('https://example.com').success).toBe(true);
    expect(WebhookUrlSchema.safeParse('http://127.0.0.1').success).toBe(false);
    expect(WebhookUrlSchema.safeParse('not a url').success).toBe(false);
  });
});
