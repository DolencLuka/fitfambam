export type Locale = "en" | "sl";

export function isSl(locale: Locale): locale is "sl" {
  return locale === "sl";
}

export function localeFromPath(pathname: string): Locale {
  const path = normalizePath(pathname);
  return path === "/sl" || path.startsWith("/sl/") ? "sl" : "en";
}

export function homeHref(locale: Locale): string {
  return locale === "sl" ? "/sl" : "/";
}

/** Map a path to its counterpart in the other locale. Journal posts have no SL URL. */
export function siblingPath(pathname: string): string {
  const path = normalizePath(pathname);

  if (path === "/sl") return "/";
  if (path.startsWith("/sl/")) return path.slice(3) || "/";

  if (path.startsWith("/journal/")) return "/sl/journal";
  if (path === "/") return "/sl";
  return `/sl${path}`;
}

function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export const nav: Record<Locale, { href: string; label: string }[]> = {
  en: [
    { href: "/", label: "Home" },
    { href: "/journal", label: "Journal" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  sl: [
    { href: "/sl", label: "Domov" },
    { href: "/sl/journal", label: "Dnevnik" },
    { href: "/sl/about", label: "O nas" },
    { href: "/sl/contact", label: "Kontakt" },
  ],
};

const copyMap = {
  en: {
    htmlLang: "en",
    ogLocale: "en_GB",
    skip: "Skip to content",
    navAria: "Primary",
    menu: "Open menu",
    langAria: "Language",
    scroll: "Scroll",
    tagline: "A family journal from Slovenia",
    description:
      "A family journal from Luka and Mariah Dolenc in Slovenia. Movement, food, rest, and showing up with the people you love.",
    footer: {
      brand:
        "A family journal from Slovenia. Mariah’s 2015 writing, and new notes from Luka. Not a gym. Not a membership.",
      visit: "Visit",
      recent: "Recent notes",
      noTracking: "No tracking pixels. No invented reviews.",
      otherLang: "Slovenščina",
    },
    cta: {
      title: "Write when you want to",
      accent: "talk.",
      text: "No forms that pretend to send. No funnel. A real inbox, read at home.",
      button: "Contact",
    },
    photos: {
      captions: ["Near home", "Luka and Mariah", "The kitchen board", "The pier", "Looking out"] as const,
      alts: [
        "A meadow and woods in the Slovenian countryside",
        "Luka and Mariah",
        "Sandwiches on a kitchen board",
        "A pier stretching into the sea",
        "Looking out over the water from a beach",
      ] as const,
    },
    photographs: "Photographs",
    archiveKicker: "From the archive",
    archiveNote: "From the 2015 FitFamBam journal, written by Mariah.",
    contact: {
      name: "Your name",
      email: "Your email",
      message: "Message",
      placeholder: "A note is enough.",
      submit: "Open email to {email}",
    },
  },
  sl: {
    htmlLang: "sl",
    ogLocale: "sl_SI",
    skip: "Skoči na vsebino",
    navAria: "Glavna",
    menu: "Odpri meni",
    langAria: "Jezik",
    scroll: "Pomik",
    tagline: "Družinski dnevnik iz Slovenije",
    description:
      "Družinski dnevnik Luke in Mariah Dolenc iz Slovenije. Gibanje, hrana, počitek in ljudje, s katerimi živimo.",
    footer: {
      brand:
        "Družinski dnevnik iz Slovenije. Mariahini zapisi iz leta 2015 in novi zapisi Luke. Ne telovadnica. Ne članarina.",
      visit: "Obišči",
      recent: "Zadnji zapisi",
      noTracking: "Brez sledilnih pikslov. Brez izmišljenih recenzij.",
      otherLang: "English",
    },
    cta: {
      title: "Piši, kadar želiš",
      accent: "spregovoriti.",
      text: "Ni obrazcev, ki se pretvarjajo, da pošiljajo. Ni lijaka. Pravi predal, ki ga beremo doma.",
      button: "Kontakt",
    },
    photos: {
      captions: ["Blizu doma", "Luka in Mariah", "Kuhinjska deska", "Pomol", "Pogled ven"] as const,
      alts: [
        "Travnik in gozd na slovenskem podeželju",
        "Luka in Mariah",
        "Sendviči na kuhinjski deski",
        "Pomol v morje",
        "Pogled na vodo s plaže",
      ] as const,
    },
    photographs: "Fotografije",
    archiveKicker: "Iz arhiva",
    archiveNote: "Iz FitFamBam dnevnika 2015, napisala Mariah.",
    contact: {
      name: "Tvoje ime",
      email: "Tvoj e-poštni naslov",
      message: "Sporočilo",
      placeholder: "Dovolj je kratek zapis.",
      submit: "Odpri pošto za {email}",
    },
  },
} as const;

export type Copy = (typeof copyMap)[Locale];

export function copy(locale: Locale): Copy {
  return copyMap[locale];
}
