import { HeroClass } from '../types';

// ============================================
// SISTEMA TALENTI — 2 rami per classe, 5 nodi per ramo
// Ogni 5 livelli = 1 punto talento (max 10 a livello 50)
// I rami sono indipendenti: puoi mischiarli
// ============================================

export interface TalentNode {
  id: string;
  name: string;
  description: string;
  branch: string; // nome del ramo
  tier: number; // 1-5, richiede tier-1 dello stesso ramo per sbloccare
  statBonus?: Partial<Record<'hp' | 'atk' | 'def' | 'spd' | 'crit' | 'critDmg', number>>; // bonus % alle stats
  specialEffect?: string; // effetto speciale in combattimento (per future implementazioni)
}

export interface ClassTalentTree {
  heroClass: HeroClass;
  branches: {
    name: string;
    emoji: string;
    description: string;
    nodes: TalentNode[];
  }[];
}

export const TALENT_POINTS_PER_LEVEL = 5; // 1 punto ogni 5 livelli

export function getTalentPointsForLevel(level: number): number {
  return Math.floor(level / TALENT_POINTS_PER_LEVEL);
}

// ============================================
// TALENTI PER CLASSE
// Struttura scalabile: per aggiungere una nuova classe,
// basta aggiungere un blocco a TALENT_TREES
// ============================================

