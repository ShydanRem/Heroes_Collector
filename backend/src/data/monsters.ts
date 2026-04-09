import { HeroClass } from '../types';
import { ZONE_MAP, ZoneDefinition } from './zones';

// ============================================
// MOSTRI PVE - Generati per ondata di dungeon
// ============================================

export interface MonsterTemplate {
  id: string;
  name: string;
  emoji: string;
  heroClass: HeroClass;
  // Moltiplicatori stats rispetto al livello del dungeon
  hpMult: number;
  atkMult: number;
  defMult: number;
  spdMult: number;
  crit: number;
  critDmg: number;
  abilities: string[];
  tier: 'minion' | 'elite' | 'boss';
}

export const MONSTER_TEMPLATES: MonsterTemplate[] = [
  // ===== MINION (ondate 1-3) =====
  {
    id: 'mob_slime', name: 'Slime Oscuro', emoji: '🟣',
    heroClass: HeroClass.GUARDIANO,
    hpMult: 0.8, atkMult: 0.5, defMult: 0.3, spdMult: 0.4,
    crit: 3, critDmg: 130, abilities: ['atk_colpo_base'], tier: 'minion',
  },
  {
    id: 'mob_goblin', name: 'Goblin', emoji: '👺',
    heroClass: HeroClass.LAMA,
    hpMult: 0.6, atkMult: 0.7, defMult: 0.2, spdMult: 0.7,
    crit: 10, critDmg: 140, abilities: ['atk_colpo_base', 'atk_colpo_avvelenato'], tier: 'minion',
  },
  {
    id: 'mob_bat', name: 'Pipistrello Vampiro', emoji: '🦇',
    heroClass: HeroClass.OMBRA,
    hpMult: 0.4, atkMult: 0.6, defMult: 0.1, spdMult: 0.9,
    crit: 15, critDmg: 150, abilities: ['atk_colpo_base', 'atk_pugnalata'], tier: 'minion',
  },
  {
    id: 'mob_skeleton', name: 'Scheletro', emoji: '💀',
    heroClass: HeroClass.RANGER,
    hpMult: 0.5, atkMult: 0.6, defMult: 0.4, spdMult: 0.5,
    crit: 8, critDmg: 135, abilities: ['atk_colpo_base', 'atk_freccia_precisa'], tier: 'minion',
  },
  {
    id: 'mob_wisp', name: 'Fuocofatuo', emoji: '🔥',
    heroClass: HeroClass.ARCANO,
    hpMult: 0.3, atkMult: 0.8, defMult: 0.1, spdMult: 0.6,
    crit: 5, critDmg: 170, abilities: ['atk_dardo_arcano', 'deb_bruciatura'], tier: 'minion',
  },
  {
    id: 'mob_rat', name: 'Ratto Gigante', emoji: '🐀',
    heroClass: HeroClass.OMBRA,
    hpMult: 0.35, atkMult: 0.5, defMult: 0.15, spdMult: 1.0,
    crit: 12, critDmg: 140, abilities: ['atk_colpo_base', 'deb_veleno'], tier: 'minion',
  },

  // ===== ELITE (ondate 3-4) =====
  {
    id: 'mob_orc', name: 'Orco Guerriero', emoji: '👹',
    heroClass: HeroClass.LAMA,
    hpMult: 1.5, atkMult: 1.2, defMult: 0.6, spdMult: 0.5,
    crit: 12, critDmg: 155, abilities: ['atk_fendente', 'atk_carica', 'deb_stordimento'], tier: 'elite',
  },
  {
    id: 'mob_mage', name: 'Mago Oscuro', emoji: '🧙',
    heroClass: HeroClass.ARCANO,
    hpMult: 0.8, atkMult: 1.5, defMult: 0.3, spdMult: 0.6,
    crit: 10, critDmg: 170, abilities: ['atk_dardo_arcano', 'atk_tempesta_arcana', 'deb_silenzio'], tier: 'elite',
  },
  {
    id: 'mob_knight', name: 'Cavaliere Nero', emoji: '🗡️',
    heroClass: HeroClass.GUARDIANO,
    hpMult: 2.0, atkMult: 0.8, defMult: 1.2, spdMult: 0.4,
    crit: 5, critDmg: 140, abilities: ['atk_martello', 'def_scudo', 'def_provocazione'], tier: 'elite',
  },
  {
    id: 'mob_witch', name: 'Strega', emoji: '🧹',
    heroClass: HeroClass.SCIAMANO,
    hpMult: 0.9, atkMult: 1.0, defMult: 0.4, spdMult: 0.7,
    crit: 8, critDmg: 145, abilities: ['atk_morso_spirito', 'atk_nube_tossica', 'deb_maledizione'], tier: 'elite',
  },
  {
    id: 'mob_assassin', name: 'Assassino Ombra', emoji: '����',
    heroClass: HeroClass.OMBRA,
    hpMult: 0.7, atkMult: 1.3, defMult: 0.2, spdMult: 1.2,
    crit: 30, critDmg: 180, abilities: ['atk_pugnalata', 'atk_colpo_avvelenato', 'def_evasione'], tier: 'elite',
  },

  // ===== BOSS (ondata 5) =====
  {
    id: 'boss_dragon', name: 'Drago Antico', emoji: '🐉',
    heroClass: HeroClass.ARCANO,
    hpMult: 5.0, atkMult: 2.0, defMult: 1.5, spdMult: 0.7,
    crit: 15, critDmg: 180,
    abilities: ['atk_tempesta_arcana', 'atk_dardo_arcano', 'atk_raggio_gelo', 'deb_bruciatura'],
    tier: 'boss',
  },
  {
    id: 'boss_lich', name: 'Lich Re', emoji: '👑',
    heroClass: HeroClass.SCIAMANO,
    hpMult: 4.0, atkMult: 1.8, defMult: 1.0, spdMult: 0.8,
    crit: 10, critDmg: 160,
    abilities: ['atk_nube_tossica', 'deb_maledizione', 'deb_silenzio', 'sup_totem_guarigione'],
    tier: 'boss',
  },
  {
    id: 'boss_golem', name: 'Golem di Ferro', emoji: '🗿',
    heroClass: HeroClass.GUARDIANO,
    hpMult: 7.0, atkMult: 1.5, defMult: 2.5, spdMult: 0.3,
    crit: 5, critDmg: 200,
    abilities: ['atk_onda_urto', 'atk_martello', 'def_scudo', 'deb_stordimento'],
    tier: 'boss',
  },
  {
    id: 'boss_phantom', name: 'Fantasma Supremo', emoji: '👻',
    heroClass: HeroClass.OMBRA,
    hpMult: 3.5, atkMult: 2.2, defMult: 0.5, spdMult: 1.5,
    crit: 35, critDmg: 190,
    abilities: ['atk_lame_ombra', 'atk_pugnalata', 'def_evasione', 'deb_marchio'],
    tier: 'boss',
  },
  {
    id: 'boss_chrono', name: 'Signore del Tempo', emoji: '⌛',
    heroClass: HeroClass.CRONO,
    hpMult: 4.5, atkMult: 1.6, defMult: 1.0, spdMult: 2.0,
    crit: 12, critDmg: 165,
    abilities: ['atk_paradosso', 'atk_distorsione', 'deb_aoe_slow', 'sup_accelerazione'],
    tier: 'boss',
  },

  // ===== ZONE BOSSES =====
  {
    id: 'boss_treant', name: 'Treant Antico', emoji: '🌳',
    heroClass: HeroClass.GUARDIANO,
    hpMult: 6.0, atkMult: 1.2, defMult: 2.0, spdMult: 0.3,
    crit: 5, critDmg: 140,
    abilities: ['atk_onda_urto', 'atk_martello', 'def_scudo', 'sup_totem_guarigione'],
    tier: 'boss',
  },
  {
    id: 'boss_warlord', name: 'Signore della Guerra', emoji: '⚔️',
    heroClass: HeroClass.LAMA,
    hpMult: 4.5, atkMult: 2.5, defMult: 1.0, spdMult: 0.8,
    crit: 25, critDmg: 190,
    abilities: ['atk_fendente', 'atk_turbine', 'atk_carica', 'deb_stordimento'],
    tier: 'boss',
  },
  {
    id: 'boss_wyrm', name: 'Wyrm di Cristallo', emoji: '💎',
    heroClass: HeroClass.GUARDIANO,
    hpMult: 6.5, atkMult: 1.5, defMult: 2.2, spdMult: 0.4,
    crit: 10, critDmg: 160,
    abilities: ['atk_raggio_gelo', 'atk_onda_urto', 'def_scudo', 'deb_stordimento'],
    tier: 'boss',
  },
  {
    id: 'boss_hydra', name: 'Idra Velenosa', emoji: '🐍',
    heroClass: HeroClass.SCIAMANO,
    hpMult: 5.5, atkMult: 1.8, defMult: 1.2, spdMult: 0.6,
    crit: 12, critDmg: 155,
    abilities: ['atk_nube_tossica', 'deb_veleno', 'deb_aoe_curse', 'atk_morso_spirito'],
    tier: 'boss',
  },
  {
    id: 'boss_ifrit', name: 'Ifrit', emoji: '🔥',
    heroClass: HeroClass.ARCANO,
    hpMult: 5.0, atkMult: 2.3, defMult: 1.0, spdMult: 0.9,
    crit: 18, critDmg: 185,
    abilities: ['atk_tempesta_arcana', 'deb_bruciatura', 'atk_dardo_arcano', 'atk_lama_fuoco'],
    tier: 'boss',
  },
  {
    id: 'boss_void_king', name: 'Re del Vuoto', emoji: '🌀',
    heroClass: HeroClass.CRONO,
    hpMult: 8.0, atkMult: 2.0, defMult: 1.8, spdMult: 1.5,
    crit: 20, critDmg: 180,
    abilities: ['atk_paradosso', 'atk_distorsione', 'deb_aoe_slow', 'deb_silenzio', 'sup_accelerazione'],
    tier: 'boss',
  },
];

