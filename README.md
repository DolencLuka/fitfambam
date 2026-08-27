# FitFamBam

Family journal for Luka and Mariah Dolenc: fitness and family life from Slovenia.
Static Astro. English now. Slovenian later.

Later domain: FitFamBam.com.
Later hosting: GitHub + Cloudflare Pages.
This folder is the whole site. No page builder.

## Local

Needs Node 22.12 or newer (Node 24 is fine). Scripts live in package.json:

- install — dependencies
- dev — local server, usually http://localhost:4321
- build — writes static files to dist/
- preview — serves dist so you can screenshot it

Cloudflare Pages, when GitHub is connected:

- Build command: the build script in package.json
- Output directory: dist
- Optional Wrangler: pages dev against the dist folder

No secrets in the repo. Placeholder inbox: hello@fitfambam.com.

## Design tokens (for the designer)

All colour, type, space, radius, and shadow live in one file:

src/styles/tokens.css

Every token has a plain-language comment. Change --color-accent and the
highlight word, links, and focus ring follow. Change --font-display and every
headline follows. Do not add one-off palettes in components.

This visual system is a 2026 reading of SCRN (FinalDestiny / Cristi Macovei):
photography as the design, a full-viewport intro, thin tracked type, a
transparent header that becomes a slim sticky bar, one quiet accent.

Fonts are self-hosted in src/fonts/:

- Display: Outfit (ExtraLight, wide tracking). The 2015 FIT FAM BAM wordmark
  is the north star — not Oswald, not condensed gym type.
- Body: Instrument Sans (readable, not Inter)

Wordmark: SVG in src/components/Wordmark.astro (thin square + aperture, plus
tracked name). Favicon is separate. Do not replace the header mark with the
Mariah monogram. The historic bokeh wordmark (fitfambam-wordmark.webp) is a
photograph from 2015; it appears on About, and the home intro recreates the
same thin white caps in type.

## Photographs

Public pages use keepers from src/assets/from-wp/: couple, meadow,
kitchen board, beaches. The home photo grid is those five only.

Do not put children photos on public pages (piran-square, forest-walk,
toddler-garden, toddler-pebble-beach, and similar). They stay in from-wp/
as archive files only.

## Journal posts

MDX in src/content/journal/. Schema in src/content.config.ts.

Frontmatter fields: title, description, pubDate, hero, heroAlt, tags,
author (Mariah Dolenc | Luka Dolenc), archive (boolean, default false).

hero is a local image path, for example ../../assets/from-wp/couple.webp.

Slug comes from the filename: this-journal-is-ours.mdx becomes
/journal/this-journal-is-ours.

Mariah’s 2015 posts are archive: true. Do not rewrite them as Luka’s.
Do not invent lifestyle posts for Luka.

## Pages

- / Home — one-page photography rhythm (intro, about, photos, writing, contact)
- /about Luka and Mariah, family, Slovenia, what this is not
- /journal Index of notes
- /journal/[slug] A note
- /contact Mailto form — no fake backend
- /sl Slovenian stub

Language switcher: EN is live, SL points at /sl ("coming").
Header: Home, Journal, About, Contact.

## What comes later

- Slovenian copy on /sl and a real language switch
- A form endpoint (today: mailto:hello@fitfambam.com)
- Shop, if it ever belongs here — it does not yet
- GitHub + Cloudflare Pages once OAuth is set up
- More of our own photographs, still no children on public pages

Do not buy a domain from this project.

## Stack

Astro (static), MDX, TypeScript, vanilla CSS.

## Voice

Family-first. No miracle claims. No invented testimonials. No gym-franchise tone.
