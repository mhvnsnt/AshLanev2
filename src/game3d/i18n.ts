/**
 * i18n.ts — localization for AshLane.
 *
 * Ships with a zero-dependency string-table engine (namespaced JSON, {name}
 * interpolation, plural helpers) so menus/HUD are localizable TODAY.
 * Upgrade path: drop in i18next + react-i18next (both MIT) when the string
 * count justifies it — the namespace/key layout below maps 1:1 onto i18next
 * resources, so migration is mechanical.
 *
 * String-table discipline:
 *   - one namespace per surface: menu, hud, fighters, stages, settings
 *   - keys in snake.case
 *   - NEVER concatenate sentences — use interpolation: t("hud.wins", { name })
 *   - locale persists to localStorage AND the save envelope (saves.ts)
 */

export type Locale = "en" | "es";

type Table = Record<string, Record<string, string>>;

const TABLES: Record<Locale, Table> = {
  en: {
    menu: {
      title: "ASH LANE",
      press_start: "Press Start",
      fight: "FIGHT",
      arcade: "ARCADE",
      versus: "VERSUS",
      settings: "SETTINGS",
      roster: "FIGHTERS",
      stages: "STAGES",
      back: "BACK",
      confirm: "CONFIRM",
      quit: "QUIT",
    },
    hud: {
      round: "ROUND {{n}}",
      wins: "{{name}} WINS",
      ko: "K.O.!",
      time_up: "TIME UP",
      combo: "{{n}} HIT",
      paused: "PAUSED",
      resume: "RESUME",
    },
    settings: {
      volume: "Volume",
      music: "Music",
      language: "Language",
      reduced_motion: "Reduced motion",
      touch_controls: "Touch controls",
      auto: "Auto",
      on: "On",
      off: "Off",
    },
    fighters: {
      "stick-up": "Stick-Up",
      razor: "Razor",
      "sombra-negra": "Sombra Negra",
      judas: "Judas",
      "bill-dozer": "Bill Dozer",
      marks: "Marks",
    },
  },
  es: {
    menu: {
      title: "ASH LANE",
      press_start: "Pulsa Start",
      fight: "PELEAR",
      arcade: "ARCADE",
      versus: "VERSUS",
      settings: "AJUSTES",
      roster: "LUCHADORES",
      stages: "ESCENARIOS",
      back: "ATRÁS",
      confirm: "CONFIRMAR",
      quit: "SALIR",
    },
    hud: {
      round: "RONDA {{n}}",
      wins: "{{name}} GANA",
      ko: "¡K.O.!",
      time_up: "TIEMPO",
      combo: "{{n}} GOLPES",
      paused: "PAUSA",
      resume: "CONTINUAR",
    },
    settings: {
      volume: "Volumen",
      music: "Música",
      language: "Idioma",
      reduced_motion: "Movimiento reducido",
      touch_controls: "Controles táctiles",
      auto: "Auto",
      on: "Sí",
      off: "No",
    },
    fighters: {
      "stick-up": "Stick-Up",
      razor: "Razor",
      "sombra-negra": "Sombra Negra",
      judas: "Judas",
      "bill-dozer": "Bill Dozer",
      marks: "Marks",
    },
  },
};

const LOCALE_KEY = "ashlane:locale";
let current: Locale = "en";

try {
  const stored = localStorage.getItem(LOCALE_KEY);
  if (stored === "en" || stored === "es") current = stored;
} catch {
  /* storage unavailable — default to en */
}

export function getLocale(): Locale {
  return current;
}

export function setLocale(locale: Locale): void {
  current = locale;
  try {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
  } catch {
    /* noop */
  }
}

type Params = Record<string, string | number>;

/**
 * t("hud.round", { n: 2 }) → "ROUND 2" / "RONDA 2".
 * Falls back to en, then to the key itself — never throws, never blank.
 */
export function t(key: string, params?: Params): string {
  const [ns, k] = key.split(".");
  const table = TABLES[current]?.[ns] ?? TABLES.en[ns];
  let s = table?.[k] ?? TABLES.en[ns]?.[k] ?? key;
  if (params) {
    for (const [pk, pv] of Object.entries(params)) {
      s = s.split(`{{${pk}}}`).join(String(pv));
    }
  }
  return s;
}

/** All supported locales for the language picker. */
export const LOCALES: Array<{ code: Locale; label: string }> = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];
