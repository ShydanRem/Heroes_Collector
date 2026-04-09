import { Hero, UserProfile, Ability, ClassInfo } from '../types';

// In dev: il proxy Vite gestisce /api -> localhost:3001
// In prod: VITE_API_URL punta al backend su Render (es. https://tuosito.onrender.com/api)
const API_BASE = import.meta.env.VITE_API_URL || '/api';

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Errore sconosciuto' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============ USER ============

export async function getMyProfile(): Promise<{ profile: UserProfile; hero: Hero | null }> {
  return request('/users/me');
}

export async function joinGame(username: string, displayName: string): Promise<{
  message: string;
  profile: UserProfile;
  hero: Hero;
}> {
  return request('/users/join', {
    method: 'POST',
    body: JSON.stringify({ username, displayName }),
  });
}

export async function getMyRoster(): Promise<{ roster: Hero[] }> {
  return request('/users/roster');
}

// ============ HEROES ============

export async function listHeroes(params?: {
  page?: number;
  limit?: number;
  rarity?: string;
  class?: string;
}): Promise<{ heroes: Hero[]; total: number; page: number; totalPages: number }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.rarity) searchParams.set('rarity', params.rarity);
  if (params?.class) searchParams.set('class', params.class);

  const qs = searchParams.toString();
  return request(`/heroes${qs ? `?${qs}` : ''}`);
}

export async function getHeroDetail(heroId: string): Promise<{
  hero: Hero;
  abilities: Ability[];
  classInfo: ClassInfo;
}> {
  return request(`/heroes/${heroId}`);
}

export async function captureHero(heroId: string): Promise<{ message: string }> {
  return request(`/heroes/${heroId}/capture`, { method: 'POST' });
}

// ============ PARTIES ============

export interface PartyData {
  id: string;
  userId: string;
  name: string;
  heroIds: string[];
  isActive?: boolean;
  createdAt: string;
}

export async function getParties(): Promise<{ parties: PartyData[] }> {
  return request('/parties');
}

export async function createParty(name: string): Promise<{ party: PartyData }> {
  return request('/parties', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function activateParty(partyId: string): Promise<{ message: string }> {
  return request(`/parties/${partyId}/activate`, { method: 'PUT' });
}

export async function addHeroToParty(partyId: string, heroId: string): Promise<{ message: string }> {
  return request(`/parties/${partyId}/heroes`, {
    method: 'POST',
    body: JSON.stringify({ heroId }),
  });
}

export async function removeHeroFromParty(partyId: string, heroId: string): Promise<{ message: string }> {
  return request(`/parties/${partyId}/heroes/${heroId}`, { method: 'DELETE' });
}

export async function deleteParty(partyId: string): Promise<{ message: string }> {
  return request(`/parties/${partyId}`, { method: 'DELETE' });
}

// ============ BATTLES ============

export interface DungeonModifier {
  id: string;
  name: string;
  emoji: string;
  description: string;
  difficulty: string;
}

export interface ActiveSynergy {
  name: string;
  description: string;
  effectDescription: string;
}

export interface ZoneInfo {
  id: string;
  name: string;
  emoji: string;
  totalWaves: number;
  recommendedLevel: string;
  unlocked: boolean;
  cleared: boolean;
  bestWaves: number;
  totalClears: number;
}

export interface DungeonResult {
  battleId: string;
  won: boolean;
  wavesCompleted: number;
  totalWaves: number;
  rewards: { exp: number; gold: number; items: string[] };
  partyHeroes: { id: string; name: string; heroClass: string; rarity: string; maxHp: number }[];
  modifier?: DungeonModifier;
  synergies?: ActiveSynergy[];
  zoneId?: string;
  zoneName?: string;
  zoneEmoji?: string;
  isReplay?: boolean;
  zoneCleared?: boolean;
  nextZoneUnlocked?: string;
  waves: {
    wave: number;
    won: boolean;
    enemies: { name: string; tier: string; id: string; maxHp: number; displayName: string }[];
    totalTurns: number;
    log: BattleLogEntry[];
    heroHpStart: { id: string; currentHp: number; maxHp: number }[];
  }[];
}

export interface BattleLogEntry {
  turn: number;
  actor: string;
  actorId?: string;
  action: string;
  target: string;
  targetId?: string;
  damage?: number;
  heal?: number;
  statusApplied?: string;
  statusRemoved?: string;
  isCrit?: boolean;
  killed?: boolean;
  message: string;
}

export async function startDungeon(zoneId?: string): Promise<DungeonResult> {
  return request('/battles/dungeon', {
    method: 'POST',
    body: JSON.stringify({ zoneId }),
  });
}

export async function getZones(): Promise<{ zones: ZoneInfo[] }> {
  return request('/zones');
}

export async function getBattleHistory(): Promise<{ battles: any[] }> {
  return request('/battles/history');
}

// ============ PVP ============

export interface PartyHeroData {
  id: string;
  name: string;
  heroClass: string;
  rarity: string;
  maxHp: number;
}

export interface PvpResult {
  battleId: string;
  won: boolean;
  opponentName: string;
  log: BattleLogEntry[];
  totalTurns: number;
  eloChange: number;
  newElo: number;
  rewards: { exp: number; gold: number };
  myPartyHeroes: PartyHeroData[];
  opponentPartyHeroes: PartyHeroData[];
}

export async function startPvp(): Promise<PvpResult> {
  return request('/battles/pvp', { method: 'POST' });
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  winRate: number;
}

export async function getLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[] }> {
  return request('/battles/leaderboard');
}

export async function getMyRank(): Promise<{ rank: { rank: number; elo: number; wins: number; losses: number; totalPlayers: number } | null }> {
  return request('/battles/rank');
}

// ============ ITEMS ============

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  slot: string;
  rarity: string;
  statBonuses: Record<string, number>;
  quantity: number;
  equippedOn: string | null;
}

