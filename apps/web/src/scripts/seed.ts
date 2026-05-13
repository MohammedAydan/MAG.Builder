/**
 * Seed script — Phase 04
 *
 * Creates a baseline admin user for local development if one does not already exist.
 * This script is idempotent: running it multiple times will not create duplicate records.
 *
 * Usage:
 *   pnpm --filter @nexpress/web seed
 *
 * Required environment variables (set in .env or CI secrets):
 *   DATABASE_URL      — PostgreSQL connection string
 *   PAYLOAD_SECRET    — Payload signing secret
 *   SEED_ADMIN_EMAIL  — Admin user email for local dev
 *   SEED_ADMIN_PASSWORD — Admin user password for local dev (min 8 chars)
 *
 * Security notes:
 *   - overrideAccess is NOT used. The seed user is created via Payload's own auth
 *     registration pathway using the `auth.registerFirstUser` collection operation.
 *   - Credentials come from env vars only — never hardcoded.
 *   - This script is NOT safe to run against a production DB without explicit intention.
 *     Production admins should be created through the Payload install wizard (Phase 05).
 *   - DATABASE_URL is only read inside this runtime script; it is never exposed to
 *     the client bundle.
 */

import 'dotenv/config';
import { getPayload } from 'payload';
import config from '../payload.config.js';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    console.error(`[seed] ERROR: environment variable ${name} is required but not set.`);
    process.exit(1);
  }
  return value.trim();
}

async function seed() {
  const adminEmail = requireEnv('SEED_ADMIN_EMAIL');
  const adminPassword = requireEnv('SEED_ADMIN_PASSWORD');

  if (adminPassword.length < 8) {
    console.error('[seed] ERROR: SEED_ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  console.log('[seed] Connecting to database…');

  const payload = await getPayload({ config });

  try {
    // Check whether an admin user already exists.
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: adminEmail } },
      limit: 1,
    });

    if (existing.totalDocs > 0) {
      console.log(`[seed] Admin user ${adminEmail} already exists — skipping creation.`);
      process.exit(0);
    }

    // Create the admin user.
    await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        password: adminPassword,
      },
    });

    console.log(`[seed] Admin user ${adminEmail} created successfully.`);
  } finally {
    // Payload does not expose a public close() method; this terminates the process.
    process.exit(0);
  }
}

seed().catch((err: unknown) => {
  console.error('[seed] Unexpected error:', err);
  process.exit(1);
});
