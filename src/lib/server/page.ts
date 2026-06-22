import { env } from "cloudflare:workers";
import { eq, asc, sql, desc } from "drizzle-orm";
import { getDb } from "./db";
import { page, pageBlock } from "./db/schema";

export const listPages = async () => {
  const db = getDb(env.db);
  return db.query.page.findMany({
    orderBy: desc(page.createdAt),
    columns: {
      id: true,
      title: true,
      path: true,
      isPublished: true,
      updatedAt: true,
    },
  });
};

export const getPageByID = async (id: string) => {
  const db = getDb(env.db);
  return db.query.page.findFirst({
    where: (page, { eq }) => eq(page.id, id),
    with: {
      blocks: {
        orderBy: (pageBlock, { asc }) => asc(pageBlock.position),
      },
    },
  });
};

export const getPublishedPageByPath = async (path: string) => {
  const db = getDb(env.db);
  return db.query.page.findFirst({
    where: (page, { eq, and }) => and(eq(page.path, path), eq(page.isPublished, true)),
    with: {
      blocks: {
        orderBy: (pageBlock, { asc }) => asc(pageBlock.position),
      },
    },
  });
};

export const getBlockById = async (id: string) => {
  const db = getDb(env.db);
  return db.query.pageBlock.findFirst({
    where: eq(pageBlock.id, id),
  });
};

export const getPageBlocks = async (pageId: string) => {
  const db = getDb(env.db);
  return db.query.pageBlock.findMany({
    where: eq(pageBlock.pageId, pageId),
    orderBy: asc(pageBlock.position),
  });
};

export const nextBlockPosition = async (pageId: string) => {
  const db = getDb(env.db);
  const result = await db
    .select({ max: sql<number>`max(${pageBlock.position})` })
    .from(pageBlock)
    .where(eq(pageBlock.pageId, pageId));
  const max = result[0]?.max ?? -1;
  return max + 1;
};
