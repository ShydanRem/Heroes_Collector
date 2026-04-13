import { Rarity, HeroClass } from '../types';

// ============================================
// DEFINIZIONI OGGETTI — 100+ items con restrizioni di classe
// ============================================

export type ItemSlot = 'arma' | 'armatura' | 'accessorio';

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  slot: ItemSlot;
  rarity: Rarity;
  statBonuses: Partial<Record<'hp' | 'atk' | 'def' | 'spd' | 'crit' | 'critDmg', number>>;
  setId?: string; // per bonus set
  allowedClasses?: HeroClass[]; // se undefined = tutte le classi
}

// =========================================================================
//  GRUPPI DI CLASSI PER TIPO EQUIPMENT
// =========================================================================

// Armi: chi puo usare cosa
const MELEE_CLASSES = [HeroClass.GUARDIANO, HeroClass.LAMA, HeroClass.SAMURAI, HeroClass.DRAGOON];
const MAGIC_CLASSES = [HeroClass.ARCANO, HeroClass.CUSTODE, HeroClass.SCIAMANO, HeroClass.CRONO, HeroClass.NECROMANTE, HeroClass.ALCHIMISTA];
const RANGED_CLASSES = [HeroClass.RANGER, HeroClass.OMBRA];
const AGILE_CLASSES = [HeroClass.OMBRA, HeroClass.RANGER, HeroClass.LAMA];
const HEAVY_CLASSES = [HeroClass.GUARDIANO, HeroClass.LAMA, HeroClass.DRAGOON];
const POLEARM_CLASSES = [HeroClass.DRAGOON, HeroClass.GUARDIANO, HeroClass.SAMURAI];
const DARK_CLASSES = [HeroClass.NECROMANTE, HeroClass.OMBRA];
const SUPPORT_WEAPON_CLASSES = [HeroClass.CUSTODE, HeroClass.SCIAMANO, HeroClass.ALCHIMISTA, HeroClass.CRONO];

// Armature: chi puo indossare cosa
const HEAVY_ARMOR_CLASSES = [HeroClass.GUARDIANO, HeroClass.DRAGOON, HeroClass.LAMA, HeroClass.SAMURAI];
const LIGHT_ARMOR_CLASSES = [HeroClass.OMBRA, HeroClass.RANGER, HeroClass.SAMURAI, HeroClass.LAMA, HeroClass.DRAGOON, HeroClass.ALCHIMISTA];
const MAGIC_ARMOR_CLASSES = [HeroClass.ARCANO, HeroClass.CUSTODE, HeroClass.SCIAMANO, HeroClass.CRONO, HeroClass.NECROMANTE, HeroClass.ALCHIMISTA];

// Accessori: nessuna restrizione (undefined)

