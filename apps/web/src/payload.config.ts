import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';
import { AuditLogs } from './collections/AuditLogs';
import { FormSubmissions } from './collections/FormSubmissions';
import { Forms } from './collections/Forms';
import { InstallationState } from './collections/InstallationState';
import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { PluginStates } from './collections/PluginStates';
import { Posts } from './collections/Posts';
import { Redirects } from './collections/Redirects';
import { Users } from './collections/Users';


const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * PAYLOAD_SECRET and DATABASE_URL are validated at runtime by apps/web/src/lib/env.ts
 * when the Next.js app boots. Here we fall back to empty strings so that Payload CLI
 * commands (generate:types, generate:importmap, migrate:create) can run without a live
 * database connection. A missing PAYLOAD_SECRET in production will cause Payload to fail
 * to sign sessions — this is caught by env.ts before the server starts.
 *
 * Security note: overrideAccess is NOT used anywhere in this config.
 */
const payloadSecret = process.env.PAYLOAD_SECRET ?? '';
const databaseUrl = process.env.DATABASE_URL ?? '';

/** Migrations are committed as source files. */
const migrationsDir = path.resolve(dirname, 'migrations');

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, InstallationState, AuditLogs, PluginStates, Forms, FormSubmissions, Media, Pages, Posts, Redirects],
  editor: lexicalEditor({}),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
    migrationDir: migrationsDir,
  }),
});
