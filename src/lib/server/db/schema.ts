import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export * from "./auth-schema";

export const page = sqliteTable("page", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  path: text("path").notNull().unique(),
  keywords: text("keywords"),
  abstract: text("abstract"),
  isPublished: integer("is_published", { mode: "boolean" })
    .notNull()
    .default(false),
  showInNavigation: integer("show_in_navigation", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date()),
});

export const pageBlock = sqliteTable(
  "page_block",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pageId: text("page_id")
      .notNull()
      .references(() => page.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    content: text("content", { mode: "json" }),
    isVisible: integer("is_visible", { mode: "boolean" })
      .notNull()
      .default(true),
    position: integer("position").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [index("page_block_pageId_idx").on(table.pageId)],
);

export const pageBlockRelation = relations(pageBlock, ({ one }) => ({
  page: one(page, {
    fields: [pageBlock.pageId],
    references: [page.id],
  }),
}));

export const pageRelation = relations(page, ({ many }) => ({
  blocks: many(pageBlock),
}));

export const interviewSlot = sqliteTable(
  "interview_slot",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    startsAt: integer("starts_at", { mode: "timestamp" }).notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
);

export const signup = sqliteTable("signup", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  // Snapshot from YAML at finalize time — the YAML may change later but
  // the signup record should stay accurate to what the visitor picked.
  courseTitle: text("course_title").notNull(),
  // Snapshot of the slot's startsAt. The slot row is hard-deleted on
  // finalize, so we can't rely on a FK to recover the date later.
  bookedFor: integer("booked_for", { mode: "timestamp" }).notNull(),
  note: text("note"),
  status: text("status", { enum: ["confirmed", "cancelled"] })
    .notNull()
    .default("confirmed"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date()),
});

export const interviewSlotRelations = relations(
  interviewSlot,
  () => ({}),
);

export const signupRelations = relations(signup, () => ({}));