export const ITEMS: ItemDefinition[] = [

  // =========================================================================
  //  ARMI — 34 pezzi (30 originali + 4 nuove)
  // =========================================================================

  // --- Comuni (5) ---
  { id: 'w_spada_ruggine', name: 'Spada Arrugginita', description: 'Una vecchia spada, ma taglia ancora.', slot: 'arma', rarity: Rarity.COMUNE, statBonuses: { atk: 5 }, allowedClasses: MELEE_CLASSES },
  { id: 'w_bastone_legno', name: 'Bastone di Legno', description: 'Un semplice bastone da viaggio.', slot: 'arma', rarity: Rarity.COMUNE, statBonuses: { atk: 3, spd: 2 }, allowedClasses: MAGIC_CLASSES },
  { id: 'w_arco_corto', name: 'Arco Corto', description: 'Arco leggero per tiri rapidi.', slot: 'arma', rarity: Rarity.COMUNE, statBonuses: { atk: 4, crit: 2 }, allowedClasses: RANGED_CLASSES },
  { id: 'w_pugnale_base', name: 'Pugnale di Bronzo', description: 'Piccolo ma efficace.', slot: 'arma', rarity: Rarity.COMUNE, statBonuses: { atk: 3, spd: 3 }, allowedClasses: AGILE_CLASSES },
  { id: 'w_mazza_legno', name: 'Mazza di Legno', description: 'Rozza ma pesante.', slot: 'arma', rarity: Rarity.COMUNE, statBonuses: { atk: 6, spd: -2 }, allowedClasses: HEAVY_CLASSES },

  // --- Non Comuni (5) ---
  { id: 'w_spada_ferro', name: 'Spada di Ferro', description: 'Spada solida e ben bilanciata.', slot: 'arma', rarity: Rarity.NON_COMUNE, statBonuses: { atk: 10 }, allowedClasses: MELEE_CLASSES },
  { id: 'w_pugnale_ombra', name: 'Pugnale d\'Ombra', description: 'Lama sottile che brilla al buio.', slot: 'arma', rarity: Rarity.NON_COMUNE, statBonuses: { atk: 7, crit: 5 }, allowedClasses: AGILE_CLASSES },
  { id: 'w_martello_guerra', name: 'Martello da Guerra', description: 'Pesante ma devastante.', slot: 'arma', rarity: Rarity.NON_COMUNE, statBonuses: { atk: 12, spd: -3 }, allowedClasses: HEAVY_CLASSES },
  { id: 'w_arco_lungo', name: 'Arco Lungo', description: 'Maggiore gittata, maggiore potenza.', slot: 'arma', rarity: Rarity.NON_COMUNE, statBonuses: { atk: 9, crit: 3 }, allowedClasses: RANGED_CLASSES },
  { id: 'w_bastone_quercia', name: 'Bastone di Quercia', description: 'Legno antico e resistente, canalizza bene la magia.', slot: 'arma', rarity: Rarity.NON_COMUNE, statBonuses: { atk: 8, hp: 15 }, allowedClasses: MAGIC_CLASSES },

  // --- Rari (6) ---
  { id: 'w_lama_fiamma', name: 'Lama di Fiamma', description: 'Arde di un fuoco eterno.', slot: 'arma', rarity: Rarity.RARO, statBonuses: { atk: 18, crit: 3 }, allowedClasses: MELEE_CLASSES },
  { id: 'w_arco_vento', name: 'Arco del Vento', description: 'Le frecce volano piu veloci del vento.', slot: 'arma', rarity: Rarity.RARO, statBonuses: { atk: 14, spd: 8 }, allowedClasses: RANGED_CLASSES },
  { id: 'w_scettro_arcano', name: 'Scettro Arcano', description: 'Canalizza potere magico devastante.', slot: 'arma', rarity: Rarity.RARO, statBonuses: { atk: 20, critDmg: 10 }, allowedClasses: MAGIC_CLASSES },
  { id: 'w_lancia_ghiaccio', name: 'Lancia di Ghiaccio', description: 'Il freddo paralizza chi la tocca.', slot: 'arma', rarity: Rarity.RARO, statBonuses: { atk: 16, def: 5, spd: 3 }, allowedClasses: POLEARM_CLASSES },
  { id: 'w_frusta_spina', name: 'Frusta Spinata', description: 'Ogni colpo lascia ferite profonde.', slot: 'arma', rarity: Rarity.RARO, statBonuses: { atk: 15, crit: 6, critDmg: 8 }, allowedClasses: AGILE_CLASSES },
  { id: 'w_tome_antico', name: 'Tomo Antico', description: 'Pagine di incantesimi dimenticati.', slot: 'arma', rarity: Rarity.RARO, statBonuses: { atk: 17, hp: 25 }, setId: 'set_scholar', allowedClasses: MAGIC_CLASSES },

  // --- Molto Rari (7 — +2 nuove) ---
  { id: 'w_ascia_tuono', name: 'Ascia del Tuono', description: 'Ogni colpo risuona come un tuono.', slot: 'arma', rarity: Rarity.MOLTO_RARO, statBonuses: { atk: 25, crit: 8, critDmg: 15 }, allowedClasses: HEAVY_CLASSES },
  { id: 'w_katana_vuoto', name: 'Katana del Vuoto', description: 'Taglia lo spazio stesso.', slot: 'arma', rarity: Rarity.MOLTO_RARO, statBonuses: { atk: 22, spd: 12, crit: 5 }, allowedClasses: [HeroClass.SAMURAI, HeroClass.LAMA, HeroClass.OMBRA] },
  { id: 'w_martello_terra', name: 'Martello Terremoto', description: 'Spacca il terreno sotto i piedi dei nemici.', slot: 'arma', rarity: Rarity.MOLTO_RARO, statBonuses: { atk: 28, def: 8 }, allowedClasses: HEAVY_CLASSES },
  { id: 'w_arpa_sirena', name: 'Arpa della Sirena', description: 'Melodia che incanta e ferisce.', slot: 'arma', rarity: Rarity.MOLTO_RARO, statBonuses: { atk: 20, spd: 10, hp: 40 }, setId: 'set_ocean', allowedClasses: SUPPORT_WEAPON_CLASSES },
  { id: 'w_falcetto_luna', name: 'Falcetto Lunare', description: 'Risplende sotto la luna piena.', slot: 'arma', rarity: Rarity.MOLTO_RARO, statBonuses: { atk: 24, crit: 10, critDmg: 12 }, setId: 'set_lunar', allowedClasses: DARK_CLASSES },
  // NUOVA: arma magica molto rara
  { id: 'w_sfera_arcana', name: 'Sfera Arcana', description: 'Un globo di energia pura che fluttua obbediente.', slot: 'arma', rarity: Rarity.MOLTO_RARO, statBonuses: { atk: 23, critDmg: 15, spd: 5 }, allowedClasses: MAGIC_CLASSES },
  // NUOVA: arma ranged molto rara
  { id: 'w_balestra_cacciatore', name: 'Balestra del Cacciatore', description: 'Dardi che non mancano mai il bersaglio.', slot: 'arma', rarity: Rarity.MOLTO_RARO, statBonuses: { atk: 24, crit: 10, spd: 5 }, allowedClasses: RANGED_CLASSES },

  // --- Epici (5) ---
  { id: 'w_falce_morte', name: 'Falce della Morte', description: 'Chi la impugna non conosce pieta.', slot: 'arma', rarity: Rarity.EPICO, statBonuses: { atk: 35, crit: 10, critDmg: 25 }, allowedClasses: DARK_CLASSES },
  { id: 'w_bastone_eterno', name: 'Bastone dell\'Eterno', description: 'Antico artefatto di potere immenso.', slot: 'arma', rarity: Rarity.EPICO, statBonuses: { atk: 30, hp: 50, spd: 5 }, allowedClasses: MAGIC_CLASSES },
  { id: 'w_lama_caos', name: 'Lama del Caos', description: 'Ogni fendente distorce la realta.', slot: 'arma', rarity: Rarity.EPICO, statBonuses: { atk: 38, crit: 8, spd: -5 }, setId: 'set_chaos', allowedClasses: MELEE_CLASSES },
  { id: 'w_arco_fenice', name: 'Arco della Fenice', description: 'Frecce che rinascono dalle ceneri.', slot: 'arma', rarity: Rarity.EPICO, statBonuses: { atk: 32, crit: 12, spd: 8 }, allowedClasses: RANGED_CLASSES },
  { id: 'w_tridente_abisso', name: 'Tridente dell\'Abisso', description: 'Richiamato dalle profondita oceaniche.', slot: 'arma', rarity: Rarity.EPICO, statBonuses: { atk: 34, hp: 60, def: 10 }, setId: 'set_ocean', allowedClasses: POLEARM_CLASSES },

  // --- Leggendari (5 — +1 nuova) ---
  { id: 'w_excalibur', name: 'Excalibur', description: 'La spada leggendaria dei re. Scelta dal destino.', slot: 'arma', rarity: Rarity.LEGGENDARIO, statBonuses: { atk: 50, def: 15, crit: 12, critDmg: 30 }, allowedClasses: MELEE_CLASSES },
  { id: 'w_arco_stelle', name: 'Arco delle Stelle', description: 'Forgiato dalla luce delle stelle cadenti.', slot: 'arma', rarity: Rarity.LEGGENDARIO, statBonuses: { atk: 45, spd: 20, crit: 15 }, allowedClasses: RANGED_CLASSES },
  { id: 'w_mjolnir', name: 'Mjolnir', description: 'Solo i degni possono sollevarlo.', slot: 'arma', rarity: Rarity.LEGGENDARIO, statBonuses: { atk: 55, critDmg: 35, hp: 80 }, allowedClasses: HEAVY_CLASSES },
  { id: 'w_lama_infinito', name: 'Lama dell\'Infinito', description: 'Non ha inizio ne fine. Taglia tutto.', slot: 'arma', rarity: Rarity.LEGGENDARIO, statBonuses: { atk: 48, spd: 15, crit: 18, critDmg: 25 }, setId: 'set_cosmos', allowedClasses: MELEE_CLASSES },
  // NUOVA: arma magica leggendaria
  { id: 'w_bastone_millenni', name: 'Bastone dei Millenni', description: 'Ogni era ha aggiunto un incantesimo al suo legno eterno.', slot: 'arma', rarity: Rarity.LEGGENDARIO, statBonuses: { atk: 48, hp: 60, critDmg: 30, spd: 10 }, allowedClasses: MAGIC_CLASSES },

  // =========================================================================
  //  ARMATURE — 28 pezzi (25 originali + 3 nuove)
  // =========================================================================

  // --- Comuni (4) ---
  { id: 'a_veste_cuoio', name: 'Veste di Cuoio', description: 'Protezione base ma affidabile.', slot: 'armatura', rarity: Rarity.COMUNE, statBonuses: { def: 5, hp: 15 }, allowedClasses: LIGHT_ARMOR_CLASSES },
  { id: 'a_tunica_tela', name: 'Tunica di Tela', description: 'Leggera e comoda.', slot: 'armatura', rarity: Rarity.COMUNE, statBonuses: { def: 3, spd: 2 }, allowedClasses: MAGIC_ARMOR_CLASSES },
  { id: 'a_gilet_viaggio', name: 'Gilet da Viaggio', description: 'Pratico per le avventure.', slot: 'armatura', rarity: Rarity.COMUNE, statBonuses: { def: 4, hp: 10, spd: 1 }, allowedClasses: LIGHT_ARMOR_CLASSES },
  { id: 'a_scudo_legno', name: 'Scudo di Legno', description: 'Meglio di niente.', slot: 'armatura', rarity: Rarity.COMUNE, statBonuses: { def: 7 }, allowedClasses: HEAVY_ARMOR_CLASSES },

  // --- Non Comuni (4) ---
  { id: 'a_cotta_maglia', name: 'Cotta di Maglia', description: 'Anelli di ferro intrecciati.', slot: 'armatura', rarity: Rarity.NON_COMUNE, statBonuses: { def: 10, hp: 30 }, allowedClasses: HEAVY_ARMOR_CLASSES },
  { id: 'a_veste_mago', name: 'Veste del Mago', description: 'Tessuto incantato che respinge i colpi.', slot: 'armatura', rarity: Rarity.NON_COMUNE, statBonuses: { def: 7, hp: 20, atk: 3 }, allowedClasses: MAGIC_ARMOR_CLASSES },
  { id: 'a_pelle_lupo', name: 'Pelle di Lupo', description: 'La pelliccia rinforza il corpo.', slot: 'armatura', rarity: Rarity.NON_COMUNE, statBonuses: { def: 8, spd: 4, hp: 15 }, allowedClasses: LIGHT_ARMOR_CLASSES },
  { id: 'a_brigantina', name: 'Brigantina', description: 'Piastre metalliche cucite nel tessuto.', slot: 'armatura', rarity: Rarity.NON_COMUNE, statBonuses: { def: 12, hp: 20, spd: -2 }, allowedClasses: HEAVY_ARMOR_CLASSES },

  // --- Rari (5) ---
  { id: 'a_armatura_piastre', name: 'Armatura a Piastre', description: 'Protezione pesante ma impenetrabile.', slot: 'armatura', rarity: Rarity.RARO, statBonuses: { def: 20, hp: 60, spd: -5 }, allowedClasses: HEAVY_ARMOR_CLASSES },
  { id: 'a_manto_ombra', name: 'Manto d\'Ombra', description: 'Rende il portatore sfuggente.', slot: 'armatura', rarity: Rarity.RARO, statBonuses: { def: 12, spd: 10, crit: 3 }, allowedClasses: LIGHT_ARMOR_CLASSES },
  { id: 'a_toga_studioso', name: 'Toga dello Studioso', description: 'Intrisa di sapere antico.', slot: 'armatura', rarity: Rarity.RARO, statBonuses: { def: 10, hp: 30, atk: 8 }, setId: 'set_scholar', allowedClasses: MAGIC_ARMOR_CLASSES },
  { id: 'a_corazza_scaglie', name: 'Corazza a Scaglie', description: 'Scaglie metalliche sovrapposte.', slot: 'armatura', rarity: Rarity.RARO, statBonuses: { def: 18, hp: 45 }, allowedClasses: HEAVY_ARMOR_CLASSES },
  { id: 'a_veste_tempesta', name: 'Veste della Tempesta', description: 'Elettricita statica scorre nel tessuto.', slot: 'armatura', rarity: Rarity.RARO, statBonuses: { def: 14, spd: 8, atk: 5 }, allowedClasses: MAGIC_ARMOR_CLASSES },

  // --- Molto Rari (4) ---
  { id: 'a_corazza_drago', name: 'Corazza di Drago', description: 'Scaglie di drago forgiate in armatura.', slot: 'armatura', rarity: Rarity.MOLTO_RARO, statBonuses: { def: 28, hp: 80, atk: 5 }, allowedClasses: HEAVY_ARMOR_CLASSES },
  { id: 'a_manto_lunare', name: 'Manto Lunare', description: 'Tessuto intrecciato con raggi di luna.', slot: 'armatura', rarity: Rarity.MOLTO_RARO, statBonuses: { def: 22, spd: 10, crit: 5, hp: 40 }, setId: 'set_lunar', allowedClasses: MAGIC_ARMOR_CLASSES },
  { id: 'a_corallo_vivente', name: 'Armatura di Corallo Vivente', description: 'Corallo che cresce e si ripara da solo.', slot: 'armatura', rarity: Rarity.MOLTO_RARO, statBonuses: { def: 25, hp: 70, spd: -3 }, setId: 'set_ocean', allowedClasses: HEAVY_ARMOR_CLASSES },
  { id: 'a_pelle_bestia', name: 'Pelle della Bestia Antica', description: 'Indossarla risveglia istinti primordiali.', slot: 'armatura', rarity: Rarity.MOLTO_RARO, statBonuses: { def: 20, hp: 50, atk: 10, crit: 4 }, allowedClasses: LIGHT_ARMOR_CLASSES },

  // --- Epici (5 — +1 nuova) ---
  { id: 'a_egida_divina', name: 'Egida Divina', description: 'Benedetta dagli dei.', slot: 'armatura', rarity: Rarity.EPICO, statBonuses: { def: 35, hp: 120, spd: 5 }, allowedClasses: HEAVY_ARMOR_CLASSES },
  { id: 'a_mantello_caos', name: 'Mantello del Caos', description: 'La realta si piega attorno a chi lo indossa.', slot: 'armatura', rarity: Rarity.EPICO, statBonuses: { def: 30, atk: 12, crit: 8, spd: 5 }, setId: 'set_chaos', allowedClasses: MAGIC_ARMOR_CLASSES },
  { id: 'a_armatura_phoenix', name: 'Armatura della Fenice', description: 'Rinasce dalle ceneri della battaglia.', slot: 'armatura', rarity: Rarity.EPICO, statBonuses: { def: 32, hp: 100, critDmg: 15 }, allowedClasses: HEAVY_ARMOR_CLASSES },
  { id: 'a_nebulosa', name: 'Veste della Nebulosa', description: 'Fatta di polvere di stelle.', slot: 'armatura', rarity: Rarity.EPICO, statBonuses: { def: 28, hp: 80, spd: 10, atk: 8 }, setId: 'set_cosmos', allowedClasses: MAGIC_ARMOR_CLASSES },
  // NUOVA: armatura leggera epica
  { id: 'a_veste_ombra_eterna', name: 'Veste dell\'Ombra Eterna', description: 'Tessuta con fili di oscurita vivente, avvolge chi la indossa in un manto impenetrabile.', slot: 'armatura', rarity: Rarity.EPICO, statBonuses: { def: 25, spd: 15, crit: 10, critDmg: 12 }, allowedClasses: LIGHT_ARMOR_CLASSES },

  // --- Leggendari (4 — +2 nuove) ---
  { id: 'a_armatura_void', name: 'Armatura del Vuoto', description: 'Assorbe il danno nel nulla assoluto.', slot: 'armatura', rarity: Rarity.LEGGENDARIO, statBonuses: { def: 50, hp: 150, atk: 10, spd: 8 }, allowedClasses: HEAVY_ARMOR_CLASSES },
  { id: 'a_armatura_titano', name: 'Armatura del Titano', description: 'Forgiata nelle viscere della terra.', slot: 'armatura', rarity: Rarity.LEGGENDARIO, statBonuses: { def: 55, hp: 200, atk: 5, spd: -8 }, allowedClasses: HEAVY_ARMOR_CLASSES },
  // NUOVA: armatura magica leggendaria
  { id: 'a_toga_arcimago', name: 'Toga dell\'Arcimago', description: 'Indossata dai piu grandi maghi della storia. Pulsa di potere arcano.', slot: 'armatura', rarity: Rarity.LEGGENDARIO, statBonuses: { def: 40, hp: 120, atk: 20, spd: 12 }, allowedClasses: MAGIC_ARMOR_CLASSES },
  // NUOVA: armatura leggera leggendaria
  { id: 'a_mantello_predatore', name: 'Mantello del Predatore', description: 'Chi lo indossa diventa il cacciatore supremo. Invisibile, letale, inarrestabile.', slot: 'armatura', rarity: Rarity.LEGGENDARIO, statBonuses: { def: 35, spd: 25, crit: 15, critDmg: 25 }, allowedClasses: LIGHT_ARMOR_CLASSES },

  // =========================================================================
  //  ACCESSORI — 35 pezzi (nessuna restrizione di classe)
  // =========================================================================

  // --- Comuni (6) ---
  { id: 'acc_anello_forza', name: 'Anello della Forza', description: 'Un piccolo boost di potenza.', slot: 'accessorio', rarity: Rarity.COMUNE, statBonuses: { atk: 3 } },
  { id: 'acc_amuleto_vita', name: 'Amuleto della Vita', description: 'Pulsa con energia vitale.', slot: 'accessorio', rarity: Rarity.COMUNE, statBonuses: { hp: 20 } },
  { id: 'acc_stivali_rapidi', name: 'Stivali Rapidi', description: 'Muoversi piu in fretta.', slot: 'accessorio', rarity: Rarity.COMUNE, statBonuses: { spd: 5 } },
  { id: 'acc_bracciale_cuoio', name: 'Bracciale di Cuoio', description: 'Protezione leggera per il polso.', slot: 'accessorio', rarity: Rarity.COMUNE, statBonuses: { def: 3, hp: 5 } },
  { id: 'acc_ciondolo_fortuna', name: 'Ciondolo della Fortuna', description: 'Porta un po\' di fortuna.', slot: 'accessorio', rarity: Rarity.COMUNE, statBonuses: { crit: 3 } },
  { id: 'acc_fascia_testa', name: 'Fascia da Combattimento', description: 'Concentrazione in battaglia.', slot: 'accessorio', rarity: Rarity.COMUNE, statBonuses: { atk: 2, spd: 2 } },

  // --- Non Comuni (5) ---
  { id: 'acc_collana_crit', name: 'Collana del Critico', description: 'Affina la precisione dei colpi.', slot: 'accessorio', rarity: Rarity.NON_COMUNE, statBonuses: { crit: 8, critDmg: 10 } },
  { id: 'acc_cintura_vigore', name: 'Cintura del Vigore', description: 'Rafforza il corpo intero.', slot: 'accessorio', rarity: Rarity.NON_COMUNE, statBonuses: { hp: 40, def: 5 } },
  { id: 'acc_guanti_ladro', name: 'Guanti del Ladro', description: 'Dita agili per colpi precisi.', slot: 'accessorio', rarity: Rarity.NON_COMUNE, statBonuses: { crit: 6, spd: 4 } },
  { id: 'acc_mantello_vento', name: 'Mantello del Vento', description: 'Il vento segue i tuoi movimenti.', slot: 'accessorio', rarity: Rarity.NON_COMUNE, statBonuses: { spd: 8, crit: 2 } },
  { id: 'acc_amuleto_ferro', name: 'Amuleto di Ferro', description: 'Protezione semplice ma solida.', slot: 'accessorio', rarity: Rarity.NON_COMUNE, statBonuses: { def: 8, hp: 20 } },

  // --- Rari (7) ---
  { id: 'acc_anello_vampiro', name: 'Anello del Vampiro', description: 'Drena vita dai nemici colpiti.', slot: 'accessorio', rarity: Rarity.RARO, statBonuses: { atk: 8, hp: 30, crit: 5 } },
  { id: 'acc_orecchino_tempo', name: 'Orecchino del Tempo', description: 'Il tempo rallenta per chi lo indossa.', slot: 'accessorio', rarity: Rarity.RARO, statBonuses: { spd: 15, crit: 3 } },
  { id: 'acc_occhiali_studioso', name: 'Occhiali dello Studioso', description: 'Tutto diventa piu chiaro.', slot: 'accessorio', rarity: Rarity.RARO, statBonuses: { atk: 10, crit: 4, critDmg: 8 }, setId: 'set_scholar' },
  { id: 'acc_stivali_ombra', name: 'Stivali d\'Ombra', description: 'Passi silenziosi come la notte.', slot: 'accessorio', rarity: Rarity.RARO, statBonuses: { spd: 12, crit: 6 } },
  { id: 'acc_talismano_fuoco', name: 'Talismano di Fuoco', description: 'Caldo al tatto, brucia i nemici.', slot: 'accessorio', rarity: Rarity.RARO, statBonuses: { atk: 12, critDmg: 12 } },
  { id: 'acc_cintura_titano', name: 'Cintura del Titano', description: 'Forza sovrumana.', slot: 'accessorio', rarity: Rarity.RARO, statBonuses: { atk: 6, hp: 50, def: 6 } },
  { id: 'acc_perla_mare', name: 'Perla del Mare', description: 'Luminosa come le profondita.', slot: 'accessorio', rarity: Rarity.RARO, statBonuses: { hp: 40, def: 8, spd: 4 }, setId: 'set_ocean' },

  // --- Molto Rari (5) ---
  { id: 'acc_corona_saggia', name: 'Corona del Saggio', description: 'Conoscenza infinita racchiusa in oro.', slot: 'accessorio', rarity: Rarity.MOLTO_RARO, statBonuses: { atk: 12, def: 8, spd: 8, crit: 5 } },
  { id: 'acc_anello_destino', name: 'Anello del Destino', description: 'Chi lo indossa sfida il fato.', slot: 'accessorio', rarity: Rarity.MOLTO_RARO, statBonuses: { crit: 12, critDmg: 20, spd: 5 } },
  { id: 'acc_gemma_lunare', name: 'Gemma Lunare', description: 'Brilla con la luce della luna piena.', slot: 'accessorio', rarity: Rarity.MOLTO_RARO, statBonuses: { hp: 50, atk: 10, def: 10 }, setId: 'set_lunar' },
  { id: 'acc_ali_vento', name: 'Ali del Vento', description: 'Leggerezza soprannaturale.', slot: 'accessorio', rarity: Rarity.MOLTO_RARO, statBonuses: { spd: 20, crit: 8, critDmg: 10 } },
  { id: 'acc_teschio_antico', name: 'Teschio dell\'Antico', description: 'Sussurra segreti di potere.', slot: 'accessorio', rarity: Rarity.MOLTO_RARO, statBonuses: { atk: 15, critDmg: 18, hp: -20 } },

  // --- Epici (4) ---
  { id: 'acc_cuore_fenice', name: 'Cuore di Fenice', description: 'Brucia senza consumarsi.', slot: 'accessorio', rarity: Rarity.EPICO, statBonuses: { hp: 80, atk: 15, crit: 8, critDmg: 20 } },
  { id: 'acc_sigillo_caos', name: 'Sigillo del Caos', description: 'Il potere del caos concentrato.', slot: 'accessorio', rarity: Rarity.EPICO, statBonuses: { atk: 20, crit: 10, critDmg: 25, def: -5 }, setId: 'set_chaos' },
  { id: 'acc_frammento_stella', name: 'Frammento di Stella', description: 'Un pezzo di stella cadente.', slot: 'accessorio', rarity: Rarity.EPICO, statBonuses: { atk: 16, spd: 12, crit: 10, hp: 40 }, setId: 'set_cosmos' },
  { id: 'acc_pendente_abisso', name: 'Pendente dell\'Abisso', description: 'Le profondita ti chiamano.', slot: 'accessorio', rarity: Rarity.EPICO, statBonuses: { hp: 100, def: 15, atk: 12 }, setId: 'set_ocean' },

  // --- Leggendari (3) ---
  { id: 'acc_occhio_dio', name: 'Occhio del Dio', description: 'Vede tutto, sa tutto.', slot: 'accessorio', rarity: Rarity.LEGGENDARIO, statBonuses: { atk: 20, def: 15, spd: 15, crit: 12, critDmg: 30 } },
  { id: 'acc_cuore_mondo', name: 'Cuore del Mondo', description: 'Batte al ritmo della terra stessa.', slot: 'accessorio', rarity: Rarity.LEGGENDARIO, statBonuses: { hp: 200, def: 25, atk: 10, spd: 10 } },
  { id: 'acc_corona_cosmica', name: 'Corona Cosmica', description: 'Frammenti di universo intrecciati.', slot: 'accessorio', rarity: Rarity.LEGGENDARIO, statBonuses: { atk: 25, spd: 18, crit: 15, critDmg: 35 }, setId: 'set_cosmos' },
];

