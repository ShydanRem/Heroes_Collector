import {
  HeroStats, StatusEffect, TargetType, AbilityType, HeroClass,
} from '../types';
import { ABILITY_MAP } from '../data/abilities';
import { SYNERGIES, Synergy } from '../data/classes';

// ============================================
// TIPI INTERNI DEL COMBATTIMENTO
// ============================================

export interface BattleFighter {
  id: string;
  name: string;
  team: 'attacker' | 'defender';
  heroClass: string;
  stats: HeroStats;
  currentHp: number;
  maxHp: number;
  abilities: string[];
  cooldowns: Map<string, number>;
  statusEffects: ActiveStatus[];
  isAlive: boolean;
  threat: number; // aggro accumulato
}

// Ruoli per classe — scalabile, basta aggiungere nuove classi qui
type ClassRole = 'tank' | 'melee_dps' | 'ranged_dps' | 'healer' | 'support' | 'assassin' | 'utility';

const CLASS_ROLES: Record<string, ClassRole> = {
  guardiano: 'tank',
  dragoon: 'tank',
  lama: 'melee_dps',
  samurai: 'melee_dps',
  arcano: 'ranged_dps',
  necromante: 'ranged_dps',
  custode: 'healer',
  alchimista: 'support',
  ombra: 'assassin',
  ranger: 'ranged_dps',
  sciamano: 'support',
  crono: 'utility',
};

// Threat base per ruolo — i tank generano piu' aggro
const ROLE_THREAT_MULTIPLIER: Record<ClassRole, number> = {
  tank: 2.5,
  melee_dps: 1.2,
  ranged_dps: 0.8,
  healer: 0.5,
  support: 0.6,
  assassin: 1.0,
  utility: 0.7,
};

function getClassRole(heroClass: string): ClassRole {
  return CLASS_ROLES[heroClass] || 'melee_dps';
}

function getThreatMultiplier(heroClass: string): number {
  return ROLE_THREAT_MULTIPLIER[getClassRole(heroClass)] || 1.0;
}

