import React from 'react';
import { HeroClass, Rarity, RARITY_COLORS } from '../types';

interface HeroSpriteProps {
  heroClass: HeroClass;
  rarity: Rarity;
  size?: number;
  animate?: 'idle' | 'attack' | 'hurt' | 'cast' | 'dead' | 'none';
  flip?: boolean; // specchia per i nemici
  name?: string;
}

/**
 * Sprite SVG generato proceduralmente per ogni classe.
 * Il colore primario cambia con la rarità.
 * Supporta animazioni CSS.
 */
// Sprite personalizzati per utenti specifici
function getCustomSprite(name: string | undefined, color: string, dark: string, light: string, rarity: Rarity): React.ReactNode | null {
  if (!name) return null;
  const lower = name.toLowerCase();

  if (lower === 'shydanrem') {
    return (
      <g>
        {/* Maglietta verde */}
        <rect x="22" y="28" width="20" height="18" rx="2" fill="#2e7d32" />
        {/* Gilet marrone scuro */}
        <path d="M22 28 L26 28 L26 46 L22 46 Z" fill="#3e2723" />
        <path d="M38 28 L42 28 L42 46 L38 46 Z" fill="#3e2723" />
        <path d="M26 28 L28 28 L28 34 L26 34 Z" fill="#4e342e" />
        <path d="M36 28 L38 28 L38 34 L36 34 Z" fill="#4e342e" />
        {/* Colletto gilet */}
        <path d="M26 28 L29 32 L26 32 Z" fill="#4e342e" />
        <path d="M38 28 L35 32 L38 32 Z" fill="#4e342e" />
        {/* Testa pelata */}
        <circle cx="32" cy="18" r="10" fill="#ffd5b4" />
        {/* Cranio liscio - riflesso luce */}
        <ellipse cx="30" cy="13" rx="5" ry="3" fill="#ffe0c0" opacity="0.4" />
        {/* Sopracciglia */}
        <rect x="26" y="16" width="4" height="1.2" rx="0.5" fill="#5d4037" />
        <rect x="34" y="16" width="4" height="1.2" rx="0.5" fill="#5d4037" />
        {/* Occhi */}
        <circle cx="29" cy="19" r="1.5" fill={color}>
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="35" cy="19" r="1.5" fill={color}>
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
        </circle>
        {/* Barba */}
        <path d="M26 22 Q26 28 32 30 Q38 28 38 22" fill="#5d4037" />
        <path d="M27 23 Q27 27 32 29 Q37 27 37 23" fill="#6d4c41" />
        {/* Baffi */}
        <path d="M28 22 Q32 24 36 22" fill="none" stroke="#5d4037" strokeWidth="1.2" />
        {/* Braccia */}
        <rect x="14" y="30" width="8" height="4" rx="2" fill="#ffd5b4" />
        <rect x="42" y="30" width="8" height="4" rx="2" fill="#ffd5b4" />
        {/* Spade — lame colorate per rarità */}
        <rect x="9" y="12" width="3" height="22" rx="0.5" fill={light} transform="rotate(-12 10 23)" />
        <rect x="9" y="12" width="3" height="22" rx="0.5" fill={color} opacity="0.4" transform="rotate(-12 10 23)" />
        <polygon points="10.5,10 8,6 13,6" fill={light} transform="rotate(-12 10 8)" />
        <rect x="52" y="12" width="3" height="22" rx="0.5" fill={light} transform="rotate(12 53 23)" />
        <rect x="52" y="12" width="3" height="22" rx="0.5" fill={color} opacity="0.4" transform="rotate(12 53 23)" />
        <polygon points="53.5,10 51,6 56,6" fill={light} transform="rotate(12 53 8)" />
        {/* Guardia spade */}
        <rect x="7" y="33" width="7" height="3" rx="1" fill={dark} transform="rotate(-12 10 34)" />
        <rect x="50" y="33" width="7" height="3" rx="1" fill={dark} transform="rotate(12 53 34)" />
        {/* Impugnatura */}
        <rect x="9" y="35" width="3" height="6" rx="1" fill="#333" transform="rotate(-12 10 38)" />
        <rect x="52" y="35" width="3" height="6" rx="1" fill="#333" transform="rotate(12 53 38)" />
        {/* Glow spade per epico+ */}
        {(['epico', 'leggendario', 'mitico', 'master'] as const).includes(rarity as any) && (
          <>
            <rect x="9" y="12" width="3" height="22" rx="0.5" fill={color} opacity="0.3" transform="rotate(-12 10 23)">
              <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="52" y="12" width="3" height="22" rx="0.5" fill={color} opacity="0.3" transform="rotate(12 53 23)">
              <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite" />
            </rect>
          </>
        )}
        {/* Pantaloni marroni chiari */}
        <rect x="24" y="46" width="7" height="12" rx="2" fill="#a1887f" />
        <rect x="33" y="46" width="7" height="12" rx="2" fill="#a1887f" />
        {/* Cintura */}
        <rect x="22" y="44" width="20" height="3" rx="1" fill="#4e342e" />
        <rect x="30" y="44" width="4" height="3" rx="1" fill="#8d6e63" />
        {/* Stivali */}
        <rect x="23" y="56" width="9" height="4" rx="2" fill="#3e2723" />
        <rect x="32" y="56" width="9" height="4" rx="2" fill="#3e2723" />
      </g>
    );
  }

  return null;
}

export function HeroSprite({ heroClass, rarity, size = 64, animate = 'idle', flip = false, name }: HeroSpriteProps) {
  const color = RARITY_COLORS[rarity] || '#9e9e9e';
  const darkColor = darken(color, 30);
  const lightColor = lighten(color, 30);
  const skinColor = '#ffd5b4';
  const animClass = `sprite-${animate}`;

  // Check per sprite personalizzato
  const customSprite = getCustomSprite(name, color, darkColor, lightColor, rarity);

  return (
    <div
      className={`hero-sprite ${animClass}`}
      style={{
        width: size,
        height: size,
        transform: flip ? 'scaleX(-1)' : undefined,
        position: 'relative',
      }}
      title={name}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        {/* Aura di rarità per epico+ */}
        {(['epico', 'leggendario', 'mitico', 'master'] as Rarity[]).includes(rarity) && (
          <circle cx="32" cy="36" r="28" fill="none" stroke={color} strokeWidth="1" opacity="0.3">
            <animate attributeName="r" values="26;30;26" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
          </circle>
        )}

        {customSprite || getClassBody(heroClass, color, darkColor, lightColor, skinColor)}
      </svg>
    </div>
  );
}

