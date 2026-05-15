import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  InstallFlowError: class InstallFlowError extends Error {
    constructor(
      message: string,
      readonly code: string,
      readonly status: number,
    ) {
      super(message);
    }
  },
  assertSameOriginInstallRequest: vi.fn(),
  installSystem: vi.fn(),
  parseInstallInput: vi.fn(),
}));

vi.mock('@/lib/install/security', () => ({
  assertSameOriginInstallRequest: mocks.assertSameOriginInstallRequest,
}));

vi.mock('@/lib/install/service', () => {
  return {
    InstallFlowError: mocks.InstallFlowError,
    installSystem: mocks.installSystem,
    parseInstallInput: mocks.parseInstallInput,
  };
});

import { POST } from '@/app/api/install/route';
const InstallFlowError = mocks.InstallFlowError;

describe('POST /api/install', () => {
  beforeEach(() => {
    mocks.assertSameOriginInstallRequest.mockReset();
    mocks.installSystem.mockReset();
    mocks.parseInstallInput.mockReset();
  });

  it('redirects to /admin after a successful install', async () => {
    const formData = new FormData();
    formData.set('siteName', 'NexPress');

    mocks.parseInstallInput.mockReturnValue({
      adminEmail: 'admin@example.com',
      adminPassword: 'StrongPassword!2',
      confirmPassword: 'StrongPassword!2',
      siteName: 'NexPress',
    });

    const request = new Request('https://example.com/api/install', {
      body: formData,
      method: 'POST',
    });

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://example.com/admin');
    expect(mocks.assertSameOriginInstallRequest).toHaveBeenCalledWith(request);
    expect(mocks.installSystem).toHaveBeenCalledTimes(1);
  });

  it('redirects to the install page with a safe message on validation failure', async () => {
    const formData = new FormData();
    mocks.parseInstallInput.mockImplementation(() => {
      throw new Error('Admin password must be at least 12 characters');
    });

    const response = await POST(
      new Request('https://example.com/api/install', {
        body: formData,
        method: 'POST',
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toContain('/install?error=');
  });

  it('redirects home when the site is already installed', async () => {
    const formData = new FormData();
    mocks.parseInstallInput.mockReturnValue({
      adminEmail: 'admin@example.com',
      adminPassword: 'StrongPassword!2',
      confirmPassword: 'StrongPassword!2',
      siteName: 'NexPress',
    });
    mocks.installSystem.mockRejectedValue(
      new InstallFlowError(
        'This NexPress installation has already been initialized.',
        'already-installed',
        409,
      ),
    );

    const response = await POST(
      new Request('https://example.com/api/install', {
        body: formData,
        method: 'POST',
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toContain('/?error=');
  });
});