interface ActiveStatus {
  effect: StatusEffect;
  duration: number;
  power: number;
  source: string;
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

export interface BattleOutcome {
  won: boolean;
  log: BattleLogEntry[];
  survivingAttackers: string[];
  survivingDefenders: string[];
  totalDamageDealt: number;
  totalTurns: number;
}

// ============================================
// MOTORE DI COMBATTIMENTO
// ============================================

const MAX_TURNS = 30;

/**
 * Controlla se una delle squadre e completamente eliminata.
 * Restituisce 'attacker_wins' | 'defender_wins' | null
 */
function checkBattleEnd(
  attackers: BattleFighter[],
  defenders: BattleFighter[]
): 'attacker_wins' | 'defender_wins' | null {
  const attackersAlive = attackers.some(f => f.isAlive);
  const defendersAlive = defenders.some(f => f.isAlive);

  if (!defendersAlive) return 'attacker_wins';
  if (!attackersAlive) return 'defender_wins';
  return null;
}

/**
 * Costruisce il risultato finale della battaglia.
 */
function buildOutcome(
  won: boolean,
  log: BattleLogEntry[],
  attackers: BattleFighter[],
  defenders: BattleFighter[],
  totalDamageDealt: number,
  totalTurns: number
): BattleOutcome {
  return {
    won,
    log,
    survivingAttackers: attackers.filter(f => f.isAlive).map(f => f.id),
    survivingDefenders: defenders.filter(f => f.isAlive).map(f => f.id),
    totalDamageDealt,
    totalTurns,
  };
}

export function runBattle(
  attackers: BattleFighter[],
  defenders: BattleFighter[],
  options?: { resetHp?: boolean; vampirismo?: boolean }
): BattleOutcome {
  const log: BattleLogEntry[] = [];
  const allFighters = [...attackers, ...defenders];
  let totalDamageDealt = 0;
  let turn = 0;

  // Reset stato iniziale — solo se richiesto (il dungeon gestisce gli HP tra le ondate)
  const shouldReset = options?.resetHp !== false;
  for (const f of allFighters) {
    if (shouldReset) {
      f.currentHp = f.maxHp;
    }
    f.isAlive = f.currentHp > 0;
    f.cooldowns = new Map();
    f.statusEffects = [];
  }

  // Controlla subito se una squadra e gia morta (edge case)
  const preCheck = checkBattleEnd(attackers, defenders);
  if (preCheck) {
    return buildOutcome(preCheck === 'attacker_wins', log, attackers, defenders, 0, 0);
  }

  while (turn < MAX_TURNS) {
    turn++;

    // Ordine turni per SPD con varianza ridotta (SPD conta di piu)
    const turnOrder = allFighters
      .filter(f => f.isAlive)
      .sort((a, b) => {
        const spdA = getEffectiveStat(a, 'spd') + Math.random() * 5;
        const spdB = getEffectiveStat(b, 'spd') + Math.random() * 5;
        return spdB - spdA;
      });

    for (const fighter of turnOrder) {
      if (!fighter.isAlive) continue;

      // === CHECK FINE DOPO OGNI AZIONE ===
      const midCheck = checkBattleEnd(attackers, defenders);
      if (midCheck) {
        return buildOutcome(midCheck === 'attacker_wins', log, attackers, defenders, totalDamageDealt, turn);
      }

      // Stordimento
      if (hasStatus(fighter, StatusEffect.STORDIMENTO)) {
        log.push({
          turn, actor: fighter.name, actorId: fighter.id, action: 'stordito',
          target: fighter.name, targetId: fighter.id,
          message: `${fighter.name} e stordito e salta il turno!`,
        });
        continue;
      }

      const silenced = hasStatus(fighter, StatusEffect.SILENZIO);

      // Scegli abilita
      const ability = chooseAbility(fighter, attackers, defenders, silenced);
      if (!ability) continue;

      const abilityDef = ABILITY_MAP.get(ability);
      if (!abilityDef) continue;

      // Cooldown
      if (abilityDef.cooldown > 0) {
        fighter.cooldowns.set(ability, abilityDef.cooldown);
      }

      // Bersagli
      const enemies = fighter.team === 'attacker' ? defenders : attackers;
      const allies = fighter.team === 'attacker' ? attackers : defenders;

      // Resurrezione: seleziona un alleato morto e riportalo in vita
      if (ability === 'ult_custode') {
        const deadAllies = allies.filter(a => !a.isAlive);
        if (deadAllies.length > 0) {
          const target = deadAllies[Math.floor(Math.random() * deadAllies.length)];
          const restoredHp = Math.floor(target.maxHp * 0.5);
          target.currentHp = restoredHp;
          target.isAlive = true;
          target.statusEffects = [];
          log.push({
            turn, actor: fighter.name, actorId: fighter.id, action: abilityDef.name,
            target: target.name, targetId: target.id, heal: restoredHp,
            message: `${fighter.name} usa Resurrezione! ${target.name} torna in vita con ${restoredHp} HP!`,
          });
        } else {
          // Nessun alleato morto — usa cura base invece
          log.push({
            turn, actor: fighter.name, actorId: fighter.id, action: 'Preghiera',
            target: fighter.name, targetId: fighter.id,
            message: `${fighter.name} prega, ma nessun alleato ha bisogno di resurrezione.`,
          });
        }
        continue; // Skip al prossimo fighter, l'azione è completa
      }

      const targets = selectTargets(abilityDef.target, fighter, enemies, allies);

      for (const target of targets) {
        if (!target.isAlive) continue;
        if (!fighter.isAlive) break; // Morto per riflesso o altro

        if (abilityDef.type === AbilityType.ATTACCO || abilityDef.type === AbilityType.ULTIMATE) {
          const atk = getEffectiveStat(fighter, 'atk');
          const def = getEffectiveStat(target, 'def');

          // Evasione
          if (hasStatus(target, StatusEffect.EVASIONE)) {
            log.push({
              turn, actor: fighter.name, actorId: fighter.id, action: abilityDef.name,
              target: target.name, targetId: target.id,
              message: `${target.name} schiva l'attacco di ${fighter.name}!`,
            });
            continue;
          }

          // Cecita
          if (hasStatus(fighter, StatusEffect.CECITA) && Math.random() < 0.5) {
            log.push({
              turn, actor: fighter.name, actorId: fighter.id, action: abilityDef.name,
              target: target.name, targetId: target.id,
              message: `${fighter.name} manca il colpo! (accecato)`,
            });
            continue;
          }

          // Calcolo danno
          let damage = Math.max(1, Math.floor(
            atk * abilityDef.power * (1 - def / (def + 200)) * (0.9 + Math.random() * 0.2)
          ));

          // Critico
          let isCrit = false;
          const critChance = getEffectiveStat(fighter, 'crit');
          if (Math.random() * 100 < critChance) {
            damage = Math.floor(damage * getEffectiveStat(fighter, 'critDmg') / 100);
            isCrit = true;
          }

          // Maledizione
          if (hasStatus(target, StatusEffect.MALEDIZIONE)) {
            damage = Math.floor(damage * 1.3);
          }

          // Riflesso
          if (hasStatus(target, StatusEffect.RIFLESSO)) {
            const reflected = Math.floor(damage * 0.3);
            fighter.currentHp = Math.max(0, fighter.currentHp - reflected);
            if (fighter.currentHp <= 0) fighter.isAlive = false;
          }

          // Scudo
          if (hasStatus(target, StatusEffect.SCUDO)) {
            damage = Math.floor(damage * 0.5);
          }

          // Applica danno
          target.currentHp = Math.max(0, target.currentHp - damage);
          totalDamageDealt += damage;

          // Vampirismo: cura l'attaccante del 15% del danno inflitto (solo attaccanti)
          if (options?.vampirismo && attackers.includes(fighter) && damage > 0) {
            const healAmount = Math.floor(damage * 0.15);
            fighter.currentHp = Math.min(fighter.maxHp, fighter.currentHp + healAmount);
          }

          // Genera threat: chi fa danno attira aggro proporzionale
          fighter.threat += Math.floor(damage * getThreatMultiplier(fighter.heroClass) * 0.5);

          const killed = target.currentHp <= 0;
          if (killed) {
            target.isAlive = false;
          }

          log.push({
            turn, actor: fighter.name, actorId: fighter.id, action: abilityDef.name,
            target: target.name, targetId: target.id, damage, isCrit, killed,
            message: `${fighter.name} usa ${abilityDef.name} su ${target.name} per ${damage} danni${isCrit ? ' (CRITICO!)' : ''}${killed ? ' - SCONFITTO!' : ''}`,
          });

        } else if (abilityDef.type === AbilityType.SUPPORTO) {
          if (abilityDef.power > 0) {
            // Cure scalano da HP max del bersaglio + ATK del curante (healer efficaci anche con ATK basso)
            const hpBasedHeal = Math.floor(target.maxHp * 0.12 * abilityDef.power);
            const atkBasedHeal = Math.floor(getEffectiveStat(fighter, 'atk') * abilityDef.power * 0.4);
            const healAmount = hpBasedHeal + atkBasedHeal;
            const prevHp = target.currentHp;
            target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
            const actualHeal = target.currentHp - prevHp;

            // Healer genera threat curando (meno di un attacco)
            fighter.threat += Math.floor(actualHeal * 0.3);

            log.push({
              turn, actor: fighter.name, actorId: fighter.id, action: abilityDef.name,
              target: target.name, targetId: target.id, heal: actualHeal,
              message: `${fighter.name} usa ${abilityDef.name} su ${target.name}, cura ${actualHeal} HP`,
            });
          }

        } else if (abilityDef.type === AbilityType.DIFESA) {
          // Abilita difensive generano threat extra per i tank
          fighter.threat += Math.floor(10 * getThreatMultiplier(fighter.heroClass));

          log.push({
            turn, actor: fighter.name, actorId: fighter.id, action: abilityDef.name,
            target: target.name, targetId: target.id,
            message: `${fighter.name} usa ${abilityDef.name} su ${target.name}`,
          });

        } else if (abilityDef.type === AbilityType.DEBUFF) {
          const debuffDmg = abilityDef.power > 0 ? Math.floor(getEffectiveStat(fighter, 'atk') * abilityDef.power) : 0;

          if (debuffDmg > 0) {
            target.currentHp = Math.max(0, target.currentHp - debuffDmg);
            if (target.currentHp <= 0) target.isAlive = false;
          }

          log.push({
            turn, actor: fighter.name, actorId: fighter.id, action: abilityDef.name,
            target: target.name, targetId: target.id,
            damage: debuffDmg > 0 ? debuffDmg : undefined,
            killed: target.currentHp <= 0,
            message: `${fighter.name} usa ${abilityDef.name} su ${target.name}${debuffDmg > 0 ? ` per ${debuffDmg} danni` : ''}${target.currentHp <= 0 ? ' - SCONFITTO!' : ''}`,
          });
        }

        // Applica effetto di stato
        if (abilityDef.statusEffect && abilityDef.statusChance && abilityDef.statusDuration) {
          if (Math.random() * 100 < abilityDef.statusChance) {
            applyStatus(target, {
              effect: abilityDef.statusEffect,
              duration: abilityDef.statusDuration,
              power: getEffectiveStat(fighter, 'atk') * 0.15,
              source: fighter.id,
            });

            log.push({
              turn, actor: fighter.name, actorId: fighter.id, action: 'status',
              target: target.name, targetId: target.id,
              statusApplied: abilityDef.statusEffect,
              message: `${target.name} subisce ${abilityDef.statusEffect}!`,
            });
          }
        }
      }

      // === CHECK FINE DOPO OGNI FIGHTER ===
      const postActionCheck = checkBattleEnd(attackers, defenders);
      if (postActionCheck) {
        return buildOutcome(postActionCheck === 'attacker_wins', log, attackers, defenders, totalDamageDealt, turn);
      }
    }

    // Fine turno: DoT, regen, tick down
    for (const fighter of allFighters) {
      if (!fighter.isAlive) continue;
      processEndOfTurn(fighter, log, turn);
    }

    // === CHECK FINE DOPO DOT ===
    const postDotCheck = checkBattleEnd(attackers, defenders);
    if (postDotCheck) {
      return buildOutcome(postDotCheck === 'attacker_wins', log, attackers, defenders, totalDamageDealt, turn);
    }

    // Riduci cooldown
    for (const fighter of allFighters) {
      for (const [abilityId, cd] of fighter.cooldowns) {
        if (cd > 0) fighter.cooldowns.set(abilityId, cd - 1);
      }
    }
  }

  // Timeout: vince chi ha piu HP% totale
  const attackerHpPct = attackers.reduce((sum, f) => sum + (f.isAlive ? f.currentHp / f.maxHp : 0), 0);
  const defenderHpPct = defenders.reduce((sum, f) => sum + (f.isAlive ? f.currentHp / f.maxHp : 0), 0);

  return buildOutcome(
    attackerHpPct >= defenderHpPct,
    log, attackers, defenders, totalDamageDealt, MAX_TURNS
  );
}

// ============================================
// IA SCELTA ABILITA'
// ============================================

function chooseAbility(
  fighter: BattleFighter,
  attackers: BattleFighter[],
  defenders: BattleFighter[],
  silenced: boolean
): string | null {
  const enemies = fighter.team === 'attacker' ? defenders : attackers;
  const allies = fighter.team === 'attacker' ? attackers : defenders;
  const availableAbilities = fighter.abilities.filter(id => {
    const cd = fighter.cooldowns.get(id) || 0;
    if (cd > 0) return false;
    // Verifica che l'abilita esista
    return ABILITY_MAP.has(id);
  });

  if (availableAbilities.length === 0) return 'atk_colpo_base';
  if (silenced) {
    return availableAbilities.find(id => ABILITY_MAP.get(id)?.type === AbilityType.ATTACCO) || 'atk_colpo_base';
  }

  const role = getClassRole(fighter.heroClass);
  const allyLowHp = allies.filter(a => a.isAlive && a.currentHp / a.maxHp < 0.4);
  const enemyLowHp = enemies.some(e => e.isAlive && e.currentHp / e.maxHp < 0.25);
  const selfLowHp = fighter.currentHp / fighter.maxHp < 0.5;
  const hasShield = hasStatus(fighter, StatusEffect.SCUDO);

  // Tank senza scudo: priorita' difesa
  if ((role === 'tank') && !hasShield && selfLowHp) {
    const defAbility = availableAbilities.find(id => {
      const a = ABILITY_MAP.get(id);
      return a?.type === AbilityType.DIFESA;
    });
    if (defAbility) return defAbility;
  }

  // Healer: Resurrezione se alleati morti
  const deadAllies = allies.filter(a => !a.isAlive);
  if ((role === 'healer') && deadAllies.length > 0) {
    if (availableAbilities.includes('ult_custode')) return 'ult_custode';
  }

  // Healer/Support: cura se alleati in pericolo (soglia piu' alta)
  if ((role === 'healer' || role === 'support') && allyLowHp.length > 0) {
    const healAbility = availableAbilities.find(id => {
      const a = ABILITY_MAP.get(id);
      return a?.type === AbilityType.SUPPORTO && a.power > 0;
    });
    if (healAbility) return healAbility;
  }

  // Qualsiasi classe: cura se alleati in pericolo critico (<25%)
  const allyCritical = allies.some(a => a.isAlive && a.currentHp / a.maxHp < 0.25);
  if (allyCritical) {
    const healAbility = availableAbilities.find(id => {
      const a = ABILITY_MAP.get(id);
      return a?.type === AbilityType.SUPPORTO && a.power > 0;
    });
    if (healAbility) return healAbility;
  }

  // Finisci nemici bassi
  if (enemyLowHp) {
    const attacks = availableAbilities
      .filter(id => {
        const a = ABILITY_MAP.get(id);
        return a?.type === AbilityType.ATTACCO || a?.type === AbilityType.ULTIMATE;
      })
      .sort((a, b) => (ABILITY_MAP.get(b)?.power || 0) - (ABILITY_MAP.get(a)?.power || 0));
    if (attacks.length > 0) return attacks[0];
  }

  // Scelta pesata basata su ruolo
  const weighted = availableAbilities.map(id => {
    const a = ABILITY_MAP.get(id);
    let weight = 1;
    if (a?.type === AbilityType.ULTIMATE) weight = 3;
    else if (a?.type === AbilityType.ATTACCO && a.power > 1.5) weight = 2;
    else if (a?.type === AbilityType.DEBUFF) weight = (role === 'support' || role === 'utility') ? 2 : 1.2;
    else if (a?.type === AbilityType.DIFESA) weight = (role === 'tank') ? 2 : 0.5;
    else if (a?.type === AbilityType.SUPPORTO) weight = (role === 'healer' || role === 'support') ? 1.8 : 0.5;
    return { id, weight };
  });

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const w of weighted) {
    rand -= w.weight;
    if (rand <= 0) return w.id;
  }