function getClassBody(heroClass: HeroClass, color: string, dark: string, light: string, skin: string): React.ReactNode {
  switch (heroClass) {
    case 'guardiano':
      return (
        <g>
          {/* Corpo corazzato */}
          <rect x="22" y="26" width="20" height="22" rx="3" fill={color} />
          {/* Testa */}
          <circle cx="32" cy="20" r="10" fill={skin} />
          {/* Elmo */}
          <path d="M22 20 Q22 10 32 8 Q42 10 42 20" fill={dark} />
          <rect x="24" y="17" width="16" height="3" rx="1" fill={light} opacity="0.5" />
          {/* Visiera */}
          <rect x="26" y="20" width="12" height="2" rx="1" fill={dark} />
          {/* Scudo (braccio sinistro) */}
          <rect x="12" y="28" width="12" height="16" rx="3" fill={dark} />
          <rect x="14" y="30" width="8" height="12" rx="2" fill={color} />
          <line x1="18" y1="31" x2="18" y2="41" stroke={light} strokeWidth="2" />
          {/* Spada (braccio destro) */}
          <rect x="42" y="24" width="4" height="20" rx="1" fill="#888" />
          <rect x="40" y="23" width="8" height="3" rx="1" fill={dark} />
          {/* Gambe */}
          <rect x="24" y="48" width="7" height="12" rx="2" fill={dark} />
          <rect x="33" y="48" width="7" height="12" rx="2" fill={dark} />
          {/* Piedi */}
          <rect x="22" y="57" width="10" height="4" rx="2" fill="#555" />
          <rect x="32" y="57" width="10" height="4" rx="2" fill="#555" />
        </g>
      );

    case 'lama':
      return (
        <g>
          {/* Corpo */}
          <rect x="24" y="28" width="16" height="20" rx="2" fill={color} />
          {/* Testa */}
          <circle cx="32" cy="20" r="9" fill={skin} />
          {/* Capelli */}
          <path d="M23 18 Q24 10 32 9 Q40 10 41 18" fill="#333" />
          {/* Occhi determinati */}
          <rect x="27" y="19" width="3" height="2" rx="1" fill="#333" />
          <rect x="34" y="19" width="3" height="2" rx="1" fill="#333" />
          {/* Cintura */}
          <rect x="23" y="38" width="18" height="3" rx="1" fill={dark} />
          {/* Spada grande (dx) */}
          <rect x="43" y="14" width="3" height="30" rx="1" fill="#ccc" />
          <rect x="41" y="42" width="7" height="4" rx="1" fill={dark} />
          <polygon points="44.5,14 42,8 47,8" fill="#eee" />
          {/* Braccio sx */}
          <rect x="16" y="30" width="8" height="4" rx="2" fill={skin} />
          {/* Gambe */}
          <rect x="25" y="48" width="6" height="12" rx="2" fill="#444" />
          <rect x="33" y="48" width="6" height="12" rx="2" fill="#444" />
          <rect x="24" y="57" width="8" height="4" rx="2" fill="#333" />
          <rect x="32" y="57" width="8" height="4" rx="2" fill="#333" />
        </g>
      );

    case 'arcano':
      return (
        <g>
          {/* Tunica */}
          <path d="M24 28 L20 58 L44 58 L40 28 Z" fill={color} />
          {/* Testa */}
          <circle cx="32" cy="20" r="9" fill={skin} />
          {/* Cappello mago */}
          <polygon points="32,2 22,22 42,22" fill={dark} />
          <ellipse cx="32" cy="22" rx="12" ry="3" fill={dark} />
          <circle cx="32" cy="8" r="2" fill={light} />
          {/* Occhi */}
          <circle cx="29" cy="20" r="1.5" fill={light} />
          <circle cx="35" cy="20" r="1.5" fill={light} />
          {/* Bastone (dx) */}
          <rect x="44" y="12" width="3" height="46" rx="1" fill="#8B4513" />
          <circle cx="45.5" cy="12" r="5" fill={light} opacity="0.7">
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* Mano sx con magia */}
          <circle cx="18" cy="36" r="4" fill={light} opacity="0.5">
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Piedi */}
          <rect x="24" y="56" width="7" height="4" rx="2" fill={dark} />
          <rect x="33" y="56" width="7" height="4" rx="2" fill={dark} />
        </g>
      );

    case 'custode':
      return (
        <g>
          {/* Tunica bianca/dorata */}
          <path d="M24 28 L22 56 L42 56 L40 28 Z" fill="#f5f5f5" />
          <path d="M26 30 L24 54 L40 54 L38 30 Z" fill={light} opacity="0.3" />
          {/* Testa */}
          <circle cx="32" cy="20" r="9" fill={skin} />
          {/* Aureola */}
          <ellipse cx="32" cy="10" rx="8" ry="2" fill={color} opacity="0.6">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
          </ellipse>
          {/* Capelli */}
          <path d="M23 18 Q25 12 32 11 Q39 12 41 18" fill="#f0d080" />
          {/* Occhi gentili */}
          <ellipse cx="29" cy="20" rx="1.5" ry="1" fill="#4a90d9" />
          <ellipse cx="35" cy="20" rx="1.5" ry="1" fill="#4a90d9" />
          {/* Sorriso */}
          <path d="M29 24 Q32 26 35 24" fill="none" stroke="#c0a080" strokeWidth="0.8" />
          {/* Bastone curativo */}
          <rect x="44" y="16" width="3" height="40" rx="1" fill="#daa520" />
          <circle cx="45.5" cy="14" r="4" fill={color}>
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />
          </circle>
          {/* Piedi */}
          <rect x="25" y="54" width="6" height="4" rx="2" fill="#daa520" />
          <rect x="33" y="54" width="6" height="4" rx="2" fill="#daa520" />
        </g>
      );

    case 'ombra':
      return (
        <g>
          {/* Mantello scuro */}
          <path d="M22 26 L18 58 L46 58 L42 26 Z" fill="#1a1a2e" />
          <path d="M26 28 L24 56 L40 56 L38 28 Z" fill="#16213e" />
          {/* Testa */}
          <circle cx="32" cy="20" r="9" fill={skin} />
          {/* Cappuccio */}
          <path d="M21 22 Q22 10 32 8 Q42 10 43 22" fill="#1a1a2e" />
          {/* Occhi luminosi */}
          <circle cx="29" cy="19" r="1.5" fill={color}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="35" cy="19" r="1.5" fill={color}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite" />
          </circle>
          {/* Pugnali */}
          <rect x="14" y="32" width="2" height="14" rx="0.5" fill="#ccc" transform="rotate(-15 15 39)" />
          <rect x="48" y="32" width="2" height="14" rx="0.5" fill="#ccc" transform="rotate(15 49 39)" />
          {/* Piedi (quasi invisibili) */}
          <rect x="26" y="56" width="5" height="3" rx="1" fill="#111" />
          <rect x="33" y="56" width="5" height="3" rx="1" fill="#111" />
        </g>
      );

    case 'ranger':
      return (
        <g>
          {/* Corpo */}
          <rect x="25" y="28" width="14" height="18" rx="2" fill="#2d5016" />
          {/* Testa */}
          <circle cx="32" cy="20" r="9" fill={skin} />
          {/* Cappello ranger */}
          <ellipse cx="32" cy="14" rx="12" ry="4" fill="#5d4037" />
          <ellipse cx="32" cy="13" rx="8" ry="5" fill="#6d4c41" />
          {/* Occhi */}
          <circle cx="29" cy="20" r="1.2" fill="#2e7d32" />
          <circle cx="35" cy="20" r="1.2" fill="#2e7d32" />
          {/* Arco (grande, dietro) */}
          <path d="M46 16 Q54 32 46 48" fill="none" stroke="#8B4513" strokeWidth="2.5" />
          <line x1="46" y1="16" x2="46" y2="48" stroke={color} strokeWidth="0.8" />
          {/* Faretra */}
          <rect x="38" y="24" width="4" height="16" rx="1" fill="#5d4037" />
          <line x1="39" y1="24" x2="39" y2="20" stroke="#ccc" strokeWidth="0.8" />
          <line x1="41" y1="24" x2="41" y2="21" stroke="#ccc" strokeWidth="0.8" />
          {/* Gambe */}
          <rect x="26" y="46" width="5" height="12" rx="2" fill="#3e2723" />
          <rect x="33" y="46" width="5" height="12" rx="2" fill="#3e2723" />
          <rect x="25" y="55" width="7" height="4" rx="2" fill="#4e342e" />
          <rect x="32" y="55" width="7" height="4" rx="2" fill="#4e342e" />
        </g>
      );

    case 'sciamano':
      return (
        <g>
          {/* Vesti tribali */}
          <path d="M24 28 L20 56 L44 56 L40 28 Z" fill="#4a148c" />
          <path d="M28 34 L30 48 L34 48 L36 34 Z" fill={color} opacity="0.4" />
          {/* Testa */}
          <circle cx="32" cy="20" r="9" fill={skin} />
          {/* Maschera/trucco tribale */}
          <line x1="26" y1="18" x2="30" y2="20" stroke={color} strokeWidth="1.5" />
          <line x1="38" y1="18" x2="34" y2="20" stroke={color} strokeWidth="1.5" />
          <circle cx="32" cy="24" r="1" fill={color} />
          {/* Copricapo con piume */}
          <path d="M24 14 L32 6 L40 14" fill="none" stroke="#4a148c" strokeWidth="2" />
          <ellipse cx="28" cy="9" rx="1.5" ry="5" fill={color} transform="rotate(-15 28 9)" />
          <ellipse cx="36" cy="9" rx="1.5" ry="5" fill={light} transform="rotate(15 36 9)" />
          <ellipse cx="32" cy="7" rx="1.5" ry="6" fill={dark} />
          {/* Totem/bastone */}
          <rect x="12" y="22" width="3" height="36" rx="1" fill="#5d4037" />
          <circle cx="13.5" cy="22" r="3.5" fill={color}>
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
          </circle>
          {/* Piedi */}
          <rect x="25" y="54" width="6" height="4" rx="2" fill="#3e2723" />
          <rect x="33" y="54" width="6" height="4" rx="2" fill="#3e2723" />
        </g>
      );

    case 'crono':
      return (
        <g>
          {/* Veste da viaggiatore temporale */}
          <path d="M24 28 L22 56 L42 56 L40 28 Z" fill="#0d47a1" />
          <path d="M28 30 L26 54 L38 54 L36 30 Z" fill={color} opacity="0.2" />
          {/* Testa */}
          <circle cx="32" cy="20" r="9" fill={skin} />
          {/* Capelli bianchi/argentei */}
          <path d="M23 18 Q25 10 32 9 Q39 10 41 18" fill="#e0e0e0" />
          {/* Occhi con bagliore temporale */}
          <circle cx="29" cy="20" r="1.5" fill={color}>
            <animate attributeName="fill" values={`${color};${light};${color}`} dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="35" cy="20" r="1.5" fill={color}>
            <animate attributeName="fill" values={`${color};${light};${color}`} dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Orologio al collo */}
          <circle cx="32" cy="32" r="4" fill="#0d47a1" stroke={color} strokeWidth="1" />
          <line x1="32" y1="32" x2="32" y2="29" stroke={color} strokeWidth="0.8">
            <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="4s" repeatCount="indefinite" />
          </line>
          <line x1="32" y1="32" x2="34" y2="32" stroke={light} strokeWidth="0.5">
            <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="12s" repeatCount="indefinite" />
          </line>
          {/* Particelle temporali */}
          <circle cx="18" cy="30" r="1.5" fill={color} opacity="0.5">
            <animate attributeName="cy" values="30;24;30" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="46" cy="36" r="1" fill={light} opacity="0.4">
            <animate attributeName="cy" values="36;42;36" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite" />
          </circle>
          {/* Piedi */}
          <rect x="25" y="54" width="6" height="4" rx="2" fill="#0d47a1" />
          <rect x="33" y="54" width="6" height="4" rx="2" fill="#0d47a1" />
        </g>
      );

    default:
      return (
        <g>
          <circle cx="32" cy="32" r="16" fill={color} />
          <text x="32" y="36" textAnchor="middle" fill="white" fontSize="12">?</text>
        </g>
      );
  }
}

