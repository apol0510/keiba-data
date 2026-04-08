// 全競馬場定義（keiba-data-shared-admin の venue-codes.ts と統一）
export type VenueCategory = 'jra' | 'nankan' | 'local';

export interface VenueInfo {
  code: string;
  name: string;
  category: VenueCategory;
  categoryLabel: string;
}

export const VENUES: VenueInfo[] = [
  // JRA（10場）
  { code: 'TOK', name: '東京',  category: 'jra',    categoryLabel: 'JRA' },
  { code: 'NAK', name: '中山',  category: 'jra',    categoryLabel: 'JRA' },
  { code: 'KYO', name: '京都',  category: 'jra',    categoryLabel: 'JRA' },
  { code: 'HAN', name: '阪神',  category: 'jra',    categoryLabel: 'JRA' },
  { code: 'CHU', name: '中京',  category: 'jra',    categoryLabel: 'JRA' },
  { code: 'NII', name: '新潟',  category: 'jra',    categoryLabel: 'JRA' },
  { code: 'FKS', name: '福島',  category: 'jra',    categoryLabel: 'JRA' },
  { code: 'KOK', name: '小倉',  category: 'jra',    categoryLabel: 'JRA' },
  { code: 'SAP', name: '札幌',  category: 'jra',    categoryLabel: 'JRA' },
  { code: 'HKD', name: '函館',  category: 'jra',    categoryLabel: 'JRA' },
  // 南関（4場）
  { code: 'OOI', name: '大井',  category: 'nankan', categoryLabel: '南関' }, // 注: OIではなくOOI
  { code: 'FUN', name: '船橋',  category: 'nankan', categoryLabel: '南関' },
  { code: 'KAW', name: '川崎',  category: 'nankan', categoryLabel: '南関' },
  { code: 'URA', name: '浦和',  category: 'nankan', categoryLabel: '南関' },
  // 地方（11場）
  { code: 'MON', name: '門別',  category: 'local',  categoryLabel: '地方' },
  { code: 'OBI', name: '帯広',  category: 'local',  categoryLabel: '地方' },
  { code: 'MOR', name: '盛岡',  category: 'local',  categoryLabel: '地方' },
  { code: 'MIZ', name: '水沢',  category: 'local',  categoryLabel: '地方' },
  { code: 'KNZ', name: '金沢',  category: 'local',  categoryLabel: '地方' },
  { code: 'KSM', name: '笠松',  category: 'local',  categoryLabel: '地方' },
  { code: 'NGY', name: '名古屋', category: 'local', categoryLabel: '地方' },
  { code: 'SON', name: '園田',  category: 'local',  categoryLabel: '地方' },
  { code: 'HIM', name: '姫路',  category: 'local',  categoryLabel: '地方' },
  { code: 'KOC', name: '高知',  category: 'local',  categoryLabel: '地方' },
  { code: 'SAG', name: '佐賀',  category: 'local',  categoryLabel: '地方' },
];

// ベースURL
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/apol0510/keiba-data-shared/main';

export function getComputerDataUrl(date: string, venue: VenueInfo): string {
  const [year, month] = date.split('-');
  return `${GITHUB_RAW_BASE}/${venue.category}/predictions/computer/${year}/${month}/${date}-${venue.code}.json`;
}

export interface ComputerHorse {
  bracket: number;
  number: number;
  name: string;
  computerIndex: number;
  popularity: number;
  jockey?: string;
  trainer?: string;
  weight?: number;
  ageGender?: string;
}

export interface ComputerRace {
  raceNumber: number;
  raceName: string;
  distance?: number;
  surface?: string;
  track?: string;
  startTime?: string;
  horses: ComputerHorse[];
}

export interface ComputerData {
  date: string;
  venue: string;
  venueCode: string;
  category: VenueCategory;
  dataSource: string;
  races: ComputerRace[];
  dataVersion: string;
  createdAt: string;
}

export interface VenueResult {
  venue: VenueInfo;
  data: ComputerData | null;
  error?: string;
}

// ── 出馬表データ型定義 ──

