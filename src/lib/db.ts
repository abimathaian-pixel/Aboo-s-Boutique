import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import os from 'os';

function getDatabaseUrl(): string {
  // 1. If a remote cloud database URL is provided (e.g. Neon, Supabase, Turso), use it directly
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL;
  }

  // 2. When running on Vercel Serverless (process.env.VERCEL is set)
  if (process.env.VERCEL) {
    const tmpDbPath = path.join(os.tmpdir(), 'dev.db');

    // Copy the bundled SQLite database file to writable temporary directory on cold start
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        '/var/task/prisma/dev.db',
        '/var/task/dev.db',
      ];

      for (const p of candidates) {
        if (fs.existsSync(p)) {
          try {
            fs.copyFileSync(p, tmpDbPath);
            break;
          } catch (err) {
            console.error(`[Database] Error copying ${p} to ${tmpDbPath}:`, err);
          }
        }
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath.replace(/\\/g, '/')}`;
    }
  }

  // 3. Local development fallback: find exact path to prisma/dev.db
  const localDb = path.join(process.cwd(), 'prisma', 'dev.db');
  if (fs.existsSync(localDb)) {
    return `file:${localDb.replace(/\\/g, '/')}`;
  }

  return 'file:./prisma/dev.db';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
