import { env } from "cloudflare:workers";
import { getDb } from "./db";

export const getPageByID = async (id: string) => {
  const db = getDb(env.db);
  return db.query.page.findFirst({
    where: (page, { eq }) => eq(page.id, id),
    with: {
      blocks: {
        orderBy: (pageBlock, { desc }) => desc(pageBlock.position),
      },
    },
  });
};
