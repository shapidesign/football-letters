#!/usr/bin/env node
/**
 * Fetches current-season clubs from Wikipedia and writes clubs-data.json
 * Run: node scripts/fetch-clubs.mjs
 */

import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'clubs-data.json');

const UA = 'WallOfLoveBot/1.0 (educational project)';
const DELAY_MS = 200;

const ISRAEL_HE = {
  'Beitar Jerusalem F.C.': '\u05D1\u05D9\u05EA\u05F4\u05E8 \u05D9\u05E8\u05D5\u05E9\u05DC\u05D9\u05DD',
  'Bnei Sakhnin F.C.': '\u05D1\u05E0\u05D9 \u05E1\u05DB\u05E0\u05D9\u05DF',
  'F.C. Ashdod': '\u05DE.\u05E1. \u05D0\u05E9\u05D3\u05D5\u05D3',
  'Hapoel Be\'er Sheva F.C.': '\u05D4\u05E4\u05D5\u05E2\u05DC \u05D1\u05D0\u05E8 \u05E9\u05D1\u05E2',
  'Hapoel Haifa F.C.': '\u05D4\u05E4\u05D5\u05E2\u05DC \u05D7\u05D9\u05E4\u05D4',
  'Hapoel Jerusalem F.C.': '\u05D4\u05E4\u05D5\u05E2\u05DC \u05D9\u05E8\u05D5\u05E9\u05DC\u05D9\u05DD',
  'Hapoel Petah Tikva F.C.': '\u05D4\u05E4\u05D5\u05E2\u05DC \u05E4\u05EA\u05D7 \u05EA\u05E7\u05D5\u05D5\u05D4',
  'Hapoel Tel Aviv F.C.': '\u05D4\u05E4\u05D5\u05E2\u05DC \u05EA\u05DC \u05D0\u05D1\u05D9\u05D1',
  'Ironi Tiberias F.C.': '\u05E2\u05D9\u05E8\u05D5\u05E0\u05D9 \u05D8\u05D1\u05E8\u05D9\u05D4',
  'Hapoel Ironi Kiryat Shmona F.C.': '\u05D4\u05E4\u05D5\u05E2\u05DC \u05E2\u05D9\u05E8\u05D5\u05E0\u05D9 \u05E7\u05E8\u05D9\u05D9\u05EA \u05E9\u05DE\u05D5\u05E0\u05D4',
  'Maccabi Bnei Reineh F.C.': '\u05DE\u05DB\u05D1\u05D9 \u05D1\u05E0\u05D9 \u05E8\u05E2\u05D9\u05E0\u05D4',
  'Maccabi Haifa F.C.': '\u05DE\u05DB\u05D1\u05D9 \u05D7\u05D9\u05E4\u05D4',
  'Maccabi Netanya F.C.': '\u05DE\u05DB\u05D1\u05D9 \u05E0\u05EA\u05E0\u05D9\u05D4',
  'Maccabi Tel Aviv F.C.': '\u05DE\u05DB\u05D1\u05D9 \u05EA\u05DC \u05D0\u05D1\u05D9\u05D1',
};

const COUNTRY_HE = {
  israel: '\u05D9\u05E9\u05E8\u05D0\u05DC',
  england: '\u05D0\u05E0\u05D2\u05DC\u05D9\u05D4',
  spain: '\u05E1\u05E4\u05E8\u05D3',
  italy: '\u05D0\u05D9\u05D8\u05DC\u05D9\u05D4',
  germany: '\u05D2\u05E8\u05DE\u05E0\u05D9\u05D4',
  france: '\u05E6\u05E8\u05E4\u05EA',
  argentina: '\u05D0\u05E8\u05D2\u05E0\u05D8\u05D9\u05E0\u05D4',
  brazil: '\u05D1\u05E8\u05D6\u05D9\u05DC',
};

