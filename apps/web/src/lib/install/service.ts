import { INSTALLATION_STATE_KEY, InstallationState } from '@/collections/InstallationState';
import { Users } from '@/collections/Users';
import { getPayloadClient } from '@/lib/payload';
import {
  getInstallRuntimeConfig,
  type InstallRuntimeConfig,
} from '@/lib/install/runtime-config';
import { z } from 'zod';

type FindResult<T> = {
  docs: T[];
  totalDocs?: number;
};

type PayloadClientLike = {
  create: (args: Record<string, unknown>) => Promise<unknown>;
  find: (args: Record<string, unknown>) => Promise<FindResult<unknown>>;
};

type InstallationRecord = {
  adminEmail: string;
  installedAt: string;
  siteName: string;
};

export type InstallStatus =
  | {
      kind: 'installed';
      adminEmail?: string;
      installedAt?: string;
      siteName?: string;
      source: 'installation-record' | 'existing-user';
    }
  | {
      defaultSiteName?: string;
      kind: 'not-installed';
      installationMode: InstallRuntimeConfig['NEXPRESS_INSTALLATION_MODE'];
    }
  | {
      kind: 'setup-disabled';
      message: string;
    }
  | {
      kind: 'runtime-unavailable';
      message: string;
    };

const installInputSchema = z
  .object({
    siteName: z.string().trim().min(2, 'Site name must be at least 2 characters').max(80),
    adminEmail: z.string().trim().email('A valid admin email is required').max(160),
    adminPassword: z
      .string()
      .min(12, 'Admin password must be at least 12 characters')
      .max(128, 'Admin password must be 128 characters or fewer')
      .regex(/[a-z]/, 'Admin password must include a lowercase letter')
      .regex(/[A-Z]/, 'Admin password must include an uppercase letter')
      .regex(/[0-9]/, 'Admin password must include a number')
      .regex(/[^A-Za-z0-9]/, 'Admin password must include a symbol'),
    confirmPassword: z.string(),
  })
  .superRefine(({ adminPassword, confirmPassword }, ctx) => {
    if (adminPassword !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

export type InstallInput = z.infer<typeof installInputSchema>;

export class InstallFlowError extends Error {
  constructor(
    message: string,
    readonly code: 'already-installed' | 'runtime-unavailable' | 'setup-disabled' | 'csrf',
    readonly status: number,
  ) {
    super(message);
  }
}

export function parseInstallInput(formData: FormData): InstallInput {
  const parsed = installInputSchema.safeParse({
    siteName: formData.get('siteName'),
    adminEmail: formData.get('adminEmail'),
    adminPassword: formData.get('adminPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message).join('; ');
    throw new Error(details || 'Invalid installation input');
  }

  return {
    ...parsed.data,
    adminEmail: parsed.data.adminEmail.toLowerCase(),
  };
}

function getTotalDocs<T>(result: FindResult<T>) {
  return result.totalDocs ?? result.docs.length;
}

export async function getInstallStatusFromPayload(
  payload: PayloadClientLike,
  runtimeConfig: InstallRuntimeConfig,
): Promise<InstallStatus> {
  const [installationStateResult, usersResult] = await Promise.all([
    payload.find({
      collection: InstallationState.slug,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: {
        key: {
          equals: INSTALLATION_STATE_KEY,
        },
      },
    }),
    payload.find({
      collection: Users.slug,
      limit: 1,
      overrideAccess: true,
      pagination: false,
    }),
  ]);

  const installationRecord = (installationStateResult as unknown as FindResult<InstallationRecord>)
    .docs[0];
  if (installationRecord) {
    return {
      kind: 'installed',
      adminEmail: installationRecord.adminEmail,
      installedAt: installationRecord.installedAt,
      siteName: installationRecord.siteName,
      source: 'installation-record',
    };
  }

  if (getTotalDocs(usersResult) > 0) {
    return {
      kind: 'installed',
      source: 'existing-user',
    };
  }

  if (runtimeConfig.NEXPRESS_INSTALLATION_MODE === 'locked') {
    return {
      kind: 'setup-disabled',
      message: 'Installation is locked by server configuration.',
    };
  }

  return {
    ...(runtimeConfig.NEXPRESS_DEFAULT_SITE_NAME
      ? { defaultSiteName: runtimeConfig.NEXPRESS_DEFAULT_SITE_NAME }
      : {}),
    kind: 'not-installed',
    installationMode: runtimeConfig.NEXPRESS_INSTALLATION_MODE,
  };
}

export async function getInstallStatus(): Promise<InstallStatus> {
  try {
    const runtimeConfig = getInstallRuntimeConfig();
    const payload = await getPayloadClient();

    return await getInstallStatusFromPayload(payload as unknown as PayloadClientLike, runtimeConfig);
  } catch {
    return {
      kind: 'runtime-unavailable',
      message: 'Runtime configuration or database connectivity is unavailable.',
    };
  }
}

export async function installSystemWithPayload(
  payload: PayloadClientLike,
  runtimeConfig: InstallRuntimeConfig,
  input: InstallInput,
) {
  const status = await getInstallStatusFromPayload(payload, runtimeConfig);

  if (status.kind === 'installed') {
    throw new InstallFlowError(
      'This NexPress installation has already been initialized.',
      'already-installed',
      409,
    );
  }

  if (status.kind === 'setup-disabled') {
    throw new InstallFlowError(status.message, 'setup-disabled', 403);
  }

  if (status.kind === 'runtime-unavailable') {
    throw new InstallFlowError(status.message, 'runtime-unavailable', 503);
  }

  await payload.create({
    collection: Users.slug,
    data: {
      email: input.adminEmail,
      password: input.adminPassword,
    },
    overrideAccess: true,
  });

  await payload.create({
    collection: InstallationState.slug,
    data: {
      adminEmail: input.adminEmail,
      installedAt: new Date().toISOString(),
      key: INSTALLATION_STATE_KEY,
      siteName: input.siteName,
      status: 'installed',
    },
    overrideAccess: true,
  });
}

export async function installSystem(input: InstallInput) {
  const runtimeConfig = getInstallRuntimeConfig();
  const payload = await getPayloadClient();

  return installSystemWithPayload(
    payload as unknown as PayloadClientLike,
    runtimeConfig,
    input,
  );
}