export async function getInventory(): Promise<{ inventory: InventoryItem[] }> {
  return request('/items/inventory');
}

export async function equipItem(inventoryId: string, heroId: string): Promise<{ message: string }> {
  return request('/items/equip', {
    method: 'POST',
    body: JSON.stringify({ inventoryId, heroId }),
  });
}

export async function unequipItem(inventoryId: string): Promise<{ message: string }> {
  return request('/items/unequip', {
    method: 'POST',
    body: JSON.stringify({ inventoryId }),
  });
}

export async function sellItem(inventoryId: string): Promise<{ message: string; gold: number }> {
  return request('/items/sell', {
    method: 'POST',
    body: JSON.stringify({ inventoryId }),
  });
}

// ============ RAID ============

export interface RaidInfo {
  id: string;
  name: string;
  emoji: string;
  maxHp: number;
  currentHp: number;
  hpPercent: number;
  defeated: boolean;
  weekNumber: number;
  totalContributors: number;
  topContributors: RaidContributor[];
  myContribution?: RaidContributor;
}

export interface RaidContributor {
  userId: string;
  displayName: string;
  damageDealt: number;
  attempts: number;
  bestDamage: number;
}

export interface RaidAttackResult {
  damageDealt: number;
  log: BattleLogEntry[];
  totalTurns: number;
  bossHpBefore: number;
  bossHpAfter: number;
  bossDefeated: boolean;
  rewards: { exp: number; gold: number; items: string[] };
  partyHeroes: PartyHeroData[];
  boss: { id: string; name: string; emoji: string; maxHp: number };
}

export async function getRaidInfo(): Promise<{ raid: RaidInfo }> {
  return request('/raid');
}

export async function attackRaid(): Promise<RaidAttackResult> {
  return request('/raid/attack', { method: 'POST' });
}

// ============ SHOP ============

export interface ShopListing {
  id: string;
  itemId: string | null;
  itemType: string;
  name: string;
  description: string;
  priceGold: number;
  priceChannelPoints: number;
  stock: number;
  isActive: boolean;
}

export async function getShopListings(): Promise<{ listings: ShopListing[] }> {
  return request('/shop');
}

export async function buyFromShop(shopItemId: string): Promise<{ message: string }> {
  return request('/shop/buy', {
    method: 'POST',
    body: JSON.stringify({ shopItemId }),
  });
}

// ============ MISSIONS ============

export interface DailyMission {
  id: string;
  missionType: string;
  description: string;
  target: number;
  progress: number;
  rewardGold: number;
  rewardExp: number;
  claimed: boolean;
  completed: boolean;
}

export async function getDailyMissions(): Promise<{ missions: DailyMission[] }> {
  return request('/missions');
}

export async function claimMission(missionId: string): Promise<{ gold: number; exp: number }> {
  return request(`/missions/${missionId}/claim`, { method: 'POST' });
}

// ============ ACHIEVEMENTS ============

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export async function getAchievements(): Promise<{ achievements: Achievement[]; unlockedCount: number; totalCount: number }> {
  return request('/achievements');
}