export const TALENT_TREES: ClassTalentTree[] = [
  // ===== GUARDIANO =====
  {
    heroClass: HeroClass.GUARDIANO,
    branches: [
      {
        name: 'Bastione', emoji: '🏰', description: 'Difesa pura, muro invalicabile',
        nodes: [
          { id: 'gua_b1', name: 'Corazza Spessa', description: '+5% DEF', branch: 'Bastione', tier: 1, statBonus: { def: 5 } },
          { id: 'gua_b2', name: 'Muro di Ferro', description: '+8% HP', branch: 'Bastione', tier: 2, statBonus: { hp: 8 } },
          { id: 'gua_b3', name: 'Resistenza Stoica', description: '+5% DEF, +5% HP', branch: 'Bastione', tier: 3, statBonus: { def: 5, hp: 5 } },
          { id: 'gua_b4', name: 'Aura Protettiva', description: '+3% DEF a tutto il party', branch: 'Bastione', tier: 4, statBonus: { def: 3 }, specialEffect: 'party_def' },
          { id: 'gua_b5', name: 'Fortezza Vivente', description: '+12% HP, +8% DEF', branch: 'Bastione', tier: 5, statBonus: { hp: 12, def: 8 } },
        ],
      },
      {
        name: 'Vendicatore', emoji: '⚡', description: 'Contrattacco e aggressivita',
        nodes: [
          { id: 'gua_v1', name: 'Colpo Pesante', description: '+5% ATK', branch: 'Vendicatore', tier: 1, statBonus: { atk: 5 } },
          { id: 'gua_v2', name: 'Punizione', description: '+8% ATK', branch: 'Vendicatore', tier: 2, statBonus: { atk: 8 } },
          { id: 'gua_v3', name: 'Riflesso d\'Acciaio', description: '+5% CRIT', branch: 'Vendicatore', tier: 3, statBonus: { crit: 5 } },
          { id: 'gua_v4', name: 'Ira del Protettore', description: '+10% ATK, +5% CRIT DMG', branch: 'Vendicatore', tier: 4, statBonus: { atk: 10, critDmg: 5 } },
          { id: 'gua_v5', name: 'Giudizio Divino', description: '+15% CRIT DMG', branch: 'Vendicatore', tier: 5, statBonus: { critDmg: 15 } },
        ],
      },
      {
        name: 'Condottiero', emoji: '🏳️', description: 'Leadership e supporto al party',
        nodes: [
          { id: 'gua_c1', name: 'Grido di Guerra', description: '+3% ATK, +3% DEF', branch: 'Condottiero', tier: 1, statBonus: { atk: 3, def: 3 } },
          { id: 'gua_c2', name: 'Ispirazione', description: '+5% HP, +3% SPD', branch: 'Condottiero', tier: 2, statBonus: { hp: 5, spd: 3 } },
          { id: 'gua_c3', name: 'Tattica Difensiva', description: '+3% DEF a tutto il party', branch: 'Condottiero', tier: 3, statBonus: { def: 3 }, specialEffect: 'party_def' },
          { id: 'gua_c4', name: 'Morale Alto', description: '+5% HP, +5% ATK', branch: 'Condottiero', tier: 4, statBonus: { hp: 5, atk: 5 } },
          { id: 'gua_c5', name: 'Comandante Supremo', description: '+3% a tutte le stats del party', branch: 'Condottiero', tier: 5, statBonus: { hp: 3, atk: 3, def: 3, spd: 3 }, specialEffect: 'party_all' },
        ],
      },
    ],
  },

  // ===== BERSERKER =====
  {
    heroClass: HeroClass.LAMA,
    branches: [
      {
        name: 'Furia', emoji: '🔥', description: 'Danno puro, distruggere tutto',
        nodes: [
          { id: 'lam_f1', name: 'Lame Affilate', description: '+5% ATK', branch: 'Furia', tier: 1, statBonus: { atk: 5 } },
          { id: 'lam_f2', name: 'Frenesia', description: '+5% SPD, +3% ATK', branch: 'Furia', tier: 2, statBonus: { spd: 5, atk: 3 } },
          { id: 'lam_f3', name: 'Taglio Brutale', description: '+8% CRIT DMG', branch: 'Furia', tier: 3, statBonus: { critDmg: 8 } },
          { id: 'lam_f4', name: 'Rabbia Cieca', description: '+12% ATK, -3% DEF', branch: 'Furia', tier: 4, statBonus: { atk: 12, def: -3 } },
          { id: 'lam_f5', name: 'Massacro', description: '+10% CRIT, +10% CRIT DMG', branch: 'Furia', tier: 5, statBonus: { crit: 10, critDmg: 10 } },
        ],
      },
      {
        name: 'Sopravvivenza', emoji: '💪', description: 'Resistenza e durata in battaglia',
        nodes: [
          { id: 'lam_s1', name: 'Pelle Dura', description: '+5% HP', branch: 'Sopravvivenza', tier: 1, statBonus: { hp: 5 } },
          { id: 'lam_s2', name: 'Rigenerazione', description: '+8% HP', branch: 'Sopravvivenza', tier: 2, statBonus: { hp: 8 } },
          { id: 'lam_s3', name: 'Istinto', description: '+5% DEF, +3% SPD', branch: 'Sopravvivenza', tier: 3, statBonus: { def: 5, spd: 3 } },
          { id: 'lam_s4', name: 'Furia Controllata', description: '+5% ATK, +5% DEF', branch: 'Sopravvivenza', tier: 4, statBonus: { atk: 5, def: 5 } },
          { id: 'lam_s5', name: 'Inarrestabile', description: '+10% HP, +5% DEF, +5% ATK', branch: 'Sopravvivenza', tier: 5, statBonus: { hp: 10, def: 5, atk: 5 } },
        ],
      },
      {
        name: 'Berserker', emoji: '🩸', description: 'Piu sei ferito, piu sei forte',
        nodes: [
          { id: 'lam_b1', name: 'Sangue Bollente', description: '+3% ATK, +3% SPD', branch: 'Berserker', tier: 1, statBonus: { atk: 3, spd: 3 } },
          { id: 'lam_b2', name: 'Dolore = Potenza', description: '+5% CRIT', branch: 'Berserker', tier: 2, statBonus: { crit: 5 } },
          { id: 'lam_b3', name: 'Furia Sanguinaria', description: '+8% ATK, +3% CRIT DMG', branch: 'Berserker', tier: 3, statBonus: { atk: 8, critDmg: 3 } },
          { id: 'lam_b4', name: 'Rigenerazione Furiosa', description: '+5% HP. Drena vita 10%', branch: 'Berserker', tier: 4, statBonus: { hp: 5 }, specialEffect: 'lifesteal' },
          { id: 'lam_b5', name: 'Furia Immortale', description: '+10% ATK, +8% CRIT, +5% SPD', branch: 'Berserker', tier: 5, statBonus: { atk: 10, crit: 8, spd: 5 } },
        ],
      },
    ],
  },

  // ===== STREGONE =====
  {
    heroClass: HeroClass.ARCANO,
    branches: [
      {
        name: 'Distruzione', emoji: '💥', description: 'Potenza magica devastante',
        nodes: [
          { id: 'arc_d1', name: 'Mente Acuta', description: '+5% ATK', branch: 'Distruzione', tier: 1, statBonus: { atk: 5 } },
          { id: 'arc_d2', name: 'Potere Arcano', description: '+8% ATK', branch: 'Distruzione', tier: 2, statBonus: { atk: 8 } },
          { id: 'arc_d3', name: 'Precisione Mistica', description: '+5% CRIT', branch: 'Distruzione', tier: 3, statBonus: { crit: 5 } },
          { id: 'arc_d4', name: 'Incantesimo Potenziato', description: '+10% CRIT DMG', branch: 'Distruzione', tier: 4, statBonus: { critDmg: 10 } },
          { id: 'arc_d5', name: 'Armageddon Arcano', description: '+15% ATK', branch: 'Distruzione', tier: 5, statBonus: { atk: 15 } },
        ],
      },
      {
        name: 'Sapienza', emoji: '📚', description: 'Sopravvivenza e utilita magica',
        nodes: [
          { id: 'arc_s1', name: 'Barriera Magica', description: '+5% HP', branch: 'Sapienza', tier: 1, statBonus: { hp: 5 } },
          { id: 'arc_s2', name: 'Concentrazione', description: '+5% SPD', branch: 'Sapienza', tier: 2, statBonus: { spd: 5 } },
          { id: 'arc_s3', name: 'Scudo Arcano', description: '+5% DEF, +5% HP', branch: 'Sapienza', tier: 3, statBonus: { def: 5, hp: 5 } },
          { id: 'arc_s4', name: 'Mente Superiore', description: '+8% SPD, +5% ATK', branch: 'Sapienza', tier: 4, statBonus: { spd: 8, atk: 5 } },
          { id: 'arc_s5', name: 'Trascendenza', description: '+10% HP, +10% ATK', branch: 'Sapienza', tier: 5, statBonus: { hp: 10, atk: 10 } },
        ],
      },
      {
        name: 'Elementalista', emoji: '🌊', description: 'Padronanza degli elementi, debuff e controllo',
        nodes: [
          { id: 'arc_e1', name: 'Tocco Elementale', description: '+3% ATK, +3% SPD', branch: 'Elementalista', tier: 1, statBonus: { atk: 3, spd: 3 } },
          { id: 'arc_e2', name: 'Gelo Profondo', description: '+5% DEF, +3% ATK', branch: 'Elementalista', tier: 2, statBonus: { def: 5, atk: 3 } },
          { id: 'arc_e3', name: 'Tempesta Arcana', description: '+5% ATK, +5% SPD', branch: 'Elementalista', tier: 3, statBonus: { atk: 5, spd: 5 } },
          { id: 'arc_e4', name: 'Padronanza Elementale', description: '+3% ATK a tutto il party', branch: 'Elementalista', tier: 4, statBonus: { atk: 3 }, specialEffect: 'party_atk' },
          { id: 'arc_e5', name: 'Avatar degli Elementi', description: '+12% ATK, +8% SPD', branch: 'Elementalista', tier: 5, statBonus: { atk: 12, spd: 8 } },
        ],
      },
    ],
  },

  // ===== SACERDOTE =====
  {
    heroClass: HeroClass.CUSTODE,
    branches: [
      {
        name: 'Devotion', emoji: '🙏', description: 'Cure potenti e protezione',
        nodes: [
          { id: 'cus_d1', name: 'Tocco Sacro', description: '+5% ATK (potenzia cure)', branch: 'Devotion', tier: 1, statBonus: { atk: 5 } },
          { id: 'cus_d2', name: 'Grazia Divina', description: '+8% HP', branch: 'Devotion', tier: 2, statBonus: { hp: 8 } },
          { id: 'cus_d3', name: 'Benedizione', description: '+5% DEF, +5% ATK', branch: 'Devotion', tier: 3, statBonus: { def: 5, atk: 5 } },
          { id: 'cus_d4', name: 'Aura Curativa', description: '+3% HP a tutto il party', branch: 'Devotion', tier: 4, statBonus: { hp: 3 }, specialEffect: 'party_hp' },
          { id: 'cus_d5', name: 'Miracolo', description: '+12% ATK, +10% HP', branch: 'Devotion', tier: 5, statBonus: { atk: 12, hp: 10 } },
        ],
      },
      {
        name: 'Punizione', emoji: '☀️', description: 'Sacerdote offensivo, luce che brucia',
        nodes: [
          { id: 'cus_p1', name: 'Luce Bruciante', description: '+5% ATK', branch: 'Punizione', tier: 1, statBonus: { atk: 5 } },
          { id: 'cus_p2', name: 'Giudizio Sacro', description: '+5% CRIT', branch: 'Punizione', tier: 2, statBonus: { crit: 5 } },
          { id: 'cus_p3', name: 'Fiamma Sacra', description: '+8% ATK, +3% CRIT', branch: 'Punizione', tier: 3, statBonus: { atk: 8, crit: 3 } },
          { id: 'cus_p4', name: 'Ira Divina', description: '+10% CRIT DMG', branch: 'Punizione', tier: 4, statBonus: { critDmg: 10 } },
          { id: 'cus_p5', name: 'Smite', description: '+15% ATK, +5% CRIT', branch: 'Punizione', tier: 5, statBonus: { atk: 15, crit: 5 } },
        ],
      },
      {
        name: 'Oracolo', emoji: '🔮', description: 'Preveggenza e protezione del party',
        nodes: [
          { id: 'cus_o1', name: 'Visione Divina', description: '+5% SPD', branch: 'Oracolo', tier: 1, statBonus: { spd: 5 } },
          { id: 'cus_o2', name: 'Preghiera Collettiva', description: '+5% HP, +3% DEF', branch: 'Oracolo', tier: 2, statBonus: { hp: 5, def: 3 } },
          { id: 'cus_o3', name: 'Scudo di Fede', description: '+3% HP a tutto il party', branch: 'Oracolo', tier: 3, statBonus: { hp: 3 }, specialEffect: 'party_hp' },
          { id: 'cus_o4', name: 'Profezia', description: '+5% SPD, +5% CRIT al party', branch: 'Oracolo', tier: 4, statBonus: { spd: 5, crit: 5 }, specialEffect: 'party_spd' },
          { id: 'cus_o5', name: 'Intervento Divino', description: '+10% HP, +8% DEF, +5% SPD', branch: 'Oracolo', tier: 5, statBonus: { hp: 10, def: 8, spd: 5 } },
        ],
      },
    ],
  },

  // ===== ASSASSINO =====
  {
    heroClass: HeroClass.OMBRA,
    branches: [
      {
        name: 'Ombra Letale', emoji: '🌑', description: 'Critici devastanti, morte istantanea',
        nodes: [
          { id: 'omb_l1', name: 'Lama Nascosta', description: '+5% CRIT', branch: 'Ombra Letale', tier: 1, statBonus: { crit: 5 } },
          { id: 'omb_l2', name: 'Punto Debole', description: '+8% CRIT DMG', branch: 'Ombra Letale', tier: 2, statBonus: { critDmg: 8 } },
          { id: 'omb_l3', name: 'Colpo Mortale', description: '+5% CRIT, +5% CRIT DMG', branch: 'Ombra Letale', tier: 3, statBonus: { crit: 5, critDmg: 5 } },
          { id: 'omb_l4', name: 'Veleno Letale', description: '+10% ATK. +25% danno vs nemici sotto 25% HP', branch: 'Ombra Letale', tier: 4, statBonus: { atk: 10 }, specialEffect: 'execute' },
          { id: 'omb_l5', name: 'Esecuzione', description: '+12% CRIT, +15% CRIT DMG', branch: 'Ombra Letale', tier: 5, statBonus: { crit: 12, critDmg: 15 } },
        ],
      },
      {
        name: 'Elusione', emoji: '💨', description: 'Velocita e sopravvivenza',
        nodes: [
          { id: 'omb_e1', name: 'Piedi Leggeri', description: '+5% SPD', branch: 'Elusione', tier: 1, statBonus: { spd: 5 } },
          { id: 'omb_e2', name: 'Schivata', description: '+5% SPD, +3% DEF', branch: 'Elusione', tier: 2, statBonus: { spd: 5, def: 3 } },
          { id: 'omb_e3', name: 'Ombra Sfuggente', description: '+5% HP, +5% SPD', branch: 'Elusione', tier: 3, statBonus: { hp: 5, spd: 5 } },
          { id: 'omb_e4', name: 'Cappa dell\'Invisibilita', description: '+8% DEF', branch: 'Elusione', tier: 4, statBonus: { def: 8 } },
          { id: 'omb_e5', name: 'Fantasma', description: '+10% SPD, +8% HP', branch: 'Elusione', tier: 5, statBonus: { spd: 10, hp: 8 } },
        ],
      },
      {
        name: 'Sicario', emoji: '🎭', description: 'Assassinii mirati e bonus vs bersagli deboli',
        nodes: [
          { id: 'omb_s1', name: 'Studio del Bersaglio', description: '+3% CRIT, +3% ATK', branch: 'Sicario', tier: 1, statBonus: { crit: 3, atk: 3 } },
          { id: 'omb_s2', name: 'Punto Vulnerabile', description: '+5% CRIT DMG', branch: 'Sicario', tier: 2, statBonus: { critDmg: 5 } },
          { id: 'omb_s3', name: 'Lama Avvelenata', description: '+5% ATK, +3% CRIT', branch: 'Sicario', tier: 3, statBonus: { atk: 5, crit: 3 } },
          { id: 'omb_s4', name: 'Colpo di Grazia', description: '+25% danno vs nemici sotto 25% HP', branch: 'Sicario', tier: 4, statBonus: { critDmg: 5 }, specialEffect: 'execute' },
          { id: 'omb_s5', name: 'Morte Silenziosa', description: '+10% CRIT, +10% ATK, +5% SPD', branch: 'Sicario', tier: 5, statBonus: { crit: 10, atk: 10, spd: 5 } },
        ],
      },
    ],
  },

  // ===== RANGER =====
  {
    heroClass: HeroClass.RANGER,
    branches: [
      {
        name: 'Cecchino', emoji: '🎯', description: 'Precisione e danni da distanza',
        nodes: [
          { id: 'ran_c1', name: 'Mira Ferma', description: '+5% CRIT', branch: 'Cecchino', tier: 1, statBonus: { crit: 5 } },
          { id: 'ran_c2', name: 'Frecce Perforanti', description: '+5% ATK', branch: 'Cecchino', tier: 2, statBonus: { atk: 5 } },
          { id: 'ran_c3', name: 'Occhio di Falco', description: '+8% CRIT, +3% ATK', branch: 'Cecchino', tier: 3, statBonus: { crit: 8, atk: 3 } },
          { id: 'ran_c4', name: 'Tiro Letale', description: '+10% CRIT DMG', branch: 'Cecchino', tier: 4, statBonus: { critDmg: 10 } },
          { id: 'ran_c5', name: 'Colpo Perfetto', description: '+10% ATK, +10% CRIT', branch: 'Cecchino', tier: 5, statBonus: { atk: 10, crit: 10 } },
        ],
      },
      {
        name: 'Esploratore', emoji: '🌲', description: 'Agilita e adattamento',
        nodes: [
          { id: 'ran_e1', name: 'Passo Silenzioso', description: '+5% SPD', branch: 'Esploratore', tier: 1, statBonus: { spd: 5 } },
          { id: 'ran_e2', name: 'Istinto Selvaggio', description: '+5% HP', branch: 'Esploratore', tier: 2, statBonus: { hp: 5 } },
          { id: 'ran_e3', name: 'Trappola', description: '+5% DEF, +3% SPD', branch: 'Esploratore', tier: 3, statBonus: { def: 5, spd: 3 } },
          { id: 'ran_e4', name: 'Adattamento', description: '+5% a tutte le stats base', branch: 'Esploratore', tier: 4, statBonus: { hp: 5, atk: 5, def: 5, spd: 5 } },
          { id: 'ran_e5', name: 'Uno con la Natura', description: '+10% HP, +8% SPD', branch: 'Esploratore', tier: 5, statBonus: { hp: 10, spd: 8 } },
        ],
      },
      {
        name: 'Cacciatore', emoji: '🐺', description: 'Compagno animale e bonus coordinati',
        nodes: [
          { id: 'ran_h1', name: 'Fiuto del Predatore', description: '+5% CRIT', branch: 'Cacciatore', tier: 1, statBonus: { crit: 5 } },
          { id: 'ran_h2', name: 'Frecce Gemelle', description: '+5% ATK, +3% SPD', branch: 'Cacciatore', tier: 2, statBonus: { atk: 5, spd: 3 } },
          { id: 'ran_h3', name: 'Marchio del Cacciatore', description: '+5% CRIT DMG, +3% ATK', branch: 'Cacciatore', tier: 3, statBonus: { critDmg: 5, atk: 3 } },
          { id: 'ran_h4', name: 'Branco', description: '+3% SPD a tutto il party', branch: 'Cacciatore', tier: 4, statBonus: { spd: 3 }, specialEffect: 'party_spd' },
          { id: 'ran_h5', name: 'Signore delle Bestie', description: '+12% ATK, +8% CRIT', branch: 'Cacciatore', tier: 5, statBonus: { atk: 12, crit: 8 } },
        ],
      },
    ],
  },

  // ===== SCIAMANO =====
  {
    heroClass: HeroClass.SCIAMANO,
    branches: [
      {
        name: 'Maledizione', emoji: '🦴', description: 'Debuff potenti sui nemici',
        nodes: [
          { id: 'sci_m1', name: 'Tossine', description: '+5% ATK', branch: 'Maledizione', tier: 1, statBonus: { atk: 5 } },
          { id: 'sci_m2', name: 'Spiriti Maligni', description: '+5% ATK, +3% SPD', branch: 'Maledizione', tier: 2, statBonus: { atk: 5, spd: 3 } },
          { id: 'sci_m3', name: 'Hex Potente', description: '+8% ATK', branch: 'Maledizione', tier: 3, statBonus: { atk: 8 } },
          { id: 'sci_m4', name: 'Malocchio', description: '+5% CRIT, +5% CRIT DMG', branch: 'Maledizione', tier: 4, statBonus: { crit: 5, critDmg: 5 } },
          { id: 'sci_m5', name: 'Voodoo Supremo', description: '+15% ATK', branch: 'Maledizione', tier: 5, statBonus: { atk: 15 } },
        ],
      },
      {
        name: 'Spiriti', emoji: '👻', description: 'Supporto e protezione spirituale',
        nodes: [
          { id: 'sci_s1', name: 'Totem Minore', description: '+5% HP', branch: 'Spiriti', tier: 1, statBonus: { hp: 5 } },
          { id: 'sci_s2', name: 'Guida Ancestrale', description: '+5% DEF', branch: 'Spiriti', tier: 2, statBonus: { def: 5 } },
          { id: 'sci_s3', name: 'Danza Rituale', description: '+5% SPD, +5% HP', branch: 'Spiriti', tier: 3, statBonus: { spd: 5, hp: 5 } },
          { id: 'sci_s4', name: 'Protezione degli Spiriti', description: '+8% DEF, +5% HP', branch: 'Spiriti', tier: 4, statBonus: { def: 8, hp: 5 } },
          { id: 'sci_s5', name: 'Comunione Totale', description: '+10% HP, +5% DEF, +5% ATK', branch: 'Spiriti', tier: 5, statBonus: { hp: 10, def: 5, atk: 5 } },
        ],
      },
      {
        name: 'Totemico', emoji: '🗿', description: 'Totem che potenziano il party',
        nodes: [
          { id: 'sci_t1', name: 'Totem di Forza', description: '+3% ATK, +3% HP', branch: 'Totemico', tier: 1, statBonus: { atk: 3, hp: 3 } },
          { id: 'sci_t2', name: 'Totem di Guarigione', description: '+5% HP, +3% DEF', branch: 'Totemico', tier: 2, statBonus: { hp: 5, def: 3 } },
          { id: 'sci_t3', name: 'Totem del Vento', description: '+5% SPD, +3% ATK', branch: 'Totemico', tier: 3, statBonus: { spd: 5, atk: 3 } },
          { id: 'sci_t4', name: 'Totem Ancestrale', description: '+3% ATK a tutto il party', branch: 'Totemico', tier: 4, statBonus: { atk: 3 }, specialEffect: 'party_atk' },
          { id: 'sci_t5', name: 'Grande Spirito', description: '+10% HP, +8% ATK, +5% DEF', branch: 'Totemico', tier: 5, statBonus: { hp: 10, atk: 8, def: 5 } },
        ],
      },
    ],
  },

  // ===== CRONOMANTE =====
  {
    heroClass: HeroClass.CRONO,
    branches: [
      {
        name: 'Accelerazione', emoji: '⚡', description: 'Velocita estrema e doppi turni',
        nodes: [
          { id: 'cro_a1', name: 'Flusso Rapido', description: '+5% SPD', branch: 'Accelerazione', tier: 1, statBonus: { spd: 5 } },
          { id: 'cro_a2', name: 'Distorsione', description: '+8% SPD', branch: 'Accelerazione', tier: 2, statBonus: { spd: 8 } },
          { id: 'cro_a3', name: 'Salto Temporale', description: '+5% SPD, +5% CRIT', branch: 'Accelerazione', tier: 3, statBonus: { spd: 5, crit: 5 } },
          { id: 'cro_a4', name: 'Haste Supremo', description: '+10% SPD, +5% ATK', branch: 'Accelerazione', tier: 4, statBonus: { spd: 10, atk: 5 } },
          { id: 'cro_a5', name: 'Paradosso Temporale', description: '+15% SPD', branch: 'Accelerazione', tier: 5, statBonus: { spd: 15 } },
        ],
      },
      {
        name: 'Entropia', emoji: '🌀', description: 'Manipolazione del tempo offensiva',
        nodes: [
          { id: 'cro_e1', name: 'Decadimento', description: '+5% ATK', branch: 'Entropia', tier: 1, statBonus: { atk: 5 } },
          { id: 'cro_e2', name: 'Erosione', description: '+5% ATK, +3% CRIT', branch: 'Entropia', tier: 2, statBonus: { atk: 5, crit: 3 } },
          { id: 'cro_e3', name: 'Invecchiamento', description: '+8% ATK', branch: 'Entropia', tier: 3, statBonus: { atk: 8 } },
          { id: 'cro_e4', name: 'Tempo Congelato', description: '+5% DEF, +8% ATK', branch: 'Entropia', tier: 4, statBonus: { def: 5, atk: 8 } },
          { id: 'cro_e5', name: 'Fine dei Tempi', description: '+15% ATK, +5% CRIT DMG', branch: 'Entropia', tier: 5, statBonus: { atk: 15, critDmg: 5 } },
        ],
      },
      {
        name: 'Paradosso', emoji: '♾️', description: 'Manipolazione temporale per il party',
        nodes: [
          { id: 'cro_p1', name: 'Eco Temporale', description: '+3% SPD, +3% HP', branch: 'Paradosso', tier: 1, statBonus: { spd: 3, hp: 3 } },
          { id: 'cro_p2', name: 'Bolla Temporale', description: '+5% DEF, +3% SPD', branch: 'Paradosso', tier: 2, statBonus: { def: 5, spd: 3 } },
          { id: 'cro_p3', name: 'Riavvolgimento', description: '+5% HP, +5% SPD', branch: 'Paradosso', tier: 3, statBonus: { hp: 5, spd: 5 } },
          { id: 'cro_p4', name: 'Flusso Condiviso', description: '+3% SPD a tutto il party', branch: 'Paradosso', tier: 4, statBonus: { spd: 3 }, specialEffect: 'party_spd' },
          { id: 'cro_p5', name: 'Signore del Tempo', description: '+12% SPD, +8% HP, +5% DEF', branch: 'Paradosso', tier: 5, statBonus: { spd: 12, hp: 8, def: 5 } },
        ],
      },
    ],
  },

  // ===== DRAGOON =====
  {
    heroClass: HeroClass.DRAGOON,
    branches: [
      {
        name: 'Cielo', emoji: '☁️', description: 'Salti devastanti e danno burst',
        nodes: [
          { id: 'dra_c1', name: 'Slancio', description: '+5% ATK', branch: 'Cielo', tier: 1, statBonus: { atk: 5 } },
          { id: 'dra_c2', name: 'Caduta Pesante', description: '+8% ATK', branch: 'Cielo', tier: 2, statBonus: { atk: 8 } },
          { id: 'dra_c3', name: 'Impatto Celeste', description: '+5% CRIT, +5% CRIT DMG', branch: 'Cielo', tier: 3, statBonus: { crit: 5, critDmg: 5 } },
          { id: 'dra_c4', name: 'Furia Draconica', description: '+10% ATK, +5% CRIT DMG', branch: 'Cielo', tier: 4, statBonus: { atk: 10, critDmg: 5 } },
          { id: 'dra_c5', name: 'Meteora', description: '+15% ATK, +10% CRIT DMG', branch: 'Cielo', tier: 5, statBonus: { atk: 15, critDmg: 10 } },
        ],
      },
      {
        name: 'Scaglie', emoji: '🐉', description: 'Corazza draconica e resistenza',
        nodes: [
          { id: 'dra_s1', name: 'Pelle Squamosa', description: '+5% DEF', branch: 'Scaglie', tier: 1, statBonus: { def: 5 } },
          { id: 'dra_s2', name: 'Corazza del Drago', description: '+8% HP', branch: 'Scaglie', tier: 2, statBonus: { hp: 8 } },
          { id: 'dra_s3', name: 'Sangue Draconico', description: '+5% HP, +5% DEF', branch: 'Scaglie', tier: 3, statBonus: { hp: 5, def: 5 } },
          { id: 'dra_s4', name: 'Ruggito', description: '+3% DEF a tutto il party', branch: 'Scaglie', tier: 4, statBonus: { def: 3 }, specialEffect: 'party_def' },
          { id: 'dra_s5', name: 'Avatar del Drago', description: '+12% HP, +8% DEF', branch: 'Scaglie', tier: 5, statBonus: { hp: 12, def: 8 } },
        ],
      },
      {
        name: 'Wyvern', emoji: '🦅', description: 'Agilita aerea e attacchi devastanti',
        nodes: [
          { id: 'dra_w1', name: 'Decollo', description: '+5% SPD', branch: 'Wyvern', tier: 1, statBonus: { spd: 5 } },
          { id: 'dra_w2', name: 'Picchiata', description: '+5% ATK, +3% CRIT', branch: 'Wyvern', tier: 2, statBonus: { atk: 5, crit: 3 } },
          { id: 'dra_w3', name: 'Soffio Draconico', description: '+8% ATK, +3% SPD', branch: 'Wyvern', tier: 3, statBonus: { atk: 8, spd: 3 } },
          { id: 'dra_w4', name: 'Volo del Drago', description: '+5% CRIT, +5% CRIT DMG', branch: 'Wyvern', tier: 4, statBonus: { crit: 5, critDmg: 5 } },
          { id: 'dra_w5', name: 'Re dei Cieli', description: '+12% ATK, +10% SPD', branch: 'Wyvern', tier: 5, statBonus: { atk: 12, spd: 10 } },
        ],
      },
    ],
  },

  // ===== SAMURAI =====
  {
    heroClass: HeroClass.SAMURAI,
    branches: [
      {
        name: 'Katana', emoji: '⚔️', description: 'Maestria con la spada',
        nodes: [
          { id: 'sam_k1', name: 'Taglio Pulito', description: '+5% ATK', branch: 'Katana', tier: 1, statBonus: { atk: 5 } },
          { id: 'sam_k2', name: 'Lama Affilata', description: '+5% CRIT', branch: 'Katana', tier: 2, statBonus: { crit: 5 } },
          { id: 'sam_k3', name: 'Colpo Preciso', description: '+8% ATK, +3% CRIT', branch: 'Katana', tier: 3, statBonus: { atk: 8, crit: 3 } },
          { id: 'sam_k4', name: 'Stile Battoujutsu', description: '+8% CRIT DMG, +5% SPD', branch: 'Katana', tier: 4, statBonus: { critDmg: 8, spd: 5 } },
          { id: 'sam_k5', name: 'Itto-ryu', description: '+12% ATK, +10% CRIT', branch: 'Katana', tier: 5, statBonus: { atk: 12, crit: 10 } },
        ],
      },
      {
        name: 'Bushido', emoji: '⛩️', description: 'Onore, disciplina e difesa',
        nodes: [
          { id: 'sam_b1', name: 'Disciplina', description: '+5% DEF', branch: 'Bushido', tier: 1, statBonus: { def: 5 } },
          { id: 'sam_b2', name: 'Meditazione', description: '+5% HP, +3% DEF', branch: 'Bushido', tier: 2, statBonus: { hp: 5, def: 3 } },
          { id: 'sam_b3', name: 'Spirito Indomito', description: '+8% HP', branch: 'Bushido', tier: 3, statBonus: { hp: 8 } },
          { id: 'sam_b4', name: 'Contrattacco', description: '+5% ATK, +5% DEF', branch: 'Bushido', tier: 4, statBonus: { atk: 5, def: 5 } },
          { id: 'sam_b5', name: 'Via del Guerriero', description: '+10% HP, +8% DEF', branch: 'Bushido', tier: 5, statBonus: { hp: 10, def: 8 } },
        ],
      },
      {
        name: 'Ronin', emoji: '🌸', description: 'Stile libero, velocita e precisione',
        nodes: [
          { id: 'sam_r1', name: 'Passo del Vento', description: '+5% SPD', branch: 'Ronin', tier: 1, statBonus: { spd: 5 } },
          { id: 'sam_r2', name: 'Riflessi Fulminei', description: '+3% SPD, +5% CRIT', branch: 'Ronin', tier: 2, statBonus: { spd: 3, crit: 5 } },
          { id: 'sam_r3', name: 'Colpo del Vento', description: '+5% ATK, +5% SPD', branch: 'Ronin', tier: 3, statBonus: { atk: 5, spd: 5 } },
          { id: 'sam_r4', name: 'Scia di Petali', description: '+25% danno vs nemici sotto 25% HP', branch: 'Ronin', tier: 4, statBonus: { atk: 5 }, specialEffect: 'execute' },
          { id: 'sam_r5', name: 'Musashi', description: '+10% CRIT, +10% SPD, +5% ATK', branch: 'Ronin', tier: 5, statBonus: { crit: 10, spd: 10, atk: 5 } },
        ],
      },
    ],
  },

  // ===== NECROMANTE =====
  {
    heroClass: HeroClass.NECROMANTE,
    branches: [
      {
        name: 'Morte', emoji: '☠️', description: 'Magia oscura devastante',
        nodes: [
          { id: 'nec_m1', name: 'Tocco Gelido', description: '+5% ATK', branch: 'Morte', tier: 1, statBonus: { atk: 5 } },
          { id: 'nec_m2', name: 'Anime Tormentate', description: '+8% ATK', branch: 'Morte', tier: 2, statBonus: { atk: 8 } },
          { id: 'nec_m3', name: 'Corruzione', description: '+5% ATK, +5% CRIT', branch: 'Morte', tier: 3, statBonus: { atk: 5, crit: 5 } },
          { id: 'nec_m4', name: 'Mietitore', description: '+10% CRIT DMG', branch: 'Morte', tier: 4, statBonus: { critDmg: 10 } },
          { id: 'nec_m5', name: 'Signore della Morte', description: '+15% ATK, +8% CRIT DMG', branch: 'Morte', tier: 5, statBonus: { atk: 15, critDmg: 8 } },
        ],
      },
      {
        name: 'Sangue', emoji: '🩸', description: 'Drain e sopravvivenza oscura',
        nodes: [
          { id: 'nec_s1', name: 'Sifone Vitale', description: '+5% HP', branch: 'Sangue', tier: 1, statBonus: { hp: 5 } },
          { id: 'nec_s2', name: 'Patto di Sangue', description: '+5% ATK, +5% HP', branch: 'Sangue', tier: 2, statBonus: { atk: 5, hp: 5 } },
          { id: 'nec_s3', name: 'Barriera d\'Ossa', description: '+8% DEF', branch: 'Sangue', tier: 3, statBonus: { def: 8 } },
          { id: 'nec_s4', name: 'Trasfusione', description: '+8% HP, +5% DEF. Drena vita dai nemici (10%)', branch: 'Sangue', tier: 4, statBonus: { hp: 8, def: 5 }, specialEffect: 'lifesteal' },
          { id: 'nec_s5', name: 'Immortalita Oscura', description: '+15% HP, +5% DEF', branch: 'Sangue', tier: 5, statBonus: { hp: 15, def: 5 } },
        ],
      },
      {
        name: 'Lich', emoji: '👁️', description: 'Potere oltre la morte, controllo totale',
        nodes: [
          { id: 'nec_l1', name: 'Volonta del Lich', description: '+3% ATK, +3% DEF', branch: 'Lich', tier: 1, statBonus: { atk: 3, def: 3 } },
          { id: 'nec_l2', name: 'Aura di Morte', description: '+5% ATK, +3% HP', branch: 'Lich', tier: 2, statBonus: { atk: 5, hp: 3 } },
          { id: 'nec_l3', name: 'Filatterio', description: '+8% HP, +5% DEF', branch: 'Lich', tier: 3, statBonus: { hp: 8, def: 5 } },
          { id: 'nec_l4', name: 'Dominio Non-Morto', description: '+3% ATK a tutto il party', branch: 'Lich', tier: 4, statBonus: { atk: 3 }, specialEffect: 'party_atk' },
          { id: 'nec_l5', name: 'Ascensione', description: '+12% ATK, +10% HP, +5% CRIT DMG', branch: 'Lich', tier: 5, statBonus: { atk: 12, hp: 10, critDmg: 5 } },
        ],
      },
    ],
  },

  // ===== ALCHIMISTA =====
  {
    heroClass: HeroClass.ALCHIMISTA,
    branches: [
      {
        name: 'Pozioni', emoji: '🧪', description: 'Cure e buff potenziati',
        nodes: [
          { id: 'alc_p1', name: 'Distillazione', description: '+5% ATK (potenzia cure)', branch: 'Pozioni', tier: 1, statBonus: { atk: 5 } },
          { id: 'alc_p2', name: 'Filtro Concentrato', description: '+5% HP, +3% ATK', branch: 'Pozioni', tier: 2, statBonus: { hp: 5, atk: 3 } },
          { id: 'alc_p3', name: 'Elisir Supremo', description: '+8% ATK', branch: 'Pozioni', tier: 3, statBonus: { atk: 8 } },
          { id: 'alc_p4', name: 'Panacea', description: '+3% HP a tutto il party', branch: 'Pozioni', tier: 4, statBonus: { hp: 3 }, specialEffect: 'party_hp' },
          { id: 'alc_p5', name: 'Pietra Filosofale', description: '+12% ATK, +10% HP', branch: 'Pozioni', tier: 5, statBonus: { atk: 12, hp: 10 } },
        ],
      },
      {
        name: 'Veleni', emoji: '☣️', description: 'Danni nel tempo e debuff chimici',
        nodes: [
          { id: 'alc_v1', name: 'Acido Base', description: '+5% ATK', branch: 'Veleni', tier: 1, statBonus: { atk: 5 } },
          { id: 'alc_v2', name: 'Tossina Lenta', description: '+5% ATK, +3% SPD', branch: 'Veleni', tier: 2, statBonus: { atk: 5, spd: 3 } },
          { id: 'alc_v3', name: 'Composto Instabile', description: '+5% CRIT, +5% ATK', branch: 'Veleni', tier: 3, statBonus: { crit: 5, atk: 5 } },
          { id: 'alc_v4', name: 'Gas Nervino', description: '+8% ATK, +5% CRIT DMG', branch: 'Veleni', tier: 4, statBonus: { atk: 8, critDmg: 5 } },
          { id: 'alc_v5', name: 'Bomba Chimica', description: '+15% ATK, +5% CRIT', branch: 'Veleni', tier: 5, statBonus: { atk: 15, crit: 5 } },
        ],
      },
      {
        name: 'Trasmutazione', emoji: '⚙️', description: 'Trasformazione e adattamento universale',
        nodes: [
          { id: 'alc_t1', name: 'Miscela Base', description: '+3% HP, +3% ATK', branch: 'Trasmutazione', tier: 1, statBonus: { hp: 3, atk: 3 } },
          { id: 'alc_t2', name: 'Catalizzatore', description: '+5% SPD, +3% DEF', branch: 'Trasmutazione', tier: 2, statBonus: { spd: 5, def: 3 } },
          { id: 'alc_t3', name: 'Transmutazione', description: '+5% ATK, +5% HP', branch: 'Trasmutazione', tier: 3, statBonus: { atk: 5, hp: 5 } },
          { id: 'alc_t4', name: 'Elisir Universale', description: '+3% HP a tutto il party', branch: 'Trasmutazione', tier: 4, statBonus: { hp: 3 }, specialEffect: 'party_hp' },
          { id: 'alc_t5', name: 'Opus Magnum', description: '+10% HP, +8% ATK, +5% DEF, +5% SPD', branch: 'Trasmutazione', tier: 5, statBonus: { hp: 10, atk: 8, def: 5, spd: 5 } },
        ],
      },
    ],
  },
];

// Helper: ottieni l'albero talenti per una classe
export function getTalentTree(heroClass: HeroClass): ClassTalentTree | undefined {
  return TALENT_TREES.find(t => t.heroClass === heroClass);
}

// Helper: ottieni un nodo specifico
export function getTalentNode(talentId: string): TalentNode | undefined {
  for (const tree of TALENT_TREES) {
    for (const branch of tree.branches) {
      const node = branch.nodes.find(n => n.id === talentId);
      if (node) return node;
    }
  }
  return undefined;
}

// Helper: tutti i talenti di un albero come flat array
export function getAllTalentNodes(heroClass: HeroClass): TalentNode[] {
  const tree = getTalentTree(heroClass);
  if (!tree) return [];
  return tree.branches.flatMap(b => b.nodes);
}
