// prisma.config.ts
// Root-level Prisma configuration for Prisma 7+

export default {
  datasources: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DATABASE_URL_UNPOOLED,
  },
};
