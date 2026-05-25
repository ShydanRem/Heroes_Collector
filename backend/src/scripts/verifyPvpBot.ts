// Test standalone del generatore bot PVP (nessun framework, nessun DB).
// Esegui con: npx ts-node src/scripts/verifyPvpBot.ts
import { generateBotOpponent } from '../services/pvpBot';
import { createFighter } from '../services/battleEngine';

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error('  FAIL:', msg);
    failures++;
  } else {
    console.log('  ok:', msg);
  }
}

console.log('== Test generatore bot PVP ==');

const myHeroes = [
  { id: 'h1', rarity: 'raro', level: 10, hero_class: 'lama' },
  { id: 'h2', rarity: 'epico', level: 12, hero_class: 'arcano' },
  { id: 'h3', rarity: 'comune', level: 8, hero_class: 'guardiano' },
];

const bot = generateBotOpponent(myHeroes, 1000, 'test-seed');

assert(bot.isBot === true, 'flag isBot impostato');
assert(bot.heroes.length === 3, 'dimensione party bot = giocatore (3)');
assert(typeof bot.name === 'string' && bot.name.length > 0, 'il bot ha un nome');
assert(bot.elo === 1000, 'elo bot = elo giocatore (fight equilibrato)');
assert(bot.heroes.every((h) => h.hp > 0 && h.atk > 0 && h.def > 0), 'tutti gli eroi bot hanno stats positive');
assert(bot.heroes.every((h) => Array.isArray(h.ability_ids) && h.ability_ids.length > 0), 'tutti i bot hanno abilita');

// Compatibilita con il battle engine
const fighters = bot.heroes.map((h) => createFighter(h, 'defender'));
assert(fighters.length === 3, 'createFighter accetta gli eroi bot');
assert(fighters.every((f) => f.isAlive && f.maxHp > 0 && f.abilities.length > 0), 'fighter validi, vivi e con abilita');
assert(fighters.every((f) => f.team === 'defender'), 'fighter bot nel team defender');

// Edge: party da 1 eroe
const single = generateBotOpponent([{ id: 'x', rarity: 'comune', level: 1, hero_class: 'lama' }], 1200);
assert(single.heroes.length === 1, 'party da 1 → bot da 1');

// Edge: party oltre il cap
const big = generateBotOpponent(new Array(8).fill({ id: 'h', rarity: 'comune', level: 5, hero_class: 'lama' }), 1000);
assert(big.heroes.length === 5, 'party oltre 5 → bot limitato a 5');

if (failures > 0) {
  console.error(`\n${failures} test FALLITI`);
  process.exit(1);
}
console.log('\nTutti i test PVP bot superati ✓');
