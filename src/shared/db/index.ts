import { PrismaClient } from "@prisma/client";
import { AsyncLocalStorage } from "node:async_hooks";

// Multi-Tenant Context Storage
export interface TenantContext {
  tenantId?: string;
  storeId?: string;
  isSuperadmin?: boolean;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

/**
 * Execute a function within an explicit tenant context.
 */
export function withTenantContext<T>(
  context: TenantContext,
  fn: () => Promise<T>
): Promise<T> {
  return tenantStorage.run(context, fn);
}

// Global Singleton for Prisma Client to prevent connection leaks
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const rawPrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = rawPrisma;
}

/**
 * Prisma Client Extension with Multi-Tenant Row-Level Isolation Guard
 * Automatically scopes models by tenant_id when running inside a tenant context.
 */
export const db = rawPrisma.$extends({
  query: {
    tenant: {
      async findMany({ args, query }) {
        const ctx = tenantStorage.getStore();
        if (ctx?.tenantId && !ctx.isSuperadmin) {
          args.where = { ...args.where, id: ctx.tenantId };
        }
        return query(args);
      },
      async findFirst({ args, query }) {
        const ctx = tenantStorage.getStore();
        if (ctx?.tenantId && !ctx.isSuperadmin) {
          args.where = { ...args.where, id: ctx.tenantId };
        }
        return query(args);
      },
    },
    store: {
      async findMany({ args, query }) {
        const ctx = tenantStorage.getStore();
        if (ctx?.tenantId && !ctx.isSuperadmin) {
          args.where = { ...args.where, tenantId: ctx.tenantId };
        }
        return query(args);
      },
      async findFirst({ args, query }) {
        const ctx = tenantStorage.getStore();
        if (ctx?.tenantId && !ctx.isSuperadmin) {
          args.where = { ...args.where, tenantId: ctx.tenantId };
        }
        return query(args);
      },
    },
    customer: {
      async findMany({ args, query }) {
        const ctx = tenantStorage.getStore();
        if (ctx?.tenantId && !ctx.isSuperadmin) {
          args.where = { ...args.where, tenantId: ctx.tenantId };
        }
        return query(args);
      },
      async findFirst({ args, query }) {
        const ctx = tenantStorage.getStore();
        if (ctx?.tenantId && !ctx.isSuperadmin) {
          args.where = { ...args.where, tenantId: ctx.tenantId };
        }
        return query(args);
      },
    },
    user: {
      async findMany({ args, query }) {
        const ctx = tenantStorage.getStore();
        if (ctx?.tenantId && !ctx.isSuperadmin) {
          args.where = { ...args.where, tenantId: ctx.tenantId };
        }
        return query(args);
      },
      async findFirst({ args, query }) {
        const ctx = tenantStorage.getStore();
        if (ctx?.tenantId && !ctx.isSuperadmin) {
          args.where = { ...args.where, tenantId: ctx.tenantId };
        }
        return query(args);
      },
    },
  },
});

export type ExtendedPrismaClient = typeof db;
export { rawPrisma as prisma };
