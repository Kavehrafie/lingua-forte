import { env } from "cloudflare:workers";
import { asc, eq, gt } from "drizzle-orm";
import { getDb } from "./db";
import { interviewSlot, signup as signupTable } from "./db/schema";

// ── Interview slot pool ──

// Admin sees every slot (past + future). The public signup flow only ever
// wants upcoming slots, so it passes `{ upcomingOnly: true }`.
export const listInterviewSlots = async ({
  upcomingOnly = false,
}: { upcomingOnly?: boolean } = {}) => {
  const db = getDb(env.db);
  const rows = await db
    .select()
    .from(interviewSlot)
    .where(
      upcomingOnly ? gt(interviewSlot.startsAt, new Date()) : undefined,
    )
    .orderBy(asc(interviewSlot.startsAt));
  return rows;
};

export const getInterviewSlot = async (id: string) => {
  const db = getDb(env.db);
  const [row] = await db
    .select()
    .from(interviewSlot)
    .where(eq(interviewSlot.id, id))
    .limit(1);
  return row ?? null;
};

export const addInterviewSlot = async (startsAt: Date) => {
  const db = getDb(env.db);
  return Promise.try(() =>
    db
      .insert(interviewSlot)
      .values({ startsAt })
      .returning({ id: interviewSlot.id }),
  ).then(([row]) => ({ id: row.id }));
};

export const removeInterviewSlot = async (id: string) => {
  const db = getDb(env.db);
  return Promise.try(() =>
    db
      .delete(interviewSlot)
      .where(eq(interviewSlot.id, id))
      .returning({ id: interviewSlot.id }),
  ).then((rows) => rows.length > 0);
};

// ── Signups ──

export type NewSignup = {
  fullName: string;
  email: string;
  courseTitle: string;
  bookedFor: Date;
  note?: string;
  slotId: string;
};

export const completeSignup = async (input: NewSignup) => {
  // D1 doesn't support interactive transactions (no BEGIN/COMMIT over the
  // HTTP API), so we can't wrap the insert + delete in one tx. The
  // DELETE ... RETURNING is the race guard: D1 executes it atomically, so
  // if two visitors finalize the same slot concurrently, only one gets a
  // row back. Order matters — delete first, then insert the signup only if
  // we won the slot.
  const db = getDb(env.db);

  const deleted = await db
    .delete(interviewSlot)
    .where(eq(interviewSlot.id, input.slotId))
    .returning({ id: interviewSlot.id });

  if (deleted.length === 0) {
    throw new SlotTakenError();
  }

  const [created] = await db
    .insert(signupTable)
    .values({
      fullName: input.fullName,
      email: input.email,
      courseTitle: input.courseTitle,
      bookedFor: input.bookedFor,
      note: input.note,
    })
    .returning({ id: signupTable.id });

  return { id: created.id };
};

export class SlotTakenError extends Error {
  constructor() {
    super("This interview slot was just taken.");
    this.name = "SlotTakenError";
  }
}

export const listSignups = async () => {
  const db = getDb(env.db);
  return db
    .select()
    .from(signupTable)
    .orderBy(signupTable.createdAt)
    .then((rows) => rows.reverse()); // newest first
};

export const getSignup = async (id: string) => {
  const db = getDb(env.db);
  const [row] = await db
    .select()
    .from(signupTable)
    .where(eq(signupTable.id, id))
    .limit(1);
  return row ?? null;
};

export const cancelSignup = async (id: string) => {
  // D1 has no interactive transactions, but `db.batch()` runs multiple
  // statements atomically in one round-trip. We pre-check the row, then
  // batch the status update + slot re-insert. onConflictDoNothing handles
  // the case where a slot at that timestamp already exists (admin re-added
  // it, or another cancellation beat us to it).
  const db = getDb(env.db);

  const [existing] = await db
    .select()
    .from(signupTable)
    .where(eq(signupTable.id, id))
    .limit(1);

  if (!existing) return null;
  if (existing.status === "cancelled") return { id: existing.id };

  await db.batch([
    db
      .update(signupTable)
      .set({ status: "cancelled" })
      .where(eq(signupTable.id, id)),
    db
      .insert(interviewSlot)
      .values({ startsAt: existing.bookedFor })
      .onConflictDoNothing({ target: interviewSlot.startsAt }),
  ]);

  return { id: existing.id };
};