  return availableAbilities[0];
}

// ============================================
// SELEZIONE BERSAGLI
// ============================================

function selectTargets(
  targetType: TargetType,
  fighter: BattleFighter,
  enemies: BattleFighter[],
  allies: BattleFighter[]
): BattleFighter[] {
  const aliveEnemies = enemies.filter(e => e.isAlive);
  const aliveAllies = allies.filter(a => a.isAlive);

  switch (targetType) {
    case TargetType.SINGOLO_NEMICO:
      if (aliveEnemies.length === 0) return [];
      return [selectEnemyTarget(fighter, aliveEnemies)];

    case TargetType.TUTTI_NEMICI:
      return aliveEnemies;

    case TargetType.SE_STESSO:
      return [fighter];

    case TargetType.SINGOLO_ALLEATO:
      if (aliveAllies.length === 0) return [];
      return [selectAllyTarget(fighter, aliveAllies)];

    case TargetType.TUTTI_ALLEATI:
      return aliveAllies;

    case TargetType.CASUALE_NEMICO:
      if (aliveEnemies.length === 0) return [];
      return [aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]];

    default:
      return aliveEnemies.length > 0 ? [aliveEnemies[0]] : [];
  }
}

/**
 * Targeting nemico basato su ruolo e threat:
 * - Assassini puntano healer/support (backline)
 * - Tutti gli altri tendono ad attaccare chi ha piu' threat (tank)
 * - Finisher: se un nemico e' sotto 20% HP, priorita' per finirlo
 */