// =========================================================================
//  BONUS SET (3 pezzi dello stesso set = bonus)
// =========================================================================

export interface SetBonus {
  setId: string;
  name: string;
  description: string;
  piecesRequired: number;
  bonus: Partial<Record<'hp' | 'atk' | 'def' | 'spd' | 'crit' | 'critDmg', number>>;
}

export const SET_BONUSES: SetBonus[] = [
  {
    setId: 'set_scholar', name: 'Set dello Studioso',
    description: '3 pezzi: +15 ATK, +10 CRIT DMG',
    piecesRequired: 3, bonus: { atk: 15, critDmg: 10 },
  },
  {
    setId: 'set_ocean', name: 'Set dell\'Oceano',
    description: '3 pezzi: +100 HP, +15 DEF, +8 SPD',
    piecesRequired: 3, bonus: { hp: 100, def: 15, spd: 8 },
  },
  {
    setId: 'set_lunar', name: 'Set Lunare',
    description: '3 pezzi: +12 CRIT, +20 CRIT DMG, +8 SPD',
    piecesRequired: 3, bonus: { crit: 12, critDmg: 20, spd: 8 },
  },
  {
    setId: 'set_chaos', name: 'Set del Caos',
    description: '3 pezzi: +25 ATK, +15 CRIT, +30 CRIT DMG',
    piecesRequired: 3, bonus: { atk: 25, crit: 15, critDmg: 30 },
  },
  {
    setId: 'set_cosmos', name: 'Set Cosmico',
    description: '3 pezzi: +20 a TUTTE le stats',
    piecesRequired: 3, bonus: { hp: 80, atk: 20, def: 20, spd: 20, crit: 10, critDmg: 20 },
  },
];

