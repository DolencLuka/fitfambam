import { getCollection, type CollectionEntry } from "astro:content";

/** Home featured slots: prefer real photographs, skip duplicate stock, then type cards. */
export async function featuredJournal(limit = 3): Promise<CollectionEntry<"journal">[]> {
  const all = (await getCollection("journal")).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  const picked: CollectionEntry<"journal">[] = [];
  const usedSrc = new Set<string>();

  for (const post of all) {
    if (picked.length >= limit) break;
    const hero = post.data.hero;
    if (!hero) continue;
    if (usedSrc.has(hero.src)) continue;
    usedSrc.add(hero.src);
    picked.push(post);
  }

  if (picked.length < limit) {
    for (const post of all) {
      if (picked.length >= limit) break;
      if (picked.some((p) => p.id === post.id)) continue;
      picked.push(post);
    }
  }

  return picked;
}
