import { getCollection, type CollectionEntry } from "astro:content";
import { isOriginalPhotoPost } from "./journal";

/** Home featured slots: original photographs only, skip duplicate stock. */
export async function featuredJournal(limit = 3): Promise<CollectionEntry<"journal">[]> {
  const all = (await getCollection("journal")).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  const picked: CollectionEntry<"journal">[] = [];
  const usedSrc = new Set<string>();

  for (const post of all) {
    if (picked.length >= limit) break;
    if (!isOriginalPhotoPost(post)) continue;
    const hero = post.data.hero;
    if (!hero) continue;
    if (usedSrc.has(hero.src)) continue;
    usedSrc.add(hero.src);
    picked.push(post);
  }

  return picked;
}