function selectEnemyTarget(attacker: BattleFighter, enemies: BattleFighter[]): BattleFighter {
  const role = getClassRole(attacker.heroClass);

  // Finisher: se qualcuno e' sotto 20% HP, finiscilo
  const lowHpEnemy = enemies.find(e => e.currentHp / e.maxHp < 0.2);
  if (lowHpEnemy && Math.random() < 0.6) return lowHpEnemy;

  // Assassini preferiscono backline (healer > support > ranged_dps)
  if (role === 'assassin') {
    const backline = enemies
      .filter(e => {
        const r = getClassRole(e.heroClass);
        return r === 'healer' || r === 'support' || r === 'ranged_dps';
      })
      .sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp));
    if (backline.length > 0 && Math.random() < 0.7) return backline[0];
  }

  // Targeting pesato per threat: chi ha piu' threat viene attaccato piu' spesso
  // I tank hanno threat base alto anche a 0 per il moltiplicatore del ruolo
  const weighted = enemies.map(e => {
    const baseThreat = getThreatMultiplier(e.heroClass) * 10;
    const totalThreat = baseThreat + e.threat;
    return { fighter: e, weight: Math.max(totalThreat, 1) };
  });

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const w of weighted) {
    rand -= w.weight;
    if (rand <= 0) return w.fighter;
  }
  return enemies[0];
}

