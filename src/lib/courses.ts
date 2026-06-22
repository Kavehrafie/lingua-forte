import { getCollection, getEntry } from "astro:content";

export type Course = {
  id: string;
  title: string;
  description: string;
};

export const listCourses = async (): Promise<readonly Course[]> => {
  const entries = await getCollection("courses");
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.data.title,
    description: entry.data.description,
  }));
};

export const findCourseById = async (id: string): Promise<Course | undefined> => {
  const entry = await getEntry("courses", id);
  if (!entry) return undefined;
  return {
    id: entry.id,
    title: entry.data.title,
    description: entry.data.description,
  };
};

export const isValidCourseId = async (id: string): Promise<boolean> =>
  (await findCourseById(id)) !== undefined;