const COLOR_MAP = {
  'Liverpool F.C.': ['#C8102E', '#F6EB61'],
  'Arsenal F.C.': ['#EF0107', '#ffffff'],
  'Chelsea F.C.': ['#1B4DA0', '#ffffff'],
  'Manchester United F.C.': ['#DA291C', '#FBE122'],
  'Manchester City F.C.': ['#6CABDD', '#ffffff'],
  'Real Madrid CF': ['#FFFFFF', '#FEBE10'],
  'FC Barcelona': ['#A50044', '#004D98'],
  'Juventus FC': ['#F2F2F2', '#1a1a1a'],
  'AC Milan': ['#FB090B', '#000000'],
  'FC Internazionale Milano': ['#0068A8', '#000000'],
  'FC Bayern Munich': ['#DC052D', '#ffffff'],
  'Borussia Dortmund': ['#FDE100', '#000000'],
  'Paris Saint-Germain F.C.': ['#0B5EA8', '#DA291C'],
  'Boca Juniors': ['#003F87', '#FFD700'],
  'Club Atl\u00e9tico River Plate': ['#FFFFFF', '#E2231A'],
  'CR Flamengo': ['#E20E0E', '#1a1a1a'],
  'Maccabi Haifa F.C.': ['#00843D', '#ffffff'],
  'Beitar Jerusalem F.C.': ['#FFD200', '#111111'],
  'Hapoel Tel Aviv F.C.': ['#C8102E', '#ffffff'],
  'Maccabi Tel Aviv F.C.': ['#FFE500', '#003DA5'],
};

const COUNTRY_PALETTES = {
  [COUNTRY_HE.israel]: ['#00843D', '#003DA5'],
  [COUNTRY_HE.england]: ['#C8102E', '#ffffff'],
  [COUNTRY_HE.spain]: ['#A50044', '#FEBE10'],
  [COUNTRY_HE.italy]: ['#0068A8', '#000000'],
  [COUNTRY_HE.germany]: ['#DC052D', '#FDE100'],
  [COUNTRY_HE.france]: ['#0B5EA8', '#DA291C'],
  [COUNTRY_HE.argentina]: ['#6CABDD', '#ffffff'],
  [COUNTRY_HE.brazil]: ['#009C3B', '#FFDF00'],
};

const LEAGUES = [
  {
    country: COUNTRY_HE.israel,
    iso: 'il',
    page: 'Israeli_Premier_League',
    headingId: 'Members_of_the_2025\u201326_season',
    hebrew: true,
  },
  {
    country: COUNTRY_HE.england,
    iso: 'gb-eng',
    page: 'Premier_League',
    headingId: '2026\u201327_season',
  },
  {
    country: COUNTRY_HE.spain,
    iso: 'es',
    page: 'La_Liga',
    headingId: 'Clubs',
  },
  {
    country: COUNTRY_HE.italy,
    iso: 'it',
    page: 'Serie_A',
    headingId: 'Clubs',
  },
  {
    country: COUNTRY_HE.germany,
    iso: 'de',
    page: 'Bundesliga',
    headingId: 'Clubs',
  },
  {
    country: COUNTRY_HE.france,
    iso: 'fr',
    page: '2025%E2%80%9326_Ligue_1',
    seasonPage: true,
  },
  {
    country: COUNTRY_HE.argentina,
    iso: 'ar',
    page: 'AFA_Liga_Profesional_de_F%C3%BAtbol',
    argentinaNav: true,
  },
  {
    country: COUNTRY_HE.brazil,
    iso: 'br',
    page: 'Campeonato_Brasileiro_S%C3%A9rie_A',
    headingId: 'Clubs_statistics',
  },
];

const SKIP_WIKI = new Set([
  'Football_in_London', 'Football_in_Madrid', 'Community_of_Madrid',
  'EFL_Championship', 'Liga_Leumit', 'Segunda_Divisi%C3%B3n',
  'Spain', 'England', 'Israel', 'Germany', 'France', 'Italy', 'Argentina', 'Brazil',
  'UEFA', 'Promotion_and_relegation', 'Geography_of_association_football',
]);

