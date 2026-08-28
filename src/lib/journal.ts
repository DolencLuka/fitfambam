import type { CollectionEntry } from "astro:content";

type JournalPost = CollectionEntry<"journal">;

/** True when the hero is the shared designed empty-archive still. */
export function isDesignedHero(post: JournalPost): boolean {
  const hero = post.data.hero;
  return Boolean(hero && hero.src.includes("empty-archive"));
}

/** True when the post has an original photograph, not a borrowed still. */
export function isOriginalPhotoPost(post: JournalPost): boolean {
  const hero = post.data.hero;
  if (!hero) return false;
  // Designed empty-archive still is not a photograph.
  if (isDesignedHero(post)) return false;
  // Luka's 2026 welcome: a real couple photograph.
  if (post.id === "this-journal-is-ours") return true;
  const src = hero.src;
  if (src.includes("from-wp/journal")) return true;
  // couple.webp (and hashed couple.*) is not an original for other essays.
  if (src.includes("couple")) return false;
  return true;
}

export function splitJournal(posts: JournalPost[]): {
  photographs: JournalPost[];
  archive: JournalPost[];
} {
  const photographs: JournalPost[] = [];
  const archive: JournalPost[] = [];
  for (const post of posts) {
    if (isOriginalPhotoPost(post)) photographs.push(post);
    else archive.push(post);
  }
  return { photographs, archive };
}