/**
 * Targeting alleato per cure/buff:
 * - Cura l'alleato con meno %HP
 * - A parita', preferisce i tank (piu' importanti da tenere in vita)
 */
function selectAllyTarget(healer: BattleFighter, allies: BattleFighter[]): BattleFighter {
  return allies.sort((a, b) => {
    const hpPctA = a.currentHp / a.maxHp;
    const hpPctB = b.currentHp / b.maxHp;
    // Prima chi ha meno %HP
    if (Math.abs(hpPctA - hpPctB) > 0.1) return hpPctA - hpPctB;
    // A parita', preferisci tank
    const roleA = getClassRole(a.heroClass);
    const roleB = getClassRole(b.heroClass);
    const tankPriority = (r: ClassRole) => r === 'tank' ? 0 : r === 'melee_dps' ? 1 : 2;
    return tankPriority(roleA) - tankPriority(roleB);
  })[0];
}

// ============================================
// STATUS EFFECTS
// ============================================

function hasStatus(fighter: BattleFighter, effect: StatusEffect): boolean {
  return fighter.statusEffects.some(s => s.effect === effect && s.duration > 0);
}

function applyStatus(fighter: BattleFighter, status: ActiveStatus): void {
  const existing = fighter.statusEffects.findIndex(s => s.effect === status.effect);
  if (existing >= 0) {
    fighter.statusEffects[existing] = status;
  } else {
    fighter.statusEffects.push(status);
  }
}