const SKIP_SLUG_RE = /^(List_|202[0-9]|199[0-9]|Category:|File:|Template:|Wikipedia:|Help:)/;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function decodeWikiTitle(slug) {
  return decodeURIComponent(slug.replace(/_/g, ' '));
}

function colorsFor(wikiSlug, country) {
  const title = decodeWikiTitle(wikiSlug);
  if (COLOR_MAP[title]) return { p: COLOR_MAP[title][0], s: COLOR_MAP[title][1] };
  const [a, b] = COUNTRY_PALETTES[country] || ['#888888', '#ffffff'];
  return { p: a, s: b };
}

async function fetchHtml(page) {
  const url = `https://en.wikipedia.org/wiki/${page}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').trim();
}

function extractTables(html) {
  const tables = [];
  const re = /<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>[\s\S]*?<\/table>/gi;
  let m;
  while ((m = re.exec(html)) !== null) tables.push(m[0]);
  return tables;
}

function findHeadingIndex(html, headingId) {
  const escaped = headingId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<h[234][^>]*id="${escaped}"`, 'i');
  const m = html.match(re);
  return m ? m.index : -1;
}

function tableAfterHeading(html, headingId) {
  const idx = findHeadingIndex(html, headingId);
  if (idx === -1) return null;
  const slice = html.slice(idx, idx + 120000);
  const tables = extractTables(slice);
  return tables[0] || null;
}

function isLikelyClubSlug(slug, display) {
  if (SKIP_WIKI.has(slug)) return false;
  if (SKIP_SLUG_RE.test(slug)) return false;
  if (slug.includes(':')) return false;
  if (/^(19|20)\d\d/.test(display)) return false;
  if (/season|Championship|League|Division|Football in/i.test(display) && !/_F\.C\.|_FC|_A\.F\.C\./.test(slug)) return false;
  return true;
}

function parseWikitable(tableHtml, minRows = 8) {
  const clubs = [];
  const seen = new Set();
  const rows = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  for (const row of rows) {
    if (/<th[\s>]/i.test(row) && !/<td/i.test(row)) continue;
    const links = [...row.matchAll(/<a href="\/wiki\/([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    if (!links.length) continue;
    const { slug, display } = (() => {
      for (const lm of links) {
        const s = lm[1];
        const d = stripTags(lm[2]);
        if (isLikelyClubSlug(s, d)) return { slug: s, display: d };
      }
      const lm = links[0];
      return { slug: lm[1], display: stripTags(lm[2]) };
    })();
    if (!isLikelyClubSlug(slug, display)) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);
    clubs.push({ display, wiki: slug });
  }
  return clubs.length >= minRows ? clubs : clubs;
}

function extractArgentina(html) {
  const re = /<th[^>]*>[\s\S]*?2026[\s\S]*?clubs[\s\S]*?<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/i;
  const m = html.match(re);
  if (!m) return [];
  const clubs = [];
  const seen = new Set();
  for (const lm of m[1].matchAll(/<a href="\/wiki\/([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const slug = lm[1];
    const display = stripTags(lm[2]);
    if (!isLikelyClubSlug(slug, display)) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);
    clubs.push({ display, wiki: slug });
  }
  return clubs;
}

function extractBrazil(html) {
  const idx = html.search(/The following 20 clubs will compete/i);
  if (idx === -1) return extractFromHeading(html, 'Clubs_statistics');
  const slice = html.slice(idx, idx + 60000);
  const tables = extractTables(slice);
  for (const t of tables) {
    const clubs = parseWikitable(t, 15);
    if (clubs.length >= 15) return clubs;
  }
  return [];
}

function extractFromHeading(html, headingId) {
  const table = tableAfterHeading(html, headingId);
  if (!table) return [];
  return parseWikitable(table, 8);
}

function extractLaLigaClubs(html) {
  return extractClubsSection(html, 'Clubs', 15);
}

function tableScore(clubs) {
  const n = clubs.length;
  if (n >= 18 && n <= 22) return 200 + n;
  if (n >= 15 && n <= 25) return 100 + n;
  return n;
}

function extractClubsSection(html, headingId, minRows = 15) {
  const idx = findHeadingIndex(html, headingId);
  if (idx === -1) return [];
  const slice = html.slice(idx, idx + 150000);
  const tables = extractTables(slice);
  let best = [];
  let bestScore = -1;
  for (const t of tables) {
    if (!/Team|Club/i.test(t.slice(0, 800))) continue;
    const clubs = parseWikitable(t, minRows);
    const sc = tableScore(clubs);
    if (sc > bestScore) { bestScore = sc; best = clubs; }
  }
  return best;
}

function extractSeasonPage(html) {
  const tables = extractTables(html);
  let best = [];
  let bestScore = -1;
  for (const t of tables) {
    if (!/Team|Club/i.test(t.slice(0, 800))) continue;
    const clubs = parseWikitable(t, 15);
    const sc = tableScore(clubs);
    if (sc > bestScore) { bestScore = sc; best = clubs; }
  }
  return best;
}

function normSlug(s) {
  return decodeURIComponent(s).replace(/ /g, '_');
}

async function fetchCrestsBatch(wikiSlugs) {
  const map = {};
  for (let i = 0; i < wikiSlugs.length; i += 50) {
    const batch = wikiSlugs.slice(i, i + 50);
    const titlesParam = batch.map((s) => encodeURIComponent(s)).join('|');
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&pithumbsize=120&pilicense=any&titles=${titlesParam}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) continue;
      const data = await res.json();
      const pages = data.query?.pages || {};
      for (const p of Object.values(pages)) {
        if (!p.title || !p.thumbnail?.source) continue;
        const slug = p.title.replace(/ /g, '_');
        map[normSlug(slug)] = p.thumbnail.source;
      }
      batch.forEach((s) => {
        const t = decodeWikiTitle(s);
        const slug = t.replace(/ /g, '_');
        if (map[normSlug(slug)] && !map[normSlug(s)]) map[normSlug(s)] = map[normSlug(slug)];
      });
    } catch { /* skip batch */ }
    await sleep(500);
  }
  return map;
}

