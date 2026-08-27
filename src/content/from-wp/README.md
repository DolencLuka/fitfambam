# Old WordPress export (selective)

Source: cPanel backup already on Luka’s Mac at
`/Users/lukadolenc/Sites/fitfambam.com/` (zip + sql.gz + unpacked public_html).
Drive copy of the same zip is private; gdown cannot fetch it without making
the file public. Chrome on this box has Google sign-in disabled.

## What this folder is

Mariah’s first-person posts and the old HOME intro, with product/MLM copy
removed. Do **not** publish these as Luka’s journal without a rewrite.
The live Astro pages stay Astro + tokens.

## Language

English only (`WPLANG` empty). Timezone was America/Los_Angeles.
Slovenia / Ljubljana is the setting. No Slovenian locale or translated pages.

## Theme (not Avada)

Active: **SCRN** (Themeforest parallax portfolio).
Also present: **Mobera** (Cohhe). Page builder Visual Composer.
Slider: Revolution Slider. No Avada child theme.

## Site IA (published)

Menu: HOME, BLOG, RECIPES, BECOME FAMILY.

Pages:
- HOME (`welcome`) — Mariah intro + later CTAs (product CTAs dropped)
- BLOG — empty stub
- RECIPES — empty stub
- BECOME FAMILY — skip (recruiting / product)
- DISCLAIMERS — skip (product claims)

Posts:
- I Let My Baby Eat Dirt (2015-06-24)
- Open Chicken Rice Cake Sandwiches (2015-06-25)
- Motherhood Is Making Me Ugly (2015-07-07)
- 4 Things I Would Have Done Differently During Pregnancy (2015-07-10)
- Pregnancy: What They Don’t Tell You (2015-07-14)
- Step Away From The Diet… — skipped (product claims)
- Pre-Pregnancy / Prenatal / Postpartum product post — skipped
- Draft: My City, Ljubljana (2015-06-19)

Author display name: Mariah. Second WP user: Andrej Bergant (hosting).

## Photos already in src/assets/from-wp/

Keepers converted to WebP, each under ~300 KB except the pebble-beach at 309 KB.

- fitfambam-wordmark.webp — old FIT FAM BAM type on bokeh (site logo photo)
- md-monogram.webp — Mariah JK Dolenc monogram (do not replace the Astro SVG wordmark)
- couple.webp — Luka and Mariah portrait (also copied to family.webp)
- piran-square.webp — Mariah and baby in a coastal square (likely Piran)
- forest-walk.webp — Mariah and baby in pine woods
- countryside-meadow.webp — meadow / woods (also copied to about-slovenia.webp)
- kitchen-board.webp — sandwiches on a board (also copied to about-kitchen.webp)
- beach-looking-out.webp / beach-pier.webp — California-style beach
- toddler-garden.webp / toddler-pebble-beach.webp — children; archive only

Skipped: one couple selfie in front of a branded building.

Many more originals remain on the Mac under
`.../public_html/wp-content/uploads/` (2015–2016 bulk, 2018 beach/food/logo).
The Mac dropped mid-copy once; more 2016/12 photoshoot files were not pulled.

## Migrate vs leave

Migrate:
- Family/Slovenia facts from HOME + Ljubljana draft (rewrite in Luka’s voice)
- Real photos in from-wp (About already uses three)
- Wordmark photo as a reference, not as a second logo

Leave:
- Product / recruiting / disclaimer pages
- Visual Composer and slider markup
- Empty BLOG and RECIPES pages
- wp-admin, plugins, cache, logs, stats
- Mariah monogram as the live site mark
- Children photos on public pages