// Mappa per accesso rapido
export const ITEM_MAP = new Map(ITEMS.map(i => [i.id, i]));

// ============================================
// LOOT TABLE
// ============================================

export interface LootEntry {
  itemId: string;
  dropChance: number;
}

export function getLootTable(wave: number, dungeonCompleted: boolean): LootEntry[] {
  const loot: LootEntry[] = [];

  if (wave <= 2) {
    ITEMS.filter(i => i.rarity === Rarity.COMUNE).forEach(item => {
      loot.push({ itemId: item.id, dropChance: 15 });
    });
  } else if (wave <= 4) {
    ITEMS.filter(i => i.rarity === Rarity.NON_COMUNE).forEach(item => {
      loot.push({ itemId: item.id, dropChance: 12 });
    });
    ITEMS.filter(i => i.rarity === Rarity.RARO).forEach(item => {
      loot.push({ itemId: item.id, dropChance: 5 });
    });
  } else {
    ITEMS.filter(i => i.rarity === Rarity.RARO).forEach(item => {
      loot.push({ itemId: item.id, dropChance: 15 });
    });
    ITEMS.filter(i => i.rarity === Rarity.MOLTO_RARO).forEach(item => {
      loot.push({ itemId: item.id, dropChance: 8 });
    });
    ITEMS.filter(i => i.rarity === Rarity.EPICO).forEach(item => {
      loot.push({ itemId: item.id, dropChance: 3 });
    });
  }

  if (dungeonCompleted) {
    ITEMS.filter(i => i.rarity === Rarity.LEGGENDARIO).forEach(item => {
      loot.push({ itemId: item.id, dropChance: 1 });
    });
  }

  return loot;
}

export function rollLoot(wave: number, dungeonCompleted: boolean): string[] {
  const table = getLootTable(wave, dungeonCompleted);
  const drops: string[] = [];

  for (const entry of table) {
    if (Math.random() * 100 < entry.dropChance) {
      drops.push(entry.itemId);
    }
  }

  return drops.slice(0, 2);
}