async function extractClubs(league, html) {
  if (league.seasonPage) return extractSeasonPage(html);
  if (league.argentinaNav) return extractArgentina(html);
  if (league.country === COUNTRY_HE.brazil) return extractBrazil(html);
  if ([COUNTRY_HE.spain, COUNTRY_HE.italy, COUNTRY_HE.germany].includes(league.country)) {
    return extractClubsSection(html, 'Clubs', 15);
  }
  return extractFromHeading(html, league.headingId);
}

async function main() {
  const DATA = [];

  for (const league of LEAGUES) {
    console.log(`Fetching ${league.country}?`);
    const html = await fetchHtml(league.page);
    let raw = await extractClubs(league, html);
    console.log(`  Found ${raw.length} clubs`);
    if (raw.length < 5) {
      console.warn(`  Warning: expected more clubs for ${league.country}`);
    }

    const clubs = [];
    const rawSlugs = raw.map((r) => r.wiki);
    const crestMap = await fetchCrestsBatch(rawSlugs);

    for (const { display, wiki } of raw) {
      const title = decodeWikiTitle(wiki);
      const name = league.hebrew && ISRAEL_HE[title] ? ISRAEL_HE[title] : display;
      const { p, s } = colorsFor(wiki, league.country);
      const crest = crestMap[normSlug(wiki)] || null;
      clubs.push({ club: name, wiki, crest, p, s });
    }
    console.log(`  Done: ${clubs.length} clubs, ${clubs.filter((c) => c.crest).length} crests`);

    DATA.push({
      country: league.country,
      flag: `https://flagcdn.com/w40/${league.iso}.png`,
      iso: league.iso,
      clubs,
    });
  }

  writeFileSync(OUT, JSON.stringify(DATA, null, 2), 'utf8');
  const total = DATA.reduce((n, c) => n + c.clubs.length, 0);
  console.log(`\nWrote ${total} clubs to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
