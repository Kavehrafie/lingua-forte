// Structural shape — Astro's Cookies type isn't part of the public `astro`
// module exports in v6. We only need get/set/delete, so a structural type is
// enough and avoids reaching into astro/dist.
type Cookies = {
  get(name: string): { value: string | undefined } | undefined;
  set(
    name: string,
    value: string,
    options: {
      httpOnly?: boolean;
      sameSite?: "lax" | "strict" | "none";
      secure?: boolean;
      path?: string;
      maxAge?: number;
    },
  ): void;
  delete(name: string, options?: { path?: string }): void;
};

// Draft state lives in a short-lived HTTP-only cookie. Server re-validates the
// whole shape on every POST, so tampering just produces validation errors — no
// signature/HMAC needed. The cookie is the only place state persists between
// stages.

const COOKIE_NAME = "signup_draft";
const MAX_AGE_SECONDS = 60 * 60 * 2; // 2 hours

export type SignupDraft = {
  name?: string;
  email?: string;
  courseId?: string;
  courseTitle?: string;
  slotId?: string;
  bookedFor?: number; // epoch ms
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const safeParse = (raw: string | undefined): SignupDraft | null => {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const draft: SignupDraft = {};
    if (typeof parsed.name === "string") draft.name = parsed.name;
    if (typeof parsed.email === "string") draft.email = parsed.email;
    if (typeof parsed.courseId === "string") draft.courseId = parsed.courseId;
    if (typeof parsed.courseTitle === "string")
      draft.courseTitle = parsed.courseTitle;
    if (typeof parsed.slotId === "string") draft.slotId = parsed.slotId;
    if (typeof parsed.bookedFor === "number")
      draft.bookedFor = parsed.bookedFor;
    return draft;
  } catch {
    return null;
  }
};

export const readDraft = (cookies: Cookies): SignupDraft => {
  const draft = safeParse(cookies.get(COOKIE_NAME)?.value);
  return draft ?? {};
};

export const writeDraft = (cookies: Cookies, draft: SignupDraft): void => {
  cookies.set(COOKIE_NAME, JSON.stringify(draft), {
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
};

export const clearDraft = (cookies: Cookies): void => {
  cookies.delete(COOKIE_NAME, { path: "/" });
};

// Stage-gating helpers — a stage is reachable only when every prior field has
// been collected. Used by each stage page to bounce visitors who skipped ahead.

const hasContact = (d: SignupDraft) =>
  Boolean(d.name && d.email);

const hasCourse = (d: SignupDraft) =>
  hasContact(d) && Boolean(d.courseId && d.courseTitle);

const hasSlot = (d: SignupDraft) =>
  hasCourse(d) && Boolean(d.slotId && d.bookedFor);

export const stageReached = (draft: SignupDraft): 1 | 2 | 3 | 4 => {
  if (hasSlot(draft)) return 4;
  if (hasCourse(draft)) return 3;
  if (hasContact(draft)) return 2;
  return 1;
};
