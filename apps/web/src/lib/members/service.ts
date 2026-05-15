import { z } from 'zod';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAuditContext, AUDIT_ACTIONS, writeAuditEntry } from '@/lib/audit/service';
import { getPayloadClient } from '@/lib/payload';
import type { AuthenticatedMemberLike } from '@/lib/auth/access';

const MEMBER_COOKIE_NAME = 'nexpress-member-token';
const MEMBER_PASSWORD_MIN_LENGTH = 12;
const MEMBER_EMAIL_MAX_LENGTH = 160;
const MEMBER_NAME_MAX_LENGTH = 80;
const MEMBER_SESSION_FALLBACK_TTL_SECONDS = 60 * 60 * 24 * 7;

type MemberLoginResult = {
  exp?: number;
  token?: string;
  user?: {
    email?: string | null;
    firstName?: string | null;
    id: number | string;
    lastName?: string | null;
  };
};

type MemberPayloadClient = {
  auth: (args: { headers: Headers }) => Promise<{ user?: { collection?: string | null; email?: string | null; firstName?: string | null; id: number | string; lastName?: string | null } | null }>;
  create: (args: Record<string, unknown>) => Promise<unknown>;
  login: (args: Record<string, unknown>) => Promise<MemberLoginResult>;
  update: (args: Record<string, unknown>) => Promise<unknown>;
};

const emailSchema = z
  .string()
  .trim()
  .email()
  .max(MEMBER_EMAIL_MAX_LENGTH)
  .transform((value) => value.toLowerCase());

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required.')
  .max(MEMBER_NAME_MAX_LENGTH, 'Name is too long.');

const optionalNameSchema = z
  .string()
  .trim()
  .max(MEMBER_NAME_MAX_LENGTH, 'Name is too long.')
  .optional()
  .transform((value) => value || undefined);

const passwordSchema = z
  .string()
  .min(MEMBER_PASSWORD_MIN_LENGTH, `Password must be at least ${MEMBER_PASSWORD_MIN_LENGTH} characters.`)
  .refine((value) => /[a-z]/.test(value), 'Password must include a lowercase letter.')
  .refine((value) => /[A-Z]/.test(value), 'Password must include an uppercase letter.')
  .refine((value) => /\d/.test(value), 'Password must include a number.')
  .refine((value) => /[^A-Za-z0-9]/.test(value), 'Password must include a symbol.');

const signupInputSchema = z
  .object({
    email: emailSchema,
    firstName: nameSchema,
    lastName: optionalNameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const loginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.'),
});

const profileInputSchema = z.object({
  firstName: nameSchema,
  lastName: optionalNameSchema,
});

export class MemberAuthError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'invalid-input'
      | 'invalid-session'
      | 'login-failed'
      | 'member-exists'
      | 'not-authenticated',
    readonly status: number,
  ) {
    super(message);
  }
}

function buildPasswordSafeError(message: string) {
  return new MemberAuthError(message, 'invalid-input', 400);
}

export function parseSignupInput(input: unknown) {
  const result = signupInputSchema.safeParse(input);

  if (!result.success) {
    throw buildPasswordSafeError(result.error.issues[0]?.message ?? 'Invalid sign-up request.');
  }

  return result.data;
}

export function parseLoginInput(input: unknown) {
  const result = loginInputSchema.safeParse(input);

  if (!result.success) {
    throw new MemberAuthError('Email and password are required.', 'invalid-input', 400);
  }

  return result.data;
}

export function parseProfileInput(input: unknown) {
  const result = profileInputSchema.safeParse(input);

  if (!result.success) {
    throw new MemberAuthError(result.error.issues[0]?.message ?? 'Invalid profile update.', 'invalid-input', 400);
  }

  return result.data;
}

export function getMemberCookieName() {
  return MEMBER_COOKIE_NAME;
}

export function buildMemberCookieOptions(expiresAt?: Date) {
  return {
    expires: expiresAt,
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  };
}

export function buildMemberLoginPath(returnTo?: string | null) {
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return '/login';
  }

  return `/login?next=${encodeURIComponent(returnTo)}`;
}

function normalizeErrorMessage(error: unknown) {
  if (error instanceof MemberAuthError) {
    return error.message;
  }

  return 'Unable to complete that request right now.';
}

function getExpDate(exp?: number) {
  if (!exp || !Number.isFinite(exp)) {
    return new Date(Date.now() + MEMBER_SESSION_FALLBACK_TTL_SECONDS * 1000);
  }

  return new Date(exp * 1000);
}

