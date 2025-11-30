import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { getAdventImagePath } from './image-utils';

const ADVENT_DIR = path.join(process.cwd(), 'content', 'advent-of-devops');

// Cache for advent content
let adventCache: AdventDay[] | null = null;
let adventIndexCache: AdventIndex | null = null;
let lastCacheTime = 0;
const CACHE_DURATION =
  process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME
    ? Infinity
    : 5 * 60 * 1000;

export type AdventDay = {
  title: string;
  slug: string;
  day: number;
  excerpt?: string;
  description?: string;
  content: string;
  category?: string;
  difficulty?: string;
  publishedAt?: string;
  updatedAt?: string;
  image?: string;
  tags?: string[];
};

export type AdventIndex = {
  title: string;
  slug: string;
  excerpt?: string;
  description?: string;
  content: string;
  publishedAt?: string;
  updatedAt?: string;
  tags?: string[];
};

export async function getAllAdventDays(): Promise<AdventDay[]> {
  const now = Date.now();
  if (adventCache && now - lastCacheTime < CACHE_DURATION) {
    return adventCache;
  }

  const files = await fs.readdir(ADVENT_DIR);
  const days = await Promise.all(
    files
      .filter((f) => f.endsWith('.md') && f.startsWith('day-'))
      .map(async (filename) => {
        const filePath = path.join(ADVENT_DIR, filename);
        const file = await fs.readFile(filePath, 'utf-8');
        const { data, content } = matter(file);
        const slug = filename.replace(/\.md$/, '');
        const image = data.image || getAdventImagePath(slug);

        return {
          ...data,
          slug,
          content,
          image,
          day: data.day || parseInt(filename.replace('day-', '').replace('.md', '')),
        } as AdventDay;
      })
  );

  const sortedDays = days.sort((a, b) => a.day - b.day);

  adventCache = sortedDays;
  lastCacheTime = now;

  return sortedDays;
}

export async function getAdventDayBySlug(slug: string): Promise<AdventDay | null> {
  const days = await getAllAdventDays();
  const cachedDay = days.find((d) => d.slug === slug);

  if (cachedDay) {
    return cachedDay;
  }

  const filePath = path.join(ADVENT_DIR, `${slug}.md`);
  try {
    const file = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(file);
    const image = data.image || getAdventImagePath(slug);

    return {
      ...data,
      slug,
      content,
      image,
      day: data.day || parseInt(slug.replace('day-', '')),
    } as AdventDay;
  } catch {
    return null;
  }
}

export async function getAdventDayByNumber(dayNumber: number): Promise<AdventDay | null> {
  return getAdventDayBySlug(`day-${dayNumber}`);
}

export async function getAdventIndex(): Promise<AdventIndex | null> {
  const now = Date.now();
  if (adventIndexCache && now - lastCacheTime < CACHE_DURATION) {
    return adventIndexCache;
  }

  const filePath = path.join(ADVENT_DIR, 'index.md');
  try {
    const file = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(file);

    const index = {
      ...data,
      slug: 'advent-of-devops',
      content,
    } as AdventIndex;

    adventIndexCache = index;
    return index;
  } catch {
    return null;
  }
}

export async function getNextAdventDay(currentDay: number): Promise<AdventDay | null> {
  if (currentDay >= 25) return null;
  return getAdventDayByNumber(currentDay + 1);
}

export async function getPreviousAdventDay(currentDay: number): Promise<AdventDay | null> {
  if (currentDay <= 1) return null;
  return getAdventDayByNumber(currentDay - 1);
}

export async function getAdventProgress(): Promise<{
  totalDays: number;
  completedDays: number;
  percentComplete: number;
}> {
  const days = await getAllAdventDays();
  const today = new Date();
  const december = today.getMonth() === 11; // December is month 11
  const dayOfMonth = today.getDate();

  const completedDays = december && dayOfMonth <= 25 ? dayOfMonth : 25;

  return {
    totalDays: 25,
    completedDays,
    percentComplete: (completedDays / 25) * 100,
  };
}
