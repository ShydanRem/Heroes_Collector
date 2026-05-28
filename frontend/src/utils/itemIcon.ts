export const SLOT_ICONS: Record<string, string> = {
  arma: '⚔️',
  armatura: '🛡️',
  accessorio: '💍',
};

export function getItemIcon(name: string, slot: string): string {
  const n = name.toLowerCase();
  // Armi
  if (n.includes('spada') || n.includes('lama')) return '🗡️';
  if (n.includes('arco') || n.includes('balestra')) return '🏹';
  if (n.includes('bastone') || n.includes('scettro') || n.includes('tomo') || n.includes('sfera')) return '🪄';
  if (n.includes('pugnale') || n.includes('falcetto')) return '🔪';
  if (n.includes('martello') || n.includes('mazza')) return '🔨';
  if (n.includes('ascia')) return '🪓';
  if (n.includes('lancia') || n.includes('tridente')) return '🔱';
  if (n.includes('frusta')) return '⛓️';
  if (n.includes('katana')) return '⚔️';
  if (n.includes('falce')) return '💀';
  if (n.includes('arpa')) return '🎵';
  // Armature
  if (n.includes('corazza') || n.includes('armatura') || n.includes('piastre') || n.includes('egida')) return '🛡️';
  if (n.includes('veste') || n.includes('tunica') || n.includes('manto') || n.includes('toga')) return '👘';
  if (n.includes('cotta') || n.includes('brigantina')) return '🧥';
  if (n.includes('elmo') || n.includes('corona')) return '👑';
  if (n.includes('mantello')) return '🧣';
  if (n.includes('pelle') || n.includes('gilet')) return '🦺';
  // Accessori
  if (n.includes('anello')) return '💍';
  if (n.includes('amuleto') || n.includes('talismano') || n.includes('ciondolo') || n.includes('pendente') || n.includes('sigillo')) return '📿';
  if (n.includes('stivali') || n.includes('calzari')) return '👢';
  if (n.includes('occhio') || n.includes('sfera') || n.includes('gemma') || n.includes('frammento')) return '🔮';
  if (n.includes('cintura')) return '🎗️';
  if (n.includes('guanti')) return '🧤';
  if (n.includes('ali')) return '🪽';
  if (n.includes('teschio')) return '💀';
  if (n.includes('cuore')) return '❤️';
  if (n.includes('occhiali')) return '👓';
  if (n.includes('orecchino')) return '✨';
  if (n.includes('fascia') || n.includes('bracciale')) return '💪';
  return SLOT_ICONS[slot] || '📦';
}