function getEffectiveStat(fighter: BattleFighter, stat: keyof HeroStats): number {
  let value = fighter.stats[stat];

  for (const status of fighter.statusEffects) {
    if (status.duration <= 0) continue;

    switch (status.effect) {
      case StatusEffect.FURIA:
        if (stat === 'atk') value *= 1.3;
        if (stat === 'spd') value *= 1.2;
        break;
      case StatusEffect.BENEDIZIONE:
        value *= 1.15;
        break;
      case StatusEffect.MALEDIZIONE:
        if (stat === 'atk' || stat === 'def') value *= 0.8;
        break;
      case StatusEffect.RALLENTAMENTO:
        if (stat === 'spd') value *= 0.5;
        break;
      case StatusEffect.CONGELAMENTO:
        if (stat === 'spd') value *= 0.3;
        if (stat === 'def') value *= 1.2;
        break;
    }
  }

  return Math.floor(value);
}

function processEndOfTurn(fighter: BattleFighter, log: BattleLogEntry[], turn: number): void {
  const expiredEffects: string[] = [];

  for (let i = fighter.statusEffects.length - 1; i >= 0; i--) {
    const status = fighter.statusEffects[i];

    // DoT
    if (status.effect === StatusEffect.VELENO || status.effect === StatusEffect.BRUCIATURA || status.effect === StatusEffect.SANGUINAMENTO) {
      const dotDamage = Math.max(1, Math.floor(status.power));
      fighter.currentHp = Math.max(0, fighter.currentHp - dotDamage);

      log.push({
        turn, actor: 'status', action: status.effect,
        target: fighter.name, targetId: fighter.id, damage: dotDamage,
        message: `${fighter.name} subisce ${dotDamage} danni da ${status.effect}`,
      });

      if (fighter.currentHp <= 0) {
        fighter.isAlive = false;
        log.push({
          turn, actor: 'status', action: 'morte',
          target: fighter.name, targetId: fighter.id, killed: true,
          message: `${fighter.name} e stato sconfitto dal ${status.effect}!`,
        });
        return;
      }
    }

    // Regen
    if (status.effect === StatusEffect.RIGENERAZIONE) {
      const healAmount = Math.max(1, Math.floor(fighter.maxHp * 0.08));
      fighter.currentHp = Math.min(fighter.maxHp, fighter.currentHp + healAmount);

      log.push({
        turn, actor: 'status', action: 'rigenerazione',
        target: fighter.name, targetId: fighter.id, heal: healAmount,
        message: `${fighter.name} rigenera ${healAmount} HP`,
      });
    }

    status.duration--;
    if (status.duration <= 0) {
      expiredEffects.push(status.effect);
      fighter.statusEffects.splice(i, 1);
    }
  }

  for (const effect of expiredEffects) {
    log.push({
      turn, actor: 'status', action: 'expired',
      target: fighter.name, targetId: fighter.id, statusRemoved: effect,
      message: `${effect} su ${fighter.name} e terminato`,
    });
  }
}