export interface RecentRace {
  order: number;
  finish: number | null;
  finishStatus: string | null;
  date: string;
  trackCondition: string;
  headCount: number;
  venue: string;
  direction: string;
  distance: number;
  postPosition: number;
  raceName: string;
  popularity: number;
  bodyWeight: string;
  jockey: string;
  weight: number;
  time: string;
  passingOrder: string;
  last3f: string;
  margin: string;
  opponentName: string;
}

export interface EntryHorse {
  postPosition: number;
  number: number;
  name: string;
  gender: string;
  age: number;
  coat: string;
  weight: number | null;
  jockey: string;
  jockeyAffiliation: string;
  trainer: string;
  trainerAffiliation: string;
  owner: string;
  breeder: string;
  sire: string;
  bms: string;
  bestTime: string;
  record: {
    total: { wins: number; seconds: number; thirds: number; unplaced: number };
    left: { wins: number; seconds: number; thirds: number; unplaced: number };
    right: { wins: number; seconds: number; thirds: number; unplaced: number };
    venue: { wins: number; seconds: number; thirds: number; unplaced: number };
    distance: { wins: number; seconds: number; thirds: number; unplaced: number };
  };
  recentRaces: RecentRace[];
}

export interface EntryRace {
  raceNumber: number;
  raceName: string;
  startTime: string;
  distance: string;
  surface: string;
  direction: string;
  conditions: string;
  headCount: number;
  horses: EntryHorse[];
}

export interface EntriesData {
  version: string;
  createdAt: string;
  lastUpdated: string;
  date: string;
  venue: string;
  venueCode: string;
  category: string;
  totalRaces: number;
  races: EntryRace[];
}

export function getEntriesDataUrl(date: string, venue: VenueInfo): string {
  const [year, month] = date.split('-');
  return `${GITHUB_RAW_BASE}/${venue.category}/entries/${year}/${month}/${date}-${venue.code}.json`;
}

// ── racebook データ型定義（race-data-importer由来） ──

export interface RacebookPastRace {
  venue: string | null;
  raceClass: string | null;
  finish: number | null;
  cond: string | null;
  courseNote: string | null;
  distance: string | null;
  time: string | null;
  weight: number | null;
  jockey: string | null;
  bodyWeight: number | null;
  paceType: string | null;
  paceRank: number | null;
  final3F: string | null;
  winner: string | null;
}

export interface RacebookHorse {
  number: number;
  name: string;
  sire: string | null;
  dam: string | null;
  sexAge: string | null;
  sex: string | null;
  age: number | null;
  weight: number | null;
  jockey: string | null;
  trainer: string | null;
  computerIndex: string | null;
  marks: string[];
  totalScore: number;
  assignment: string;
  predictedOdds: number | null;
  shortComment: string | null;
  training: {
    training4F: string | null;
    trainingCourse: string | null;
    training3F: string | null;
    training1F: string | null;
    trainingGrade: string | null;
    trainingStyle: string | null;
  } | null;
  pastRaces: RacebookPastRace[];
}

export interface RacebookRace {
  raceNumber: number;
  raceClass: string | null;
  conditions: string | null;
  distance: string | null;
  startTime: string | null;
  horseCount: number;
  assignments: {
    main: number | null;
    sub: number | null;
    hole: number | null;
    connectTop: number | null;
    connect: number[];
    reserve: number[];
    none: number[];
  };
  horses: RacebookHorse[];
}

export interface RacebookData {
  version: string;
  source: string;
  createdAt: string;
  date: string;
  category: string;
  track: string;
  trackCode: string;
  races: RacebookRace[];
}

export function getRacebookDataUrl(date: string, venue: VenueInfo): string {
  const [year, month] = date.split('-');
  return `${GITHUB_RAW_BASE}/${venue.category}/racebook/${year}/${month}/${date}-${venue.code}.json`;
}

// 指定日の全競馬場データを並列取得
export async function fetchAllVenues(date: string): Promise<VenueResult[]> {
  const results = await Promise.allSettled(
    VENUES.map(async (venue) => {
      const url = getComputerDataUrl(date, venue);
      const res = await fetch(url);
      if (!res.ok) return { venue, data: null };
      const data: ComputerData = await res.json();
      return { venue, data };
    })
  );

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return { venue: VENUES[i], data: null, error: String(r.reason) };
  });
}
