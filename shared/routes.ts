import { z } from 'zod';
import { insertUserProfileSchema, insertProductSchema, insertOrderSchema, userProfiles, products, orders, commissions } from './schema';
import { users } from './models/auth';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  profile: {
    get: {
      method: 'GET' as const,
      path: '/api/profile' as const,
      responses: {
        200: z.custom<typeof userProfiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/profile' as const,
      input: insertUserProfileSchema.partial(),
      responses: {
        200: z.custom<typeof userProfiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    create: { // For initial setup
      method: 'POST' as const,
      path: '/api/profile' as const,
      input: insertUserProfileSchema,
      responses: {
        201: z.custom<typeof userProfiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id' as const,
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: z.object({
        productId: z.number(),
        amount: z.number(),
        paymentMethod: z.string(),
        guestEmail: z.string().optional(),
        guestPhone: z.string().optional(),
        ambassadorId: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
      },
    }
  },
  admin: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/admin/dashboard' as const,
      responses: {
        200: z.object({
          totalSales: z.number(),
          zone1Sales: z.number(),
          zone2Sales: z.number(),
          commissionsPending: z.number(),
          ambassadorsCount: z.number(),
        }),
        403: errorSchemas.unauthorized,
      },
    },
    ambassadors: {
      method: 'GET' as const,
      path: '/api/admin/ambassadors' as const,
      responses: {
        200: z.array(z.custom<typeof userProfiles.$inferSelect & { email: string | null }>()),
      },
    },
    approveAmbassador: {
      method: 'POST' as const,
      path: '/api/admin/ambassadors/:id/approve' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    }
  },
  ambassador: {
    stats: {
      method: 'GET' as const,
      path: '/api/ambassador/stats' as const,
      responses: {
        200: z.object({
          totalSales: z.number(),
          commissionEarned: z.number(),
          zoneQuota: z.number(),
        }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