export const MONSTER_MAP = new Map(MONSTER_TEMPLATES.map(m => [m.id, m]));

/**
 * Genera i mostri per una specifica ondata di dungeon (zone-aware).
 * @param zoneId ID della zona (es. 'forest', 'plains', ...)
 * @param wave Numero ondata (1-N)
 * @param dungeonLevel Livello del dungeon (media livello party)
 */
export function generateWaveMonsters(zoneId: string, wave: number, dungeonLevel: number): any[] {
  const zone = ZONE_MAP.get(zoneId);

  // Fallback: se la zona non esiste, comportamento vecchio (forest-like)
  if (!zone) {
    const templates = MONSTER_TEMPLATES;
    if (wave <= 2) {
      const minions = templates.filter(m => m.tier === 'minion');
      const count = wave === 1 ? 2 : 3;
      return pickRandom(minions, count).map(m => templateToMonster(m, dungeonLevel, wave, 1.0));
    } else if (wave <= 4) {
      const elites = templates.filter(m => m.tier === 'elite');
      const minions = templates.filter(m => m.tier === 'minion');
      const eliteCount = wave === 3 ? 1 : 2;
      const minionCount = wave === 3 ? 2 : 1;
      return [
        ...pickRandom(elites, eliteCount).map(m => templateToMonster(m, dungeonLevel, wave, 1.0)),
        ...pickRandom(minions, minionCount).map(m => templateToMonster(m, dungeonLevel, wave, 1.0)),
      ];
    } else {
      const bosses = templates.filter(m => m.tier === 'boss');
      return pickRandom(bosses, 1).map(m => templateToMonster(m, dungeonLevel, wave, 1.0));
    }
  }

  const baseScale = zone.baseScale;
  const waveComp = zone.waveComposition.find(w => w.wave === wave);

  // Se non troviamo la composizione per questa wave, ritorna array vuoto
  if (!waveComp) return [];

  // Zone boss dedicato
  if (waveComp.isZoneBoss) {
    const bossTemplate = MONSTER_MAP.get(zone.zoneBossId);
    if (bossTemplate) {
      return [templateToMonster(bossTemplate, dungeonLevel, wave, baseScale)];
    }
    // Fallback: boss random dal pool globale
    const bosses = MONSTER_TEMPLATES.filter(m => m.tier === 'boss');
    return pickRandom(bosses, 1).map(m => templateToMonster(m, dungeonLevel, wave, baseScale));
  }

  // Composizione normale: minion + elite + sub-boss dal pool della zona
  const result: any[] = [];

  if (waveComp.minions > 0) {
    const minionTemplates = zone.monsterPool.minions
      .map(id => MONSTER_MAP.get(id))
      .filter((t): t is MonsterTemplate => !!t);
    result.push(...pickRandom(minionTemplates, waveComp.minions).map(m => templateToMonster(m, dungeonLevel, wave, baseScale)));
  }

  if (waveComp.elites > 0) {
    const eliteTemplates = zone.monsterPool.elites
      .map(id => MONSTER_MAP.get(id))
      .filter((t): t is MonsterTemplate => !!t);
    result.push(...pickRandom(eliteTemplates, waveComp.elites).map(m => templateToMonster(m, dungeonLevel, wave, baseScale)));
  }

  if (waveComp.bosses > 0) {
    const bossTemplates = zone.monsterPool.bosses
      .map(id => MONSTER_MAP.get(id))
      .filter((t): t is MonsterTemplate => !!t);
    result.push(...pickRandom(bossTemplates, waveComp.bosses).map(m => templateToMonster(m, dungeonLevel, wave, baseScale)));
  }

  return result;
}

function templateToMonster(template: MonsterTemplate, level: number, wave: number, baseScale: number) {
  const scaleFactor = baseScale + (level - 1) * 0.12 + (wave - 1) * 0.08;

  return {
    id: `${template.id}_${wave}_${Math.random().toString(36).slice(2, 6)}`,
    name: template.name,
    display_name: `${template.emoji} ${template.name}`,
    hero_class: template.heroClass,
    hp: Math.floor(80 * template.hpMult * scaleFactor),
    atk: Math.floor(25 * template.atkMult * scaleFactor),
    def: Math.floor(20 * template.defMult * scaleFactor),
    spd: Math.floor(30 * template.spdMult * scaleFactor),
    crit: template.crit,
    crit_dmg: template.critDmg,
    ability_ids: template.abilities,
    tier: template.tier,
  };
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}