function mapMember(user: {
  collection?: string | null;
  email?: string | null;
  firstName?: string | null;
  id: number | string;
  lastName?: string | null;
}): AuthenticatedMemberLike {
  return {
    collection: 'members',
    email: user.email ?? null,
    firstName: user.firstName ?? null,
    id: user.id,
    lastName: user.lastName ?? null,
  };
}

async function getPayload() {
  return (await getPayloadClient()) as unknown as MemberPayloadClient;
}

export async function registerMember(input: unknown) {
  const payload = await getPayload();
  const parsed = parseSignupInput(input);

  try {
    const member = await payload.create({
      collection: 'members',
      context: createAuditContext({
        actor: {
          email: parsed.email,
          role: null,
          source: 'user',
        },
      }),
      data: {
        email: parsed.email,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        password: parsed.password,
      },
      overrideAccess: true,
    });

    return member;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';

    if (message.includes('duplicate') || message.includes('unique') || message.includes('already')) {
      throw new MemberAuthError(
        'Unable to create account with those credentials.',
        'member-exists',
        409,
      );
    }

    throw error;
  }
}

export async function loginMember(input: unknown) {
  const payload = await getPayload();
  const parsed = parseLoginInput(input);

  try {
    const result = await payload.login({
      collection: 'members',
      data: {
        email: parsed.email,
        password: parsed.password,
      },
      overrideAccess: true,
    });

    if (!result.token || !result.user) {
      throw new MemberAuthError('Invalid email or password.', 'login-failed', 401);
    }

    const expiresAt = getExpDate(result.exp);
    const cookieStore = await cookies();
    cookieStore.set(MEMBER_COOKIE_NAME, result.token, buildMemberCookieOptions(expiresAt));

    return {
      expiresAt,
      member: mapMember({
        collection: 'members',
        email: result.user.email ?? null,
        firstName: result.user.firstName ?? null,
        id: result.user.id,
        lastName: result.user.lastName ?? null,
      }),
    };
  } catch (error) {
    if (error instanceof MemberAuthError) {
      throw error;
    }

    throw new MemberAuthError('Invalid email or password.', 'login-failed', 401);
  }
}

export async function clearMemberSession() {
  const cookieStore = await cookies();
  cookieStore.set(MEMBER_COOKIE_NAME, '', {
    ...buildMemberCookieOptions(new Date(0)),
    expires: new Date(0),
    maxAge: 0,
  });
}

export async function logoutMember() {
  const payload = await getPayload();
  const member = await getAuthenticatedMember();

  await clearMemberSession();

  if (member) {
    await writeAuditEntry(payload, {
      action: AUDIT_ACTIONS.memberLogoutSucceeded,
      actor: {
        ...(member.email ? { email: member.email } : {}),
        role: null,
        source: 'user',
        userId: member.id,
      },
      result: 'success',
      targetCollection: 'members',
      targetId: member.id,
    });
  }
}

export async function getAuthenticatedMember() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await getPayload();
  const authResult = await payload.auth({
    headers: new Headers({
      Authorization: `Bearer ${token}`,
    }),
  });

  if (!authResult.user || authResult.user.collection !== 'members') {
    return null;
  }

  return mapMember(authResult.user);
}

export async function requireAuthenticatedMember(returnTo = '/account') {
  const member = await getAuthenticatedMember();

  if (!member) {
    redirect(buildMemberLoginPath(returnTo));
  }

  return member;
}

export async function updateAuthenticatedMemberProfile(input: unknown) {
  const payload = await getPayload();
  const member = await getAuthenticatedMember();

  if (!member) {
    throw new MemberAuthError('You must be signed in.', 'not-authenticated', 401);
  }

  const parsed = parseProfileInput(input);

  return payload.update({
    collection: 'members',
    context: createAuditContext({
      actor: {
        ...(member.email ? { email: member.email } : {}),
        role: null,
        source: 'user',
        userId: member.id,
      },
    }),
    data: parsed,
    id: member.id,
    overrideAccess: false,
    req: {
      user: member,
    },
  });
}

export async function getMemberAwareHeaders() {
  const requestHeaders = await headers();
  return new Headers(requestHeaders);
}

export function getSafeMemberErrorMessage(error: unknown) {
  return normalizeErrorMessage(error);
}