// ============ MONSTER SPRITE ============

interface MonsterSpriteProps {
  name: string;
  emoji: string;
  tier: string;
  size?: number;
  animate?: string;
}

export function MonsterSprite({ name, emoji, tier, size = 56, animate = 'idle' }: MonsterSpriteProps) {
  const tierColors: Record<string, string> = {
    minion: '#666',
    elite: '#9c27b0',
    boss: '#f44336',
  };
  const tierColor = tierColors[tier] || '#666';

  // Strip emoji prefix dal nome (es. "🟣 Slime Oscuro" -> "Slime Oscuro")
  const cleanName = name.replace(/^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\uFE0F\u200D]+\s*/u, '').trim() || name;

  return (
    <div className={`monster-sprite sprite-${animate}`} style={{ width: size, height: size, position: 'relative' }} title={name}>
      <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        {/* Aura boss */}
        {tier === 'boss' && (
          <circle cx="32" cy="32" r="28" fill="none" stroke="#f44336" strokeWidth="1.5" opacity="0.4">
            <animate attributeName="r" values="26;30;26" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
        {/* Glow elite */}
        {tier === 'elite' && (
          <circle cx="32" cy="32" r="26" fill="none" stroke="#9c27b0" strokeWidth="1" opacity="0.25">
            <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2.5s" repeatCount="indefinite" />
          </circle>
        )}
        {getMonsterBody(cleanName, tierColor)}
      </svg>
    </div>
  );
}

function getMonsterBody(name: string, tierColor: string): React.ReactNode {
  switch (name) {
    // ====== MINIONS ======

    case 'Slime Oscuro':
      return (
        <g>
          {/* Corpo slime - blob pulsante */}
          <ellipse cx="32" cy="44" rx="20" ry="6" fill="#1a0a2e" opacity="0.3" />
          <path d="M16 40 Q14 28 22 22 Q28 18 32 16 Q36 18 42 22 Q50 28 48 40 Q46 50 32 50 Q18 50 16 40Z" fill="#4a1a6b">
            <animate attributeName="d" values="M16 40 Q14 28 22 22 Q28 18 32 16 Q36 18 42 22 Q50 28 48 40 Q46 50 32 50 Q18 50 16 40Z;M17 39 Q15 27 23 21 Q28 17 32 15 Q36 17 41 21 Q49 27 47 39 Q45 51 32 51 Q19 51 17 39Z;M16 40 Q14 28 22 22 Q28 18 32 16 Q36 18 42 22 Q50 28 48 40 Q46 50 32 50 Q18 50 16 40Z" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M20 38 Q18 30 26 26 Q30 23 32 22 Q34 23 38 26 Q46 30 44 38 Q42 46 32 46 Q22 46 20 38Z" fill="#6b2fa0" />
          {/* Riflesso luce */}
          <ellipse cx="26" cy="28" rx="4" ry="3" fill="#9c4dcc" opacity="0.5" />
          {/* Occhi maligni */}
          <ellipse cx="26" cy="34" rx="3" ry="2.5" fill="#ff0" />
          <ellipse cx="38" cy="34" rx="3" ry="2.5" fill="#ff0" />
          <ellipse cx="27" cy="34" rx="1.5" ry="2" fill="#220033" />
          <ellipse cx="39" cy="34" rx="1.5" ry="2" fill="#220033" />
          {/* Bocca */}
          <path d="M28 40 Q32 43 36 40" fill="none" stroke="#220033" strokeWidth="1.2" />
          {/* Gocce slime */}
          <ellipse cx="18" cy="42" rx="2" ry="3" fill="#4a1a6b" opacity="0.6">
            <animate attributeName="cy" values="42;46;42" dur="1.8s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="46" cy="40" rx="1.5" ry="2.5" fill="#4a1a6b" opacity="0.5">
            <animate attributeName="cy" values="40;44;40" dur="2.2s" repeatCount="indefinite" />
          </ellipse>
        </g>
      );

    case 'Goblin':
      return (
        <g>
          {/* Corpo */}
          <rect x="24" y="30" width="16" height="16" rx="3" fill="#5a3e1b" />
          {/* Testa grande */}
          <ellipse cx="32" cy="22" rx="12" ry="10" fill="#4a7a2e" />
          {/* Orecchie a punta */}
          <polygon points="18,18 12,10 22,16" fill="#4a7a2e" />
          <polygon points="46,18 52,10 42,16" fill="#4a7a2e" />
          <polygon points="19,17 14,11 22,15" fill="#3d6624" />
          <polygon points="45,17 50,11 42,15" fill="#3d6624" />
          {/* Occhi */}
          <circle cx="27" cy="20" r="3" fill="#ff0" />
          <circle cx="37" cy="20" r="3" fill="#ff0" />
          <circle cx="28" cy="20" r="1.5" fill="#111" />
          <circle cx="38" cy="20" r="1.5" fill="#111" />
          {/* Naso grande */}
          <ellipse cx="32" cy="24" rx="2.5" ry="2" fill="#3d6624" />
          {/* Ghigno con denti */}
          <path d="M26 28 L38 28" fill="none" stroke="#111" strokeWidth="1" />
          <polygon points="28,27 29,30 30,27" fill="#fff" />
          <polygon points="34,27 35,30 36,27" fill="#fff" />
          {/* Pugnale (mano dx) */}
          <rect x="42" y="32" width="2" height="12" rx="0.5" fill="#bbb" />
          <rect x="40" y="43" width="6" height="3" rx="1" fill="#5a3e1b" />
          {/* Braccio sx */}
          <rect x="14" y="33" width="10" height="4" rx="2" fill="#4a7a2e" />
          {/* Gambe corte */}
          <rect x="25" y="46" width="5" height="10" rx="2" fill="#3d6624" />
          <rect x="34" y="46" width="5" height="10" rx="2" fill="#3d6624" />
          <rect x="24" y="54" width="7" height="4" rx="2" fill="#3a2a10" />
          <rect x="33" y="54" width="7" height="4" rx="2" fill="#3a2a10" />
        </g>
      );

    case 'Pipistrello Vampiro':
      return (
        <g>
          {/* Ali */}
          <path d="M32 28 L8 14 L14 26 L6 20 L16 30 L10 28 L22 34Z" fill="#2d1b3d">
            <animate attributeName="d" values="M32 28 L8 14 L14 26 L6 20 L16 30 L10 28 L22 34Z;M32 28 L10 18 L15 28 L8 24 L17 32 L12 30 L22 34Z;M32 28 L8 14 L14 26 L6 20 L16 30 L10 28 L22 34Z" dur="0.8s" repeatCount="indefinite" />
          </path>
          <path d="M32 28 L56 14 L50 26 L58 20 L48 30 L54 28 L42 34Z" fill="#2d1b3d">
            <animate attributeName="d" values="M32 28 L56 14 L50 26 L58 20 L48 30 L54 28 L42 34Z;M32 28 L54 18 L49 28 L56 24 L47 32 L52 30 L42 34Z;M32 28 L56 14 L50 26 L58 20 L48 30 L54 28 L42 34Z" dur="0.8s" repeatCount="indefinite" />
          </path>
          {/* Corpo */}
          <ellipse cx="32" cy="36" rx="10" ry="12" fill="#3d1f54" />
          {/* Testa */}
          <circle cx="32" cy="26" r="8" fill="#4a2768" />
          {/* Orecchie */}
          <polygon points="24,22 20,12 28,20" fill="#4a2768" />
          <polygon points="40,22 44,12 36,20" fill="#4a2768" />
          {/* Occhi rossi */}
          <circle cx="28" cy="25" r="2.5" fill="#ff1744" />
          <circle cx="36" cy="25" r="2.5" fill="#ff1744" />
          <circle cx="29" cy="25" r="1" fill="#fff" />
          <circle cx="37" cy="25" r="1" fill="#fff" />
          {/* Zanne */}
          <polygon points="29,31 30,36 31,31" fill="#fff" />
          <polygon points="33,31 34,36 35,31" fill="#fff" />
          {/* Zampe */}
          <path d="M26 46 L24 52 L26 52 L28 48" fill="#3d1f54" />
          <path d="M36 46 L34 52 L36 52 L38 48" fill="#3d1f54" />
        </g>
      );

    case 'Scheletro':
      return (
        <g>
          {/* Corpo / costole */}
          <rect x="26" y="28" width="12" height="18" rx="2" fill="#e8e0d0" />
          <line x1="27" y1="32" x2="37" y2="32" stroke="#bbb" strokeWidth="1" />
          <line x1="27" y1="36" x2="37" y2="36" stroke="#bbb" strokeWidth="1" />
          <line x1="27" y1="40" x2="37" y2="40" stroke="#bbb" strokeWidth="1" />
          <line x1="32" y1="28" x2="32" y2="46" stroke="#bbb" strokeWidth="1" />
          {/* Testa teschio */}
          <circle cx="32" cy="20" r="10" fill="#f0e8d8" />
          <circle cx="32" cy="20" r="9" fill="#e8e0d0" />
          {/* Orbite occhi */}
          <ellipse cx="28" cy="19" rx="3" ry="3.5" fill="#1a1a1a" />
          <ellipse cx="36" cy="19" rx="3" ry="3.5" fill="#1a1a1a" />
          <circle cx="28" cy="19" r="1" fill="#ff3333" opacity="0.7">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="36" cy="19" r="1" fill="#ff3333" opacity="0.7">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Naso */}
          <polygon points="32,22 31,24 33,24" fill="#c8b8a0" />
          {/* Denti */}
          <rect x="28" y="26" width="8" height="2" rx="0.5" fill="#f0e8d8" />
          <line x1="30" y1="26" x2="30" y2="28" stroke="#bbb" strokeWidth="0.5" />
          <line x1="32" y1="26" x2="32" y2="28" stroke="#bbb" strokeWidth="0.5" />
          <line x1="34" y1="26" x2="34" y2="28" stroke="#bbb" strokeWidth="0.5" />
          {/* Arco */}
          <path d="M46 18 Q54 30 46 44" fill="none" stroke="#8B4513" strokeWidth="2" />
          <line x1="46" y1="18" x2="46" y2="44" stroke="#aaa" strokeWidth="0.7" />
          {/* Freccia incoccata */}
          <line x1="38" y1="31" x2="46" y2="31" stroke="#8B4513" strokeWidth="1" />
          <polygon points="38,31 40,29 40,33" fill="#888" />
          {/* Braccio sx */}
          <rect x="14" y="32" width="12" height="3" rx="1" fill="#e8e0d0" />
          {/* Gambe ossa */}
          <rect x="27" y="46" width="4" height="12" rx="1" fill="#e8e0d0" />
          <rect x="33" y="46" width="4" height="12" rx="1" fill="#e8e0d0" />
          <rect x="26" y="56" width="6" height="3" rx="1" fill="#d8d0c0" />
          <rect x="32" y="56" width="6" height="3" rx="1" fill="#d8d0c0" />
        </g>
      );

    case 'Fuocofatuo':
      return (
        <g>
          {/* Bagliore esterno */}
          <circle cx="32" cy="30" r="18" fill="#ff9800" opacity="0.1">
            <animate attributeName="r" values="16;20;16" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.05;0.15;0.05" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* Fiamma esterna */}
          <path d="M22 38 Q18 24 26 16 Q30 10 32 6 Q34 10 38 16 Q46 24 42 38 Q40 46 32 46 Q24 46 22 38Z" fill="#ff6f00" opacity="0.6">
            <animate attributeName="d" values="M22 38 Q18 24 26 16 Q30 10 32 6 Q34 10 38 16 Q46 24 42 38 Q40 46 32 46 Q24 46 22 38Z;M23 37 Q20 22 27 14 Q30 8 32 4 Q34 8 37 14 Q44 22 41 37 Q39 47 32 47 Q25 47 23 37Z;M22 38 Q18 24 26 16 Q30 10 32 6 Q34 10 38 16 Q46 24 42 38 Q40 46 32 46 Q24 46 22 38Z" dur="0.6s" repeatCount="indefinite" />
          </path>
          {/* Fiamma interna */}
          <path d="M26 38 Q24 28 30 22 Q32 18 32 14 Q32 18 34 22 Q40 28 38 38 Q36 44 32 44 Q28 44 26 38Z" fill="#ffb300">
            <animate attributeName="d" values="M26 38 Q24 28 30 22 Q32 18 32 14 Q32 18 34 22 Q40 28 38 38 Q36 44 32 44 Q28 44 26 38Z;M27 37 Q25 26 30 20 Q32 16 32 12 Q32 16 34 20 Q39 26 37 37 Q35 45 32 45 Q29 45 27 37Z;M26 38 Q24 28 30 22 Q32 18 32 14 Q32 18 34 22 Q40 28 38 38 Q36 44 32 44 Q28 44 26 38Z" dur="0.5s" repeatCount="indefinite" />
          </path>
          {/* Nucleo brillante */}
          <ellipse cx="32" cy="32" rx="6" ry="8" fill="#fff9c4" opacity="0.8">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="0.7s" repeatCount="indefinite" />
          </ellipse>
          {/* Occhi spettrali */}
          <ellipse cx="28" cy="30" rx="2" ry="2.5" fill="#1a237e" />
          <ellipse cx="36" cy="30" rx="2" ry="2.5" fill="#1a237e" />
          {/* Coda fiamma */}
          <path d="M28 46 Q26 52 24 56" fill="none" stroke="#ff6f00" strokeWidth="1.5" opacity="0.4">
            <animate attributeName="d" values="M28 46 Q26 52 24 56;M28 46 Q24 52 22 56;M28 46 Q26 52 24 56" dur="0.8s" repeatCount="indefinite" />
          </path>
          <path d="M36 46 Q38 52 40 56" fill="none" stroke="#ff6f00" strokeWidth="1.5" opacity="0.4">
            <animate attributeName="d" values="M36 46 Q38 52 40 56;M36 46 Q40 52 42 56;M36 46 Q38 52 40 56" dur="0.9s" repeatCount="indefinite" />
          </path>
        </g>
      );

    case 'Ratto Gigante':
      return (
        <g>
          {/* Ombra */}
          <ellipse cx="32" cy="56" rx="16" ry="3" fill="#000" opacity="0.15" />
          {/* Coda */}
          <path d="M14 42 Q6 36 4 28 Q3 24 6 22" fill="none" stroke="#c9a0a0" strokeWidth="2" strokeLinecap="round" />
          {/* Corpo */}
          <ellipse cx="32" cy="42" rx="16" ry="12" fill="#6d4c41" />
          <ellipse cx="32" cy="42" rx="14" ry="10" fill="#7b5b4e" />
          {/* Testa */}
          <ellipse cx="42" cy="34" rx="10" ry="9" fill="#6d4c41" />
          {/* Muso appuntito */}
          <ellipse cx="52" cy="36" rx="4" ry="3" fill="#8d6e63" />
          <circle cx="55" cy="35" r="1.5" fill="#ffb0b0" />
          {/* Orecchie */}
          <ellipse cx="38" cy="26" rx="4" ry="5" fill="#8d6e63" />
          <ellipse cx="38" cy="26" rx="2.5" ry="3.5" fill="#d4a0a0" />
          <ellipse cx="46" cy="26" rx="4" ry="5" fill="#8d6e63" />
          <ellipse cx="46" cy="26" rx="2.5" ry="3.5" fill="#d4a0a0" />
          {/* Occhi */}
          <circle cx="44" cy="32" r="2.5" fill="#ff1744" />
          <circle cx="44" cy="32" r="1" fill="#fff" />
          {/* Baffi */}
          <line x1="50" y1="34" x2="58" y2="32" stroke="#aaa" strokeWidth="0.5" />
          <line x1="50" y1="36" x2="58" y2="36" stroke="#aaa" strokeWidth="0.5" />
          <line x1="50" y1="38" x2="58" y2="40" stroke="#aaa" strokeWidth="0.5" />
          {/* Denti */}
          <polygon points="50,38 51,42 52,38" fill="#fff" />
          {/* Zampe */}
          <ellipse cx="22" cy="52" rx="4" ry="3" fill="#5d4037" />
          <ellipse cx="30" cy="53" rx="4" ry="3" fill="#5d4037" />
          <ellipse cx="38" cy="53" rx="4" ry="3" fill="#5d4037" />
        </g>
      );

    // ====== ELITE ======

    case 'Orco Guerriero':
      return (
        <g>
          {/* Corpo massiccio */}
          <rect x="20" y="26" width="24" height="24" rx="4" fill="#5a3a2a" />
          <rect x="22" y="28" width="20" height="10" rx="2" fill="#4a6e2e" />
          {/* Testa */}
          <circle cx="32" cy="18" r="11" fill="#4a6e2e" />
          {/* Mascella grande */}
          <path d="M22 22 Q32 32 42 22" fill="#3d5c24" />
          {/* Occhi feroci */}
          <rect x="25" y="15" width="5" height="3" rx="1" fill="#ff0" />
          <rect x="34" y="15" width="5" height="3" rx="1" fill="#ff0" />
          <rect x="26" y="15" width="3" height="3" rx="1" fill="#111" />
          <rect x="35" y="15" width="3" height="3" rx="1" fill="#111" />
          {/* Sopracciglia furiose */}
          <line x1="24" y1="13" x2="30" y2="14" stroke="#333" strokeWidth="1.5" />
          <line x1="40" y1="13" x2="34" y2="14" stroke="#333" strokeWidth="1.5" />
          {/* Zanne */}
          <polygon points="26,24 27,28 28,24" fill="#fff" />
          <polygon points="36,24 37,28 38,24" fill="#fff" />
          {/* Ascia (mano dx) */}
          <rect x="46" y="16" width="3" height="32" rx="1" fill="#5d4037" />
          <path d="M44 16 Q42 10 47.5 8 Q53 10 51 16Z" fill="#888" />
          <path d="M44 16 Q42 10 47.5 8" fill="none" stroke="#aaa" strokeWidth="0.5" />
          {/* Braccio sx */}
          <rect x="10" y="28" width="10" height="6" rx="3" fill="#4a6e2e" />
          <circle cx="10" cy="31" r="3" fill="#3d5c24" />
          {/* Gambe */}
          <rect x="22" y="50" width="8" height="10" rx="3" fill="#3d5c24" />
          <rect x="34" y="50" width="8" height="10" rx="3" fill="#3d5c24" />
          <rect x="21" y="57" width="10" height="4" rx="2" fill="#333" />
          <rect x="33" y="57" width="10" height="4" rx="2" fill="#333" />
        </g>
      );

    case 'Mago Oscuro':
      return (
        <g>
          {/* Tunica scura */}
          <path d="M24 30 L18 58 L46 58 L40 30 Z" fill="#1a0033" />
          <path d="M26 32 L22 56 L42 56 L38 32 Z" fill="#2d004d" />
          {/* Testa */}
          <circle cx="32" cy="22" r="9" fill="#c4a882" />
          {/* Cappuccio */}
          <path d="M21 24 Q20 12 32 6 Q44 12 43 24" fill="#1a0033" />
          <path d="M23 24 Q22 14 32 8 Q42 14 41 24" fill="#2d004d" />
          {/* Occhi viola brillanti */}
          <circle cx="28" cy="22" r="2" fill="#e040fb">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="36" cy="22" r="2" fill="#e040fb">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* Bastone */}
          <rect x="46" y="14" width="2.5" height="44" rx="1" fill="#333" />
          <circle cx="47.25" cy="14" r="4" fill="#7b1fa2">
            <animate attributeName="r" values="3.5;4.5;3.5" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="47.25" cy="14" r="2" fill="#e040fb" opacity="0.6">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Energia oscura mano sx */}
          <circle cx="16" cy="38" r="5" fill="#7b1fa2" opacity="0.4">
            <animate attributeName="r" values="4;6;4" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="16" cy="38" r="2.5" fill="#e040fb" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.8s" repeatCount="indefinite" />
          </circle>
          {/* Piedi */}
          <rect x="24" y="56" width="7" height="4" rx="2" fill="#1a0033" />
          <rect x="33" y="56" width="7" height="4" rx="2" fill="#1a0033" />
        </g>
      );

    case 'Cavaliere Nero':
      return (
        <g>
          {/* Corpo armatura pesante */}
          <rect x="20" y="26" width="24" height="24" rx="3" fill="#1a1a2e" />
          <rect x="22" y="28" width="20" height="20" rx="2" fill="#2d2d44" />
          {/* Dettagli armatura */}
          <line x1="32" y1="28" x2="32" y2="48" stroke="#444" strokeWidth="1" />
          <line x1="22" y1="38" x2="42" y2="38" stroke="#444" strokeWidth="1" />
          {/* Testa con elmo */}
          <circle cx="32" cy="18" r="10" fill="#1a1a2e" />
          <rect x="22" y="8" width="20" height="14" rx="3" fill="#2d2d44" />
          {/* Visiera con fessura */}
          <rect x="24" y="16" width="16" height="4" rx="1" fill="#111" />
          <rect x="26" y="17" width="12" height="2" rx="0.5" fill="#ff1744" opacity="0.6">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
          </rect>
          {/* Cresta elmo */}
          <path d="M28 8 Q32 2 36 8" fill="#444" />
          {/* Spallacci */}
          <rect x="14" y="26" width="8" height="8" rx="2" fill="#2d2d44" />
          <rect x="42" y="26" width="8" height="8" rx="2" fill="#2d2d44" />
          {/* Spada grande */}
          <rect x="48" y="14" width="3" height="34" rx="1" fill="#666" />
          <rect x="46" y="46" width="7" height="4" rx="1" fill="#333" />
          <polygon points="49.5,14 47,8 52,8" fill="#888" />
          {/* Scudo sx */}
          <rect x="8" y="30" width="8" height="12" rx="2" fill="#2d2d44" />
          <line x1="12" y1="31" x2="12" y2="41" stroke="#ff1744" strokeWidth="1.5" opacity="0.5" />
          {/* Gambe */}
          <rect x="22" y="50" width="8" height="10" rx="2" fill="#1a1a2e" />
          <rect x="34" y="50" width="8" height="10" rx="2" fill="#1a1a2e" />
          <rect x="21" y="57" width="10" height="4" rx="2" fill="#111" />
          <rect x="33" y="57" width="10" height="4" rx="2" fill="#111" />
        </g>
      );

    case 'Strega':
      return (
        <g>
          {/* Veste */}
          <path d="M24 30 L20 56 L44 56 L40 30 Z" fill="#1b5e20" />
          <path d="M26 32 L22 54 L42 54 L38 32 Z" fill="#2e7d32" />
          {/* Testa */}
          <circle cx="32" cy="22" r="9" fill="#a8e6a0" />
          {/* Cappello da strega */}
          <polygon points="32,0 20,24 44,24" fill="#1a1a1a" />
          <ellipse cx="32" cy="24" rx="14" ry="3" fill="#1a1a1a" />
          {/* Fibbia cappello */}
          <rect x="29" y="18" width="6" height="4" rx="1" fill="#9c27b0" />
          {/* Occhi */}
          <circle cx="28" cy="22" r="2" fill="#76ff03" />
          <circle cx="36" cy="22" r="2" fill="#76ff03" />
          <circle cx="28" cy="22" r="1" fill="#111" />
          <circle cx="36" cy="22" r="1" fill="#111" />
          {/* Naso */}
          <path d="M32 24 L30 27 L34 27 Z" fill="#8bc380" />
          {/* Sorriso sinistro */}
          <path d="M28 28 Q32 31 36 28" fill="none" stroke="#111" strokeWidth="0.8" />
          {/* Calderone bagliore (in basso a sx) */}
          <ellipse cx="14" cy="50" rx="7" ry="5" fill="#333" />
          <ellipse cx="14" cy="48" rx="6" ry="3" fill="#76ff03" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.5s" repeatCount="indefinite" />
          </ellipse>
          {/* Mano dx con pozione */}
          <circle cx="44" cy="36" r="3" fill="#76ff03" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Piedi */}
          <rect x="24" y="54" width="7" height="4" rx="2" fill="#111" />
          <rect x="33" y="54" width="7" height="4" rx="2" fill="#111" />
        </g>
      );

    case 'Assassino Ombra':
      return (
        <g>
          {/* Effetto ombra */}
          <ellipse cx="32" cy="56" rx="14" ry="4" fill="#000" opacity="0.3">
            <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2s" repeatCount="indefinite" />
          </ellipse>
          {/* Mantello fumoso */}
          <path d="M22 26 L16 56 L48 56 L42 26 Z" fill="#0a0a14" opacity="0.9" />
          <path d="M24 28 L20 54 L44 54 L40 28 Z" fill="#12121f" />
          {/* Particelle ombra */}
          <circle cx="18" cy="48" r="2" fill="#222" opacity="0.4">
            <animate attributeName="cy" values="48;44;48" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="46" cy="46" r="1.5" fill="#222" opacity="0.3">
            <animate attributeName="cy" values="46;42;46" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2.5s" repeatCount="indefinite" />
          </circle>
          {/* Testa */}
          <circle cx="32" cy="20" r="9" fill="#1a1a2e" />
          {/* Cappuccio */}
          <path d="M21 22 Q22 10 32 6 Q42 10 43 22" fill="#0a0a14" />
          {/* Occhi viola luminosi */}
          <circle cx="28" cy="20" r="1.5" fill="#ce93d8">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="36" cy="20" r="1.5" fill="#ce93d8">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" />
          </circle>
          {/* Maschera */}
          <rect x="24" y="22" width="16" height="3" rx="1" fill="#0a0a14" />
          {/* Pugnale sx */}
          <rect x="10" y="30" width="2" height="16" rx="0.5" fill="#ccc" transform="rotate(-20 11 38)" />
          <rect x="9" y="45" width="4" height="3" rx="1" fill="#333" transform="rotate(-20 11 46)" />
          {/* Pugnale dx */}
          <rect x="52" y="30" width="2" height="16" rx="0.5" fill="#ccc" transform="rotate(20 53 38)" />
          <rect x="51" y="45" width="4" height="3" rx="1" fill="#333" transform="rotate(20 53 46)" />
          {/* Piedi ombra */}
          <rect x="26" y="54" width="5" height="3" rx="1" fill="#050510" />
          <rect x="33" y="54" width="5" height="3" rx="1" fill="#050510" />
        </g>
      );

    // ====== BOSSES ======

    case 'Drago Antico':
      return (
        <g>
          {/* Corpo grande */}
          <ellipse cx="30" cy="40" rx="18" ry="14" fill="#b71c1c" />
          <ellipse cx="30" cy="40" rx="16" ry="12" fill="#c62828" />
          {/* Pancia */}
          <ellipse cx="30" cy="44" rx="10" ry="8" fill="#ef9a9a" opacity="0.3" />
          {/* Collo e testa */}
          <path d="M36 30 Q40 20 44 14 Q46 12 48 14" fill="#b71c1c" />
          <ellipse cx="48" cy="12" rx="8" ry="6" fill="#c62828" />
          {/* Corna */}
          <path d="M44 8 L40 2 L42 8" fill="#5d4037" />
          <path d="M52 8 L56 2 L54 8" fill="#5d4037" />
          {/* Occhio */}
          <circle cx="50" cy="11" r="2.5" fill="#ff0" />
          <circle cx="51" cy="11" r="1" fill="#111" />
          {/* Bocca / fuoco */}
          <path d="M54 14 L60 12 L58 16 Z" fill="#c62828" />
          <path d="M56 13 L62 11 L60 15" fill="#ff6f00" opacity="0.7">
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="0.5s" repeatCount="indefinite" />
          </path>
          {/* Ali */}
          <path d="M24 32 L6 10 L12 22 L4 14 L14 26 L8 20 L20 30Z" fill="#8b1a1a" />
          <path d="M24 32 L6 10" fill="none" stroke="#6d1414" strokeWidth="0.5" />
          {/* Zampe */}
          <path d="M18 50 L14 56 L16 56 L18 54 L20 56 L22 56 L20 50" fill="#8b1a1a" />
          <path d="M34 50 L30 56 L32 56 L34 54 L36 56 L38 56 L36 50" fill="#8b1a1a" />
          {/* Coda */}
          <path d="M12 42 Q4 44 2 40 Q0 36 4 34" fill="none" stroke="#b71c1c" strokeWidth="3" strokeLinecap="round" />
          <polygon points="4,34 0,30 6,32" fill="#8b1a1a" />
          {/* Scaglie */}
          <circle cx="24" cy="36" r="1.5" fill="#8b1a1a" />
          <circle cx="28" cy="34" r="1.5" fill="#8b1a1a" />
          <circle cx="32" cy="36" r="1.5" fill="#8b1a1a" />
          <circle cx="36" cy="38" r="1.5" fill="#8b1a1a" />
        </g>
      );

    case 'Lich Re':
      return (
        <g>
          {/* Veste regale */}
          <path d="M24 30 L18 58 L46 58 L40 30 Z" fill="#1a0033" />
          <path d="M26 32 L20 56 L44 56 L38 32 Z" fill="#2d004d" />
          {/* Bordo dorato */}
          <line x1="20" y1="56" x2="44" y2="56" stroke="#ffd700" strokeWidth="1.5" />
          {/* Testa teschio */}
          <circle cx="32" cy="20" r="10" fill="#e8e0d0" />
          <circle cx="32" cy="20" r="9" fill="#d4c8b0" />
          {/* Corona */}
          <path d="M22 14 L22 8 L26 12 L29 6 L32 12 L35 6 L38 12 L42 8 L42 14 Z" fill="#ffd700" />
          <circle cx="32" cy="8" r="1.5" fill="#e040fb" />
          <circle cx="26" cy="10" r="1" fill="#ff1744" />
          <circle cx="38" cy="10" r="1" fill="#ff1744" />
          {/* Orbite con fuoco magico */}
          <ellipse cx="28" cy="19" rx="3" ry="3.5" fill="#111" />
          <ellipse cx="36" cy="19" rx="3" ry="3.5" fill="#111" />
          <circle cx="28" cy="19" r="1.5" fill="#e040fb">
            <animate attributeName="r" values="1;2;1" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="36" cy="19" r="1.5" fill="#e040fb">
            <animate attributeName="r" values="1;2;1" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* Naso */}
          <polygon points="32,22 31,24 33,24" fill="#c8b8a0" />
          {/* Denti */}
          <rect x="28" y="26" width="8" height="2" rx="0.5" fill="#d4c8b0" />
          {/* Bastone necromante */}
          <rect x="46" y="10" width="2.5" height="48" rx="1" fill="#4a148c" />
          <circle cx="47.25" cy="10" r="4.5" fill="#e040fb" opacity="0.5">
            <animate attributeName="r" values="4;5.5;4" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="47.25" cy="10" r="2" fill="#fff" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Mano scheletrica sx */}
          <path d="M16 38 L12 36 L10 38 L12 40 L14 38 L12 42" fill="none" stroke="#d4c8b0" strokeWidth="1" />
          {/* Piedi */}
          <rect x="24" y="56" width="7" height="4" rx="2" fill="#1a0033" />
          <rect x="33" y="56" width="7" height="4" rx="2" fill="#1a0033" />
        </g>
      );

    case 'Golem di Ferro':
      return (
        <g>
          {/* Corpo massiccio */}
          <rect x="18" y="24" width="28" height="28" rx="4" fill="#546e7a" />
          <rect x="20" y="26" width="24" height="24" rx="3" fill="#78909c" />
          {/* Piastra torace */}
          <rect x="24" y="28" width="16" height="12" rx="2" fill="#607d8b" />
          <line x1="32" y1="28" x2="32" y2="40" stroke="#90a4ae" strokeWidth="1" />
          <line x1="24" y1="34" x2="40" y2="34" stroke="#90a4ae" strokeWidth="1" />
          {/* Bulloni */}
          <circle cx="26" cy="30" r="1.5" fill="#455a64" />
          <circle cx="38" cy="30" r="1.5" fill="#455a64" />
          <circle cx="26" cy="38" r="1.5" fill="#455a64" />
          <circle cx="38" cy="38" r="1.5" fill="#455a64" />
          {/* Testa */}
          <rect x="24" y="10" width="16" height="14" rx="3" fill="#78909c" />
          <rect x="22" y="8" width="20" height="12" rx="3" fill="#546e7a" />
          {/* Occhi */}
          <rect x="26" y="12" width="4" height="3" rx="1" fill="#ff6f00">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="34" y="12" width="4" height="3" rx="1" fill="#ff6f00">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </rect>
          {/* Bocca griglia */}
          <rect x="28" y="17" width="8" height="3" rx="1" fill="#455a64" />
          <line x1="30" y1="17" x2="30" y2="20" stroke="#546e7a" strokeWidth="0.8" />
          <line x1="32" y1="17" x2="32" y2="20" stroke="#546e7a" strokeWidth="0.8" />
          <line x1="34" y1="17" x2="34" y2="20" stroke="#546e7a" strokeWidth="0.8" />
          {/* Braccia massicce */}
          <rect x="6" y="26" width="12" height="8" rx="3" fill="#607d8b" />
          <rect x="4" y="32" width="8" height="10" rx="3" fill="#78909c" />
          <rect x="46" y="26" width="12" height="8" rx="3" fill="#607d8b" />
          <rect x="50" y="32" width="8" height="10" rx="3" fill="#78909c" />
          {/* Pugni */}
          <rect x="4" y="40" width="8" height="6" rx="2" fill="#546e7a" />
          <rect x="52" y="40" width="8" height="6" rx="2" fill="#546e7a" />
          {/* Gambe */}
          <rect x="20" y="52" width="10" height="10" rx="3" fill="#607d8b" />
          <rect x="34" y="52" width="10" height="10" rx="3" fill="#607d8b" />
          <rect x="19" y="58" width="12" height="4" rx="2" fill="#455a64" />
          <rect x="33" y="58" width="12" height="4" rx="2" fill="#455a64" />
        </g>
      );

    case 'Fantasma Supremo':
      return (
        <g>
          {/* Alone spettrale */}
          <ellipse cx="32" cy="32" rx="24" ry="22" fill="#b3e5fc" opacity="0.08">
            <animate attributeName="opacity" values="0.04;0.12;0.04" dur="3s" repeatCount="indefinite" />
          </ellipse>
          {/* Corpo fantasma fluttuante */}
          <path d="M18 28 Q16 16 32 10 Q48 16 46 28 L46 44 Q44 50 40 48 Q36 46 34 50 Q32 52 30 50 Q28 46 24 48 Q20 50 18 44 Z" fill="#e1f5fe" opacity="0.7">
            <animate attributeName="d" values="M18 28 Q16 16 32 10 Q48 16 46 28 L46 44 Q44 50 40 48 Q36 46 34 50 Q32 52 30 50 Q28 46 24 48 Q20 50 18 44 Z;M18 26 Q16 14 32 8 Q48 14 46 26 L46 42 Q44 48 40 46 Q36 44 34 48 Q32 50 30 48 Q28 44 24 46 Q20 48 18 42 Z;M18 28 Q16 16 32 10 Q48 16 46 28 L46 44 Q44 50 40 48 Q36 46 34 50 Q32 52 30 50 Q28 46 24 48 Q20 50 18 44 Z" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M22 28 Q20 18 32 14 Q44 18 42 28 L42 42 Q40 46 38 44 Q36 42 34 46 Q32 48 30 46 Q28 42 26 44 Q24 46 22 42 Z" fill="#fff" opacity="0.5">
            <animate attributeName="d" values="M22 28 Q20 18 32 14 Q44 18 42 28 L42 42 Q40 46 38 44 Q36 42 34 46 Q32 48 30 46 Q28 42 26 44 Q24 46 22 42 Z;M22 26 Q20 16 32 12 Q44 16 42 26 L42 40 Q40 44 38 42 Q36 40 34 44 Q32 46 30 44 Q28 40 26 42 Q24 44 22 40 Z;M22 28 Q20 18 32 14 Q44 18 42 28 L42 42 Q40 46 38 44 Q36 42 34 46 Q32 48 30 46 Q28 42 26 44 Q24 46 22 42 Z" dur="3s" repeatCount="indefinite" />
          </path>
          {/* Occhi spettrali */}
          <ellipse cx="26" cy="26" rx="4" ry="5" fill="#0d47a1" opacity="0.8" />
          <ellipse cx="38" cy="26" rx="4" ry="5" fill="#0d47a1" opacity="0.8" />
          <circle cx="26" cy="26" r="1.5" fill="#e1f5fe">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="38" cy="26" r="1.5" fill="#e1f5fe">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Bocca urlante */}
          <ellipse cx="32" cy="34" rx="4" ry="5" fill="#0d47a1" opacity="0.6" />
          {/* Braccia spettrali */}
          <path d="M18 30 Q10 26 8 32 Q6 38 12 36" fill="none" stroke="#e1f5fe" strokeWidth="2" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2.5s" repeatCount="indefinite" />
          </path>
          <path d="M46 30 Q54 26 56 32 Q58 38 52 36" fill="none" stroke="#e1f5fe" strokeWidth="2" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2.5s" repeatCount="indefinite" />
          </path>
          {/* Particelle eteree */}
          <circle cx="20" cy="20" r="1" fill="#fff" opacity="0.3">
            <animate attributeName="cy" values="20;14;20" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="44" cy="18" r="1.5" fill="#fff" opacity="0.2">
            <animate attributeName="cy" values="18;12;18" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3.5s" repeatCount="indefinite" />
          </circle>
        </g>
      );

    case 'Signore del Tempo':
      return (
        <g>
          {/* Veste temporale */}
          <path d="M24 30 L20 58 L44 58 L40 30 Z" fill="#0d47a1" />
          <path d="M26 32 L22 56 L42 56 L38 32 Z" fill="#1565c0" />
          {/* Rune temporali sulla veste */}
          <circle cx="28" cy="44" r="2" fill="none" stroke="#ffd700" strokeWidth="0.5" opacity="0.5" />
          <circle cx="36" cy="48" r="2" fill="none" stroke="#ffd700" strokeWidth="0.5" opacity="0.5" />
          {/* Testa */}
          <circle cx="32" cy="20" r="9" fill="#b0bec5" />
          {/* Capelli argentei */}
          <path d="M23 18 Q25 10 32 8 Q39 10 41 18" fill="#cfd8dc" />
          {/* Occhi con bagliore dorato */}
          <circle cx="28" cy="20" r="2" fill="#ffd700">
            <animate attributeName="fill" values="#ffd700;#fff;#ffd700" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="36" cy="20" r="2" fill="#ffd700">
            <animate attributeName="fill" values="#ffd700;#fff;#ffd700" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="28" cy="20" r="0.8" fill="#111" />
          <circle cx="36" cy="20" r="0.8" fill="#111" />
          {/* Grande orologio sul petto */}
          <circle cx="32" cy="38" r="6" fill="#0d47a1" stroke="#ffd700" strokeWidth="1.5" />
          <circle cx="32" cy="38" r="5" fill="#1a237e" />
          {/* Numeri romani stilizzati */}
          <text x="32" y="34" textAnchor="middle" fill="#ffd700" fontSize="3" fontFamily="serif">XII</text>
          <text x="32" y="44" textAnchor="middle" fill="#ffd700" fontSize="3" fontFamily="serif">VI</text>
          <text x="27.5" y="39.5" textAnchor="middle" fill="#ffd700" fontSize="3" fontFamily="serif">IX</text>
          <text x="36.5" y="39.5" textAnchor="middle" fill="#ffd700" fontSize="3" fontFamily="serif">III</text>
          {/* Lancette rotanti */}
          <line x1="32" y1="38" x2="32" y2="34" stroke="#ffd700" strokeWidth="0.8">
            <animateTransform attributeName="transform" type="rotate" from="0 32 38" to="360 32 38" dur="4s" repeatCount="indefinite" />
          </line>
          <line x1="32" y1="38" x2="35" y2="38" stroke="#fff" strokeWidth="0.5">
            <animateTransform attributeName="transform" type="rotate" from="0 32 38" to="360 32 38" dur="12s" repeatCount="indefinite" />
          </line>
          {/* Bastone con clessidra */}
          <rect x="46" y="12" width="2.5" height="46" rx="1" fill="#5d4037" />
          {/* Clessidra in cima */}
          <polygon points="47.25,8 44,4 50.5,4" fill="#ffd700" />
          <polygon points="47.25,16 44,20 50.5,20" fill="#ffd700" />
          <rect x="45.75" y="8" width="3" height="8" rx="0" fill="none" stroke="#ffd700" strokeWidth="0.8" />
          <line x1="47.25" y1="10" x2="47.25" y2="14" stroke="#64b5f6" strokeWidth="1">
            <animate attributeName="y1" values="10;14;10" dur="4s" repeatCount="indefinite" />
          </line>
          {/* Particelle temporali */}
          <circle cx="16" cy="28" r="1.5" fill="#ffd700" opacity="0.4">
            <animate attributeName="cy" values="28;22;28" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="10" cy="40" r="1" fill="#64b5f6" opacity="0.3">
            <animate attributeName="cy" values="40;34;40" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="52" cy="34" r="1" fill="#ffd700" opacity="0.3">
            <animate attributeName="cy" values="34;28;34" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3.5s" repeatCount="indefinite" />
          </circle>
          {/* Piedi */}
          <rect x="25" y="56" width="6" height="4" rx="2" fill="#0d47a1" />
          <rect x="33" y="56" width="6" height="4" rx="2" fill="#0d47a1" />
        </g>
      );

    // ====== ZONE BOSSES ======

    case 'Treant Antico':
      return (
        <g>
          {/* Tronco */}
          <rect x="24" y="24" width="16" height="30" rx="4" fill="#5d4037" />
          <rect x="20" y="28" width="24" height="22" rx="6" fill="#4e342e" />
          {/* Corteccia */}
          <line x1="28" y1="28" x2="28" y2="50" stroke="#3e2723" strokeWidth="1.5" opacity="0.5" />
          <line x1="36" y1="30" x2="36" y2="48" stroke="#3e2723" strokeWidth="1" opacity="0.4" />
          {/* Chioma */}
          <circle cx="32" cy="18" r="14" fill="#2e7d32" />
          <circle cx="24" cy="22" r="10" fill="#388e3c" />
          <circle cx="40" cy="22" r="10" fill="#388e3c" />
          <circle cx="32" cy="12" r="10" fill="#43a047" />
          {/* Occhi nella corteccia */}
          <ellipse cx="28" cy="36" rx="2.5" ry="2" fill="#ff9800">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="36" cy="36" rx="2.5" ry="2" fill="#ff9800">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
          </ellipse>
          {/* Bocca */}
          <path d="M28 42 Q32 45 36 42" fill="none" stroke="#1b5e20" strokeWidth="1.5" />
          {/* Rami braccia */}
          <path d="M20 32 L10 24 L8 20" fill="none" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
          <path d="M44 32 L54 24 L56 20" fill="none" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
          {/* Foglioline sui rami */}
          <circle cx="8" cy="19" r="3" fill="#66bb6a" />
          <circle cx="56" cy="19" r="3" fill="#66bb6a" />
          {/* Radici */}
          <path d="M24 54 Q20 58 16 60" fill="none" stroke="#4e342e" strokeWidth="2" />
          <path d="M40 54 Q44 58 48 60" fill="none" stroke="#4e342e" strokeWidth="2" />
        </g>
      );

    case 'Signore della Guerra':
      return (
        <g>
          {/* Corpo massiccio */}
          <rect x="20" y="26" width="24" height="24" rx="4" fill="#b71c1c" />
          <rect x="22" y="28" width="20" height="20" rx="3" fill="#c62828" />
          {/* Testa */}
          <circle cx="32" cy="18" r="11" fill="#ffab91" />
          {/* Elmo con corna */}
          <path d="M21 18 Q22 8 32 6 Q42 8 43 18" fill="#424242" />
          <path d="M22 14 L16 4" stroke="#616161" strokeWidth="3" strokeLinecap="round" />
          <path d="M42 14 L48 4" stroke="#616161" strokeWidth="3" strokeLinecap="round" />
          {/* Occhi feroci */}
          <rect x="26" y="17" width="4" height="2.5" rx="1" fill="#b71c1c" />
          <rect x="34" y="17" width="4" height="2.5" rx="1" fill="#b71c1c" />
          {/* Cicatrice */}
          <line x1="28" y1="14" x2="34" y2="22" stroke="#8d6e63" strokeWidth="0.8" />
          {/* Ascia enorme (dx) */}
          <rect x="46" y="16" width="3" height="32" rx="1" fill="#5d4037" />
          <path d="M43 16 Q48 12 53 16 L53 26 Q48 30 43 26 Z" fill="#78909c" />
          <path d="M44 18 Q48 15 52 18" fill="none" stroke="#b0bec5" strokeWidth="0.8" />
          {/* Scudo (sx) */}
          <rect x="8" y="28" width="12" height="18" rx="3" fill="#37474f" />
          <line x1="14" y1="30" x2="14" y2="44" stroke="#b71c1c" strokeWidth="2" />
          {/* Gambe */}
          <rect x="22" y="50" width="8" height="10" rx="2" fill="#424242" />
          <rect x="34" y="50" width="8" height="10" rx="2" fill="#424242" />
        </g>
      );

    case 'Wyrm di Cristallo':
      return (
        <g>
          {/* Corpo serpentino */}
          <path d="M18 44 Q12 36 18 28 Q24 20 32 16 Q40 20 46 28 Q52 36 46 44 Q40 50 32 52 Q24 50 18 44Z" fill="#64b5f6" />
          <path d="M22 42 Q16 36 22 30 Q28 24 32 20 Q36 24 42 30 Q48 36 42 42 Q38 48 32 48 Q26 48 22 42Z" fill="#90caf9" />
          {/* Cristalli sul dorso */}
          <polygon points="28,18 26,10 30,14" fill="#e1f5fe" opacity="0.8" />
          <polygon points="34,16 32,8 36,12" fill="#bbdefb" opacity="0.9" />
          <polygon points="40,20 38,12 42,16" fill="#e1f5fe" opacity="0.7" />
          {/* Occhi */}
          <circle cx="26" cy="32" r="3" fill="white" />
          <circle cx="38" cy="32" r="3" fill="white" />
          <circle cx="27" cy="32" r="1.5" fill="#1565c0" />
          <circle cx="39" cy="32" r="1.5" fill="#1565c0" />
          {/* Bocca */}
          <path d="M28 38 Q32 42 36 38" fill="none" stroke="#1565c0" strokeWidth="1" />
          {/* Brillio cristalli */}
          <circle cx="30" cy="12" r="2" fill="#e3f2fd" opacity="0.6">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Coda */}
          <path d="M32 52 Q28 56 22 58 Q18 58 16 56" fill="none" stroke="#64b5f6" strokeWidth="3" strokeLinecap="round" />
        </g>
      );

    case 'Idra Velenosa':
      return (
        <g>
          {/* Corpo */}
          <ellipse cx="32" cy="44" rx="16" ry="12" fill="#2e7d32" />
          <ellipse cx="32" cy="44" rx="12" ry="8" fill="#388e3c" />
          {/* 3 teste/colli */}
          <path d="M24 38 Q20 28 18 20" fill="none" stroke="#2e7d32" strokeWidth="5" strokeLinecap="round" />
          <path d="M32 36 Q32 26 32 16" fill="none" stroke="#2e7d32" strokeWidth="5" strokeLinecap="round" />
          <path d="M40 38 Q44 28 46 20" fill="none" stroke="#2e7d32" strokeWidth="5" strokeLinecap="round" />
          {/* Teste */}
          <circle cx="18" cy="18" r="5" fill="#388e3c" />
          <circle cx="32" cy="14" r="6" fill="#388e3c" />
          <circle cx="46" cy="18" r="5" fill="#388e3c" />
          {/* Occhi (6) */}
          <circle cx="16" cy="17" r="1.5" fill="#ff0" /><circle cx="20" cy="17" r="1.5" fill="#ff0" />
          <circle cx="30" cy="13" r="1.5" fill="#ff0" /><circle cx="34" cy="13" r="1.5" fill="#ff0" />
          <circle cx="44" cy="17" r="1.5" fill="#ff0" /><circle cx="48" cy="17" r="1.5" fill="#ff0" />
          {/* Gocce veleno */}
          <circle cx="18" cy="24" r="1.5" fill="#76ff03" opacity="0.7">
            <animate attributeName="cy" values="24;28;24" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="32" cy="22" r="1.5" fill="#76ff03" opacity="0.7">
            <animate attributeName="cy" values="22;26;22" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="46" cy="24" r="1.5" fill="#76ff03" opacity="0.7">
            <animate attributeName="cy" values="24;28;24" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      );

    case 'Ifrit':
      return (
        <g>
          {/* Corpo infuocato */}
          <path d="M20 48 Q16 36 22 28 Q28 22 32 18 Q36 22 42 28 Q48 36 44 48 Z" fill="#e65100" />
          <path d="M24 46 Q20 38 26 32 Q30 26 32 22 Q34 26 38 32 Q44 38 40 46 Z" fill="#ff6d00" />
          {/* Fiamme sulla testa */}
          <path d="M26 22 Q24 12 28 8 Q30 14 32 18" fill="#ffab00" opacity="0.8">
            <animate attributeName="d" values="M26 22 Q24 12 28 8 Q30 14 32 18;M26 22 Q22 10 26 6 Q30 12 32 18;M26 22 Q24 12 28 8 Q30 14 32 18" dur="0.8s" repeatCount="indefinite" />
          </path>
          <path d="M32 18 Q34 8 36 4 Q38 10 38 22" fill="#ffd600" opacity="0.7">
            <animate attributeName="d" values="M32 18 Q34 8 36 4 Q38 10 38 22;M32 18 Q36 6 38 2 Q40 8 38 22;M32 18 Q34 8 36 4 Q38 10 38 22" dur="1s" repeatCount="indefinite" />
          </path>
          {/* Occhi */}
          <circle cx="28" cy="32" r="3" fill="#fff" />
          <circle cx="36" cy="32" r="3" fill="#fff" />
          <circle cx="28" cy="32" r="1.5" fill="#b71c1c" />
          <circle cx="36" cy="32" r="1.5" fill="#b71c1c" />
          {/* Bocca con fuoco */}
          <path d="M27 40 Q32 44 37 40" fill="#ffab00" />
          {/* Braccia infuocate */}
          <path d="M20 34 L10 30 L8 26" fill="none" stroke="#e65100" strokeWidth="4" strokeLinecap="round" />
          <path d="M44 34 L54 30 L56 26" fill="none" stroke="#e65100" strokeWidth="4" strokeLinecap="round" />
          <circle cx="8" cy="25" r="3" fill="#ff6d00" opacity="0.6">
            <animate attributeName="r" values="2;4;2" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="56" cy="25" r="3" fill="#ff6d00" opacity="0.6">
            <animate attributeName="r" values="2;4;2" dur="1.4s" repeatCount="indefinite" />
          </circle>
        </g>
      );

    case 'Re del Vuoto':
      return (
        <g>
          {/* Aura void */}
          <circle cx="32" cy="32" r="24" fill="none" stroke="#7c4dff" strokeWidth="1" opacity="0.3">
            <animate attributeName="r" values="22;26;22" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Corpo etereo */}
          <path d="M20 48 Q16 34 24 24 Q28 18 32 14 Q36 18 40 24 Q48 34 44 48 Q38 56 32 56 Q26 56 20 48Z" fill="#311b92" opacity="0.9" />
          <path d="M24 46 Q20 36 28 28 Q30 22 32 18 Q34 22 36 28 Q44 36 40 46 Q36 52 32 52 Q28 52 24 46Z" fill="#4527a0" />
          {/* Corona */}
          <polygon points="24,20 26,10 28,18 30,8 32,18 34,8 36,18 38,10 40,20" fill="#ffd600" />
          <rect x="24" y="19" width="16" height="3" rx="1" fill="#ffab00" />
          {/* Gemma corona */}
          <circle cx="32" cy="20" r="2" fill="#e040fb">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* Occhi void */}
          <circle cx="28" cy="32" r="3" fill="#e040fb">
            <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="36" cy="32" r="3" fill="#e040fb">
            <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Particelle void */}
          <circle cx="14" cy="28" r="1.5" fill="#7c4dff" opacity="0.5">
            <animate attributeName="cy" values="28;22;28" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="34" r="1" fill="#b388ff" opacity="0.4">
            <animate attributeName="cy" values="34;40;34" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="20" cy="48" r="1" fill="#7c4dff" opacity="0.3">
            <animate attributeName="cx" values="20;16;20" dur="4s" repeatCount="indefinite" />
          </circle>
          {/* Mani eteree */}
          <path d="M20 36 L12 40 L10 44" fill="none" stroke="#4527a0" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <path d="M44 36 L52 40 L54 44" fill="none" stroke="#4527a0" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </g>
      );

    // ====== FALLBACK ======
    default:
      return (
        <g>
          {/* Corpo mostro generico */}
          <ellipse cx="32" cy="38" rx="18" ry="16" fill={tierColor} />
          <ellipse cx="32" cy="38" rx="14" ry="12" fill={lighten(tierColor, 15)} />
          {/* Occhi */}
          <circle cx="26" cy="34" r="4" fill="white" />
          <circle cx="38" cy="34" r="4" fill="white" />
          <circle cx="27" cy="34" r="2" fill="#f44336" />
          <circle cx="39" cy="34" r="2" fill="#f44336" />
          {/* Bocca */}
          <path d="M26 42 Q32 48 38 42" fill="none" stroke="#222" strokeWidth="1.5" />
        </g>
      );
  }
}

// ============ UTILITIES ============

function darken(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.floor(255 * percent / 100));
  const g = Math.max(0, ((num >> 8) & 0xFF) - Math.floor(255 * percent / 100));
  const b = Math.max(0, (num & 0xFF) - Math.floor(255 * percent / 100));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.floor(255 * percent / 100));
  const g = Math.min(255, ((num >> 8) & 0xFF) + Math.floor(255 * percent / 100));
  const b = Math.min(255, (num & 0xFF) + Math.floor(255 * percent / 100));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}