// ============================================
// HELPER
// ============================================

export function createFighter(
  heroData: any,
  team: 'attacker' | 'defender'
): BattleFighter {
  const hp = heroData.hp || 100;
  return {
    id: heroData.id,
    name: heroData.display_name || heroData.displayName || heroData.name || 'Unknown',
    team,
    heroClass: heroData.hero_class || heroData.heroClass || 'lama',
    stats: {
      hp,
      atk: heroData.atk || 20,
      def: heroData.def || 10,
      spd: heroData.spd || 20,
      crit: heroData.crit || 5,
      critDmg: heroData.crit_dmg || heroData.critDmg || 150,
    },
    currentHp: heroData.currentHp ?? hp,
    maxHp: hp,
    abilities: heroData.ability_ids || heroData.abilities || ['atk_colpo_base'],
    cooldowns: new Map(),
    statusEffects: [],
    isAlive: (heroData.currentHp ?? hp) > 0,
    threat: 0,
  };
}

/**
 * Applica i bonus talenti alle stats di un fighter (bonus percentuali).
 */
export function applyTalentBonuses(fighter: BattleFighter, bonuses: Record<string, number>): void {
  for (const [stat, pct] of Object.entries(bonuses)) {
    if (stat === 'hp') {
      const bonus = Math.floor(fighter.maxHp * pct / 100);
      fighter.maxHp += bonus;
      fighter.currentHp += bonus;
      fighter.stats.hp += bonus;
    } else if (stat in fighter.stats) {
      const key = stat as keyof typeof fighter.stats;
      fighter.stats[key] += Math.floor(fighter.stats[key] * pct / 100);
    }
  }
}

/**
 * Calcola e applica le sinergie di party ai fighter.
 * Restituisce le sinergie attive per mostrare al frontend.
 */
export interface ActiveSynergy {
  name: string;
  description: string;
  effectDescription: string;
}

export function applySynergies(fighters: BattleFighter[]): ActiveSynergy[] {
  const classes = fighters.filter(f => f.isAlive).map(f => f.heroClass as HeroClass);
  const activeSynergies: ActiveSynergy[] = [];

  for (const synergy of SYNERGIES) {
    // Conta quanti eroi matchano le classi richieste
    let matchCount: number;

    if (synergy.requiredClasses.length === 1) {
      // Sinergia singola classe: conta quanti ne hai
      matchCount = classes.filter(c => c === synergy.requiredClasses[0]).length;
    } else if (synergy.name === 'Armata Completa') {
      // Caso speciale: conta classi DIVERSE
      matchCount = new Set(classes).size;
    } else {
      // Multi-classe: servono tutte le classi richieste presenti
      const hasAll = synergy.requiredClasses.every(rc => classes.includes(rc));
      matchCount = hasAll ? synergy.requiredClasses.length : 0;
    }

    if (matchCount >= synergy.minCount) {
      activeSynergies.push({
        name: synergy.name,
        description: synergy.description,
        effectDescription: synergy.effect.description,
      });

      // Applica bonus stats
      const bonus = synergy.effect.bonus / 100;
      for (const f of fighters) {
        if (!f.isAlive) continue;
        if (synergy.effect.stat) {
          f.stats[synergy.effect.stat] = Math.floor(f.stats[synergy.effect.stat] * (1 + bonus));
          // Aggiorna maxHp/currentHp se il bonus e su hp
          if (synergy.effect.stat === 'hp') {
            f.maxHp = Math.floor(f.maxHp * (1 + bonus));
            f.currentHp = Math.floor(f.currentHp * (1 + bonus));
          }
        } else {
          // Bonus a tutte le stats (Armata Completa)
          for (const stat of ['hp', 'atk', 'def', 'spd', 'crit', 'critDmg'] as (keyof HeroStats)[]) {
            f.stats[stat] = Math.floor(f.stats[stat] * (1 + bonus));
          }
          f.maxHp = Math.floor(f.maxHp * (1 + bonus));
          f.currentHp = Math.floor(f.currentHp * (1 + bonus));
        }
      }
    }
  }

  return activeSynergies;
}
