import React from 'react';
import { HeroClass, Rarity, RARITY_COLORS } from '../types';

interface HeroSpriteProps {
  heroClass: HeroClass;
  rarity: Rarity;
  size?: number;
  animate?: 'idle' | 'attack' | 'hurt' | 'cast' | 'dead' | 'none';
  flip?: boolean; // specchia per i nemici
  name?: string;
  hasBlessing?: boolean;
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
      <g filter="url(#shadow)">
        {/* === MANTELLO DIETRO === */}
        <g className="part-cape">
          <path
            d="M22 26 Q17 30 16 38 Q15 46 19 54 Q22 49 23 43 Q24 36 24 30 Z"
            fill={dark}
          />
          <path
            d="M42 26 Q47 30 48 38 Q49 46 45 54 Q42 49 41 43 Q40 36 40 30 Z"
            fill={dark}
          />
          {/* Bordo mantello colore rarità */}
          <path d="M19 54 Q22 49 23 43 L24 43 Q23 50 21 55 Z" fill={color} />
          <path d="M45 54 Q42 49 41 43 L40 43 Q41 50 43 55 Z" fill={color} />
        </g>

        <g className="part-body">
          {/* === GAMBE === */}
          <rect x="25" y="46" width="6" height="11" rx="2" fill="#3e2723" />
          <rect x="33" y="46" width="6" height="11" rx="2" fill="#3e2723" />
          {/* Placche metalliche ginocchia */}
          <rect x="24.5" y="49" width="7" height="2.2" rx="1" fill="url(#metal-grad)" />
          <rect x="32.5" y="49" width="7" height="2.2" rx="1" fill="url(#metal-grad)" />
          {/* Stivali con trim colore rarità */}
          <rect x="24" y="55" width="8" height="5" rx="2" fill="#1a0e0c" />
          <rect x="32" y="55" width="8" height="5" rx="2" fill="#1a0e0c" />
          <rect x="24" y="55" width="8" height="1" fill={color} />
          <rect x="32" y="55" width="8" height="1" fill={color} />

          {/* === TORSO === */}
          {/* Sotto-tunica scura */}
          <rect x="24" y="26" width="16" height="18" rx="2" fill="#1b5e20" />
          {/* Corazza pettorale */}
          <path d="M25 27 L32 25 L39 27 L38 39 L32 41 L26 39 Z" fill="#2e7d32" />
          {/* Linea centrale corazza */}
          <line x1="32" y1="26" x2="32" y2="40" stroke="#1a0e0c" strokeWidth="0.6" />
          {/* Gemma pulsante */}
          <circle cx="32" cy="30" r="1.5" fill={color}>
            <animate attributeName="opacity" values="1;0.55;1" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="32" cy="30" r="0.6" fill={light} />

          {/* Spallacci appuntiti */}
          <ellipse cx="22.5" cy="27" rx="4" ry="2.8" fill="url(#metal-grad)" />
          <ellipse cx="41.5" cy="27" rx="4" ry="2.8" fill="url(#metal-grad)" />
          <path d="M19 27 L21 23 L23 27 Z" fill={color} />
          <path d="M41 27 L43 23 L45 27 Z" fill={color} />

          {/* Cintura + fibbia */}
          <rect x="23" y="43" width="18" height="3" rx="1" fill="#3e2723" />
          <rect x="30" y="42.5" width="4" height="4" rx="0.5" fill="url(#metal-grad)" />
          <circle cx="32" cy="44.5" r="1" fill={color} />
        </g>

        <g className="part-head">
          <circle cx="32" cy="18" r="8" fill="#ffd5b4" />
          <ellipse cx="30" cy="13" rx="4" ry="2.5" fill="#ffe8d0" opacity="0.4" />
          {/* Capigliatura scura */}
          <path d="M24 14 Q24 9 32 8 Q40 9 40 14 L40 17 L24 17 Z" fill="#1a0e0c" />
          {/* Bandana colore rarità */}
          <rect x="24" y="14.4" width="16" height="1.8" fill={color} />
          <rect x="24" y="14.4" width="16" height="0.4" fill={light} />
          {/* Occhi che pulsano */}
          <circle cx="29.3" cy="18.8" r="1.3" fill="url(#eye-glow)">
            <animate attributeName="r" values="1.1;1.4;1.1" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="35.3" cy="18.8" r="1.3" fill="url(#eye-glow)">
            <animate attributeName="r" values="1.1;1.4;1.1" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Barba scolpita */}
          <path d="M26.5 22 Q26 26 29 28 Q31 29 32 29 Q33 29 35 28 Q38 26 37.5 22 L36 22 Q36 24 33 25 Q31 25 28 24 Z" fill="#3e2723" />
          <path d="M27 23 Q27 25 29.5 26.5 Q31 27 32 27 Q33 27 34.5 26.5 Q37 25 37 23" fill="#6d4c41" />
        </g>

        {/* === BRACCIO SINISTRO + SPADA === */}
        <g className="part-arm-l">
          {/* Spallaccio anteriore */}
          <rect x="20" y="27" width="5" height="6" rx="2" fill="#2e7d32" />
          {/* Avambraccio con bracciale */}
          <rect x="15" y="29" width="7" height="4" rx="2" fill="#ffd5b4" />
          <rect x="15" y="29" width="7" height="1.3" fill="url(#metal-grad)" />

          {/* Spada: tip in alto-sx, V iconica */}
          <g transform="rotate(-30 17 32)">
            {/* Pommel + gemma */}
            <circle cx="17" cy="38" r="1.7" fill="url(#metal-grad)" />
            <circle cx="17" cy="38" r="0.9" fill={color} />
            {/* Impugnatura avvolta */}
            <rect x="16" y="32" width="2" height="6" rx="0.4" fill="#3e2723" />
            <line x1="16.2" y1="33.5" x2="17.8" y2="33.5" stroke="#1a0e0c" strokeWidth="0.4" />
            <line x1="16.2" y1="35.5" x2="17.8" y2="35.5" stroke="#1a0e0c" strokeWidth="0.4" />
            {/* Crossguard appuntito */}
            <path d="M11 32 L13 30 L21 30 L23 32 L21 33 L13 33 Z" fill="url(#metal-grad)" />
            <path d="M11 32 L13 30 L13.5 32 Z" fill={dark} />
            <path d="M23 32 L21 30 L20.5 32 Z" fill={dark} />
            {/* Lama lunga */}
            <path d="M15 30 L17 7 L19 30 Z" fill="url(#metal-grad)" />
            {/* Fuller centrale */}
            <line x1="17" y1="10" x2="17" y2="29" stroke="#5a5a5a" strokeWidth="0.4" />
            {/* Edge highlight */}
            <line x1="15.3" y1="29" x2="17" y2="9" stroke={light} strokeWidth="0.3" opacity="0.85" />
            {/* Punta che brilla */}
            <circle cx="17" cy="8" r="0.7" fill={color}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>

        {/* === BRACCIO DESTRO + SPADA === */}
        <g className="part-arm-r">
          <rect x="39" y="27" width="5" height="6" rx="2" fill="#2e7d32" />
          <rect x="42" y="29" width="7" height="4" rx="2" fill="#ffd5b4" />
          <rect x="42" y="29" width="7" height="1.3" fill="url(#metal-grad)" />

          <g transform="rotate(30 47 32)">
            <circle cx="47" cy="38" r="1.7" fill="url(#metal-grad)" />
            <circle cx="47" cy="38" r="0.9" fill={color} />
            <rect x="46" y="32" width="2" height="6" rx="0.4" fill="#3e2723" />
            <line x1="46.2" y1="33.5" x2="47.8" y2="33.5" stroke="#1a0e0c" strokeWidth="0.4" />
            <line x1="46.2" y1="35.5" x2="47.8" y2="35.5" stroke="#1a0e0c" strokeWidth="0.4" />
            <path d="M41 32 L43 30 L51 30 L53 32 L51 33 L43 33 Z" fill="url(#metal-grad)" />
            <path d="M41 32 L43 30 L43.5 32 Z" fill={dark} />
            <path d="M53 32 L51 30 L50.5 32 Z" fill={dark} />
            <path d="M45 30 L47 7 L49 30 Z" fill="url(#metal-grad)" />
            <line x1="47" y1="10" x2="47" y2="29" stroke="#5a5a5a" strokeWidth="0.4" />
            <line x1="48.7" y1="29" x2="47" y2="9" stroke={light} strokeWidth="0.3" opacity="0.85" />
            <circle cx="47" cy="8" r="0.7" fill={color}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>
      </g>
    );
  }

  return null;
}

export function HeroSprite({ heroClass, rarity, size = 64, animate = 'idle', flip = false, name, hasBlessing }: HeroSpriteProps) {
  const color = RARITY_COLORS[rarity] || '#9e9e9e';
  const darkColor = darken(color, 30);
  const lightColor = lighten(color, 30);
  const skinColor = '#ffd5b4';
  const animClass = `sprite-${animate}`;

  const customSprite = getCustomSprite(name, color, darkColor, lightColor, rarity);

  return (
    <div
      className={`hero-sprite ${animClass}`}
      style={{
        width: size, height: size,
        transform: flip ? 'scaleX(-1)' : undefined,
        position: 'relative',
      }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
            <feOffset dx="0.5" dy="1" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5f5f5" />
            <stop offset="50%" stopColor="#9e9e9e" />
            <stop offset="100%" stopColor="#424242" />
          </linearGradient>
          <radialGradient id="eye-glow">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
          <linearGradient id="blessing-aura" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="gold" stopOpacity="0">
              <animate attributeName="stopOpacity" values="0;0.5;0" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="gold" stopOpacity="0.8">
               <animate attributeName="stopOpacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {hasBlessing && (
          <g className="blessing-aura-effect">
            <circle cx="32" cy="32" r="30" fill="url(#blessing-aura)" />
            <g transform="translate(32, 32)">
              {[0, 72, 144, 216, 288].map(deg => (
                <circle key={deg} r="1.5" fill="gold">
                  <animateTransform 
                    attributeName="transform" 
                    type="rotate" 
                    from={`${deg} 0 0`} 
                    to={`${deg + 360} 0 0`} 
                    dur="4s" 
                    repeatCount="indefinite" 
                  />
                  <animate attributeName="cy" values="-28;-32;-28" dur="2s" repeatCount="indefinite" />
                </circle>
              ))}
            </g>
          </g>
        )}

        {/* Aura di rarità per epico+ */}
        {(['epico', 'leggendario', 'mitico', 'master'] as Rarity[]).includes(rarity) && (
          <circle cx="32" cy="36" r="28" fill="none" stroke={color} strokeWidth="1" opacity="0.3" className="rarity-glow">
            <animate attributeName="r" values="26;30;26" dur="2s" repeatCount="indefinite" />
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
        <g filter="url(#shadow)">
          {/* MANTELLO PESANTE */}
          <g className="part-cape">
            <path d="M21 28 Q15 32 14 42 Q13 52 17 58 Q20 50 22 42 Q23 36 23 30 Z" fill="#2a1a1a" />
            <path d="M43 28 Q49 32 50 42 Q51 52 47 58 Q44 50 42 42 Q41 36 41 30 Z" fill="#2a1a1a" />
            {/* Bordo rarità */}
            <path d="M17 58 Q20 50 22 42 L23 42 Q22 52 19 60 Z" fill={color} />
            <path d="M47 58 Q44 50 42 42 L41 42 Q42 52 45 60 Z" fill={color} />
          </g>
          <g className="part-body">
            {/* Gambe armate */}
            <rect x="25" y="46" width="6" height="11" rx="2" fill="#1a1a22" />
            <rect x="33" y="46" width="6" height="11" rx="2" fill="#1a1a22" />
            {/* Tassets (gonna corazzata) */}
            <path d="M22 41 L24 50 L28 49 L26 41 Z" fill="url(#metal-grad)" />
            <path d="M42 41 L40 50 L36 49 L38 41 Z" fill="url(#metal-grad)" />
            <rect x="28" y="41" width="8" height="9" rx="1" fill="url(#metal-grad)" />
            {/* Sabatons con trim rarità */}
            <path d="M22 56 L33 56 L33 60 L24 60 Z" fill="#0a0a0a" />
            <path d="M31 56 L42 56 L40 60 L31 60 Z" fill="#0a0a0a" />
            <rect x="22" y="56" width="11" height="1" fill={color} />
            <rect x="31" y="56" width="11" height="1" fill={color} />
            {/* Corazza pettorale */}
            <path d="M23 27 L32 24 L41 27 L40 41 L32 43 L24 41 Z" fill="url(#metal-grad)" />
            <path d="M24 28 L32 26 L40 28 L39 40 L32 41.5 L25 40 Z" fill="#3a3a48" opacity="0.65" />
            <line x1="32" y1="25" x2="32" y2="42" stroke="#0a0a0a" strokeWidth="0.8" />
            {/* Gemma centrale pulsante */}
            <circle cx="32" cy="32" r="2" fill={color}>
              <animate attributeName="opacity" values="1;0.55;1" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="32" cy="32" r="0.8" fill={light} />
            {/* Pauldron sinistro con punte */}
            <ellipse cx="21" cy="27" rx="5" ry="4" fill="url(#metal-grad)" />
            <path d="M16 26 L19 22 L21 26 Z" fill={color} />
            <path d="M21 25 L23 21 L25 26 Z" fill={color} />
            {/* Pauldron destro con punte */}
            <ellipse cx="43" cy="27" rx="5" ry="4" fill="url(#metal-grad)" />
            <path d="M39 26 L41 22 L43 26 Z" fill={color} />
            <path d="M43 25 L45 21 L47 26 Z" fill={color} />
            {/* Cintura con fibbia */}
            <rect x="23" y="40" width="18" height="2.5" rx="0.5" fill="#1a1a1a" />
            <rect x="30" y="39.5" width="4" height="3.5" rx="0.5" fill="url(#metal-grad)" />
            <circle cx="32" cy="41.2" r="0.8" fill={color} />
          </g>
          <g className="part-head">
            {/* Elmo a botte (great helm) */}
            <path d="M22 14 Q22 10 26 8 L38 8 Q42 10 42 14 L42 25 L22 25 Z" fill="url(#metal-grad)" />
            {/* Visiera a T */}
            <rect x="26" y="14" width="12" height="2" fill="#050505" />
            <rect x="30.5" y="14" width="3" height="6" fill="#050505" />
            {/* Occhi luminosi nella fessura */}
            <circle cx="29" cy="15" r="0.7" fill="url(#eye-glow)">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="35" cy="15" r="0.7" fill="url(#eye-glow)">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite" />
            </circle>
            {/* Cresta sull'elmo */}
            <path d="M30 8 L32 3 L34 8 Z" fill={color} />
            <rect x="31.5" y="5" width="1" height="3" fill={dark} />
            {/* Trim rarità */}
            <line x1="22" y1="11" x2="42" y2="11" stroke={color} strokeWidth="0.8" />
          </g>
          {/* BRACCIO SINISTRO + SCUDO heater */}
          <g className="part-arm-l">
            <rect x="17" y="28" width="6" height="14" rx="2" fill="url(#metal-grad)" />
            <path d="M8 24 L20 24 L20 38 Q14 46 8 38 Z" fill="url(#metal-grad)" />
            <path d="M9 25 L19 25 L19 37 Q14 44 9 37 Z" fill={dark} opacity="0.35" />
            {/* Cresta sul scudo */}
            <path d="M14 28 L11 32 L14 41 L17 32 Z" fill={color} />
            <circle cx="14" cy="32" r="1.4" fill={light} />
          </g>
          {/* BRACCIO DESTRO + SPADA verticale */}
          <g className="part-arm-r">
            <rect x="41" y="28" width="6" height="14" rx="2" fill="url(#metal-grad)" />
            <circle cx="50" cy="44" r="1.8" fill="url(#metal-grad)" />
            <circle cx="50" cy="44" r="0.9" fill={color} />
            <rect x="49" y="38" width="2" height="6" rx="0.4" fill="#3e2723" />
            <path d="M44 38 L46 36 L54 36 L56 38 L54 39 L46 39 Z" fill="url(#metal-grad)" />
            <path d="M48 36 L50 8 L52 36 Z" fill="url(#metal-grad)" />
            <line x1="50" y1="11" x2="50" y2="35" stroke="#5a5a5a" strokeWidth="0.4" />
            <line x1="48.3" y1="35" x2="50" y2="10" stroke={light} strokeWidth="0.3" opacity="0.85" />
            <circle cx="50" cy="9" r="0.7" fill={color}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>
      );

    case 'lama':
      return (
        <g filter="url(#shadow)">
          {/* SCIARPA al collo che svolazza */}
          <g className="part-cape">
            <path d="M28 25 Q24 30 22 38 Q20 46 18 52 Q22 50 25 44 Q27 36 29 30 Z" fill={dark} />
            <path d="M18 52 L19 53 L21 49 Z" fill={color} />
          </g>
          <g className="part-body">
            {/* Gambe in pantaloni neri attillati */}
            <rect x="25" y="46" width="6" height="11" rx="2" fill="#1a1a1a" />
            <rect x="33" y="46" width="6" height="11" rx="2" fill="#1a1a1a" />
            {/* Stivali con trim rarità */}
            <rect x="24" y="55" width="8" height="5" rx="2" fill="#0a0a0a" />
            <rect x="32" y="55" width="8" height="5" rx="2" fill="#0a0a0a" />
            <rect x="24" y="55" width="8" height="0.8" fill={color} />
            <rect x="32" y="55" width="8" height="0.8" fill={color} />
            {/* Pettorale leggero con strappi diagonali */}
            <rect x="24" y="28" width="16" height="18" rx="2" fill="#2a2a32" />
            <path d="M24 30 L40 32 L40 30 L25 28 Z" fill={color} opacity="0.5" />
            <path d="M24 30 L40 32 L40 33 L24 31 Z" fill={dark} />
            {/* Fascia obi colorata */}
            <rect x="23" y="40" width="18" height="3.5" rx="0.5" fill={color} />
            <rect x="23" y="40" width="18" height="1" fill={light} />
            {/* Nodo della fascia di lato */}
            <rect x="40" y="40" width="3" height="5" rx="0.5" fill={color} transform="rotate(15 41.5 42.5)" />
            {/* Pauldron leggero spalla destra */}
            <ellipse cx="22" cy="28" rx="3.5" ry="2.8" fill="#2a2a32" />
          </g>
          <g className="part-head">
            <circle cx="32" cy="20" r="8.5" fill={skin} />
            {/* Capelli scuri tirati indietro */}
            <path d="M23 17 Q24 8 32 7 Q40 8 41 17 L41 19 Q38 13 32 12 Q26 13 23 19 Z" fill="#0a0a0a" />
            {/* Coda di capelli dietro */}
            <ellipse cx="40" cy="22" rx="2" ry="4" fill="#0a0a0a" transform="rotate(20 40 22)" />
            {/* Bandana frontale colorata */}
            <rect x="24" y="14.5" width="16" height="2" fill={color} />
            <rect x="24" y="14.5" width="16" height="0.5" fill={light} />
            {/* Cicatrice diagonale sull'occhio destro */}
            <line x1="33" y1="17" x2="37" y2="22" stroke="#a36a55" strokeWidth="0.5" opacity="0.7" />
            {/* Occhi affilati */}
            <circle cx="29" cy="19.5" r="1.2" fill="url(#eye-glow)">
              <animate attributeName="r" values="1.1;1.3;1.1" dur="2.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="35" cy="19.5" r="1.2" fill="url(#eye-glow)">
              <animate attributeName="r" values="1.1;1.3;1.1" dur="2.8s" repeatCount="indefinite" />
            </circle>
          </g>
          {/* BRACCIO SINISTRO + SPADA in posizione difensiva basso */}
          <g className="part-arm-l">
            <rect x="20" y="27" width="5" height="6" rx="2" fill="#2a2a32" />
            <rect x="15" y="29" width="7" height="4" rx="2" fill={skin} />
            <rect x="15" y="29" width="7" height="1.2" fill="url(#metal-grad)" />
            <g transform="rotate(-20 17 32)">
              <circle cx="17" cy="38" r="1.5" fill="url(#metal-grad)" />
              <circle cx="17" cy="38" r="0.7" fill={color} />
              <rect x="16" y="32" width="2" height="6" rx="0.4" fill="#3e2723" />
              <path d="M12 32 L14 30 L20 30 L22 32 L20 33 L14 33 Z" fill="url(#metal-grad)" />
              <path d="M15 30 L17 10 L19 30 Z" fill="url(#metal-grad)" />
              <line x1="17" y1="12" x2="17" y2="29" stroke="#5a5a5a" strokeWidth="0.35" />
              <line x1="15.4" y1="29" x2="17" y2="11" stroke={light} strokeWidth="0.3" opacity="0.85" />
              <circle cx="17" cy="10" r="0.6" fill={color}>
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>
          {/* BRACCIO DESTRO + SPADA principale piu lunga in alto */}
          <g className="part-arm-r">
            <rect x="39" y="27" width="5" height="6" rx="2" fill="#2a2a32" />
            <rect x="42" y="29" width="7" height="4" rx="2" fill={skin} />
            <rect x="42" y="29" width="7" height="1.2" fill="url(#metal-grad)" />
            <g transform="rotate(40 47 32)">
              <circle cx="47" cy="38" r="1.7" fill="url(#metal-grad)" />
              <circle cx="47" cy="38" r="0.9" fill={color} />
              <rect x="46" y="32" width="2" height="6" rx="0.4" fill="#3e2723" />
              <path d="M41 32 L43 30 L51 30 L53 32 L51 33 L43 33 Z" fill="url(#metal-grad)" />
              <path d="M45 30 L47 5 L49 30 Z" fill="url(#metal-grad)" />
              <line x1="47" y1="8" x2="47" y2="29" stroke="#5a5a5a" strokeWidth="0.4" />
              <line x1="48.7" y1="29" x2="47" y2="7" stroke={light} strokeWidth="0.3" opacity="0.85" />
              <circle cx="47" cy="6" r="0.8" fill={color}>
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>
        </g>
      );

    case 'arcano':
      return (
        <g filter="url(#shadow)">
          {/* RUNE FLOTTANTI dietro */}
          <g className="part-cape">
            <text x="48" y="20" fontSize="6" fill={color} opacity="0.5" fontFamily="serif">
              ✦
              <animate attributeName="opacity" values="0.2;0.7;0.2" dur="3s" repeatCount="indefinite" />
            </text>
            <text x="12" y="34" fontSize="5" fill={light} opacity="0.4" fontFamily="serif">
              ✦
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="4s" repeatCount="indefinite" />
            </text>
            <text x="14" y="50" fontSize="4" fill={color} opacity="0.3">
              ✧
              <animate attributeName="opacity" values="0.1;0.6;0.1" dur="3.5s" repeatCount="indefinite" />
            </text>
          </g>
          <g className="part-body">
            {/* Tunica lunga a campana */}
            <path d="M24 28 L19 58 L45 58 L40 28 Z" fill={dark} />
            <path d="M25 30 L21 56 L43 56 L39 30 Z" fill={color} />
            {/* Trim chiaro centrale */}
            <path d="M31 28 L29 58 L35 58 L33 28 Z" fill={light} opacity="0.4" />
            {/* Cintura con simbolo */}
            <rect x="22" y="42" width="20" height="3" rx="0.5" fill={dark} />
            <circle cx="32" cy="43.5" r="1.5" fill={color}>
              <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="32" cy="43.5" r="0.7" fill={light} />
            {/* Stivali a punta */}
            <path d="M22 56 L31 56 L31 60 L19 60 Z" fill="#1a1a22" />
            <path d="M33 56 L42 56 L45 60 L33 60 Z" fill="#1a1a22" />
            {/* Pauldroni leggeri */}
            <ellipse cx="22" cy="29" rx="3.5" ry="2.8" fill={dark} />
            <ellipse cx="42" cy="29" rx="3.5" ry="2.8" fill={dark} />
          </g>
          <g className="part-head">
            <circle cx="32" cy="20" r="8.5" fill={skin} />
            {/* Cappello a punta ricurva */}
            <path d="M22 22 Q26 12 32 6 Q34 4 36 6 Q28 16 24 24 Z" fill={dark} />
            <path d="M24 22 Q28 14 32 8 L33 10 Q28 16 26 23 Z" fill={color} opacity="0.6" />
            {/* Stella sulla punta */}
            <path d="M36 6 L37 4 L38 6 L40 6 L38.5 7.5 L39 9.5 L37 8.5 L35 9.5 L35.5 7.5 L34 6 Z" fill={color}>
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </path>
            {/* Tesa cappello */}
            <ellipse cx="32" cy="23" rx="13" ry="2.5" fill={dark} />
            <ellipse cx="32" cy="22.5" rx="13" ry="1.2" fill={color} opacity="0.5" />
            {/* Barba lunga da mago */}
            <path d="M27 22 Q25 28 27 32 Q30 35 32 35 Q34 35 37 32 Q39 28 37 22 L36 23 Q36 28 33 30 Q31 30 28 28 Z" fill="#d8d8d8" />
            <path d="M28 24 Q27 28 29 31 Q31 32 32 32 Q33 32 35 31 Q37 28 36 24" fill="#f0f0f0" opacity="0.7" />
            {/* Occhi luminosi sotto la tesa */}
            <circle cx="29" cy="20.5" r="1.4" fill="url(#eye-glow)">
              <animate attributeName="r" values="1.2;1.6;1.2" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="35" cy="20.5" r="1.4" fill="url(#eye-glow)">
              <animate attributeName="r" values="1.2;1.6;1.2" dur="2.6s" repeatCount="indefinite" />
            </circle>
          </g>
          {/* BRACCIO SINISTRO con sfera arcana */}
          <g className="part-arm-l">
            <rect x="20" y="30" width="4" height="6" rx="2" fill={dark} />
            <circle cx="18" cy="38" r="4" fill={color} opacity="0.35">
              <animate attributeName="r" values="3;5;3" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="18" cy="38" r="2.5" fill={color} opacity="0.7">
              <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="18" cy="38" r="1.2" fill={light} />
          </g>
          {/* BRACCIO DESTRO + BASTONE RUNICO */}
          <g className="part-arm-r">
            <rect x="40" y="30" width="4" height="6" rx="2" fill={dark} />
            {/* Asta con avvolgimento */}
            <rect x="45" y="14" width="2.5" height="44" rx="1" fill="#5d3a1f" />
            <rect x="45" y="14" width="2.5" height="44" rx="1" fill="url(#metal-grad)" opacity="0.2" />
            <line x1="45" y1="22" x2="47.5" y2="22" stroke="#3e2210" strokeWidth="0.6" />
            <line x1="45" y1="34" x2="47.5" y2="34" stroke="#3e2210" strokeWidth="0.6" />
            <line x1="45" y1="46" x2="47.5" y2="46" stroke="#3e2210" strokeWidth="0.6" />
            {/* Artigli che reggono cristallo */}
            <path d="M42 14 Q43 11 46 13 Q48 11 50 12 Q51 14 49 16 L42 16 Z" fill="url(#metal-grad)" />
            {/* Cristallo magico */}
            <polygon points="46.25,4 42,12 50.5,12" fill={color} opacity="0.9">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
            </polygon>
            <polygon points="46.25,7 44,11 48.5,11" fill={light} opacity="0.6" />
            {/* Aura cristallo */}
            <circle cx="46.25" cy="9" r="6" fill={color} opacity="0.15">
              <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>
      );

    case 'custode':
      return (
        <g filter="url(#shadow)">
          {/* ALI ANGELICHE dietro */}
          <g className="part-cape">
            <path d="M22 28 Q12 26 8 36 Q12 36 17 38 Q14 42 12 48 Q18 44 22 42 Q22 36 22 30 Z"
              fill="#fff8dc" opacity="0.85" />
            <path d="M22 32 Q15 30 10 38 Q14 38 18 40" fill="#daa520" opacity="0.4" />
            <path d="M42 28 Q52 26 56 36 Q52 36 47 38 Q50 42 52 48 Q46 44 42 42 Q42 36 42 30 Z"
              fill="#fff8dc" opacity="0.85" />
            <path d="M42 32 Q49 30 54 38 Q50 38 46 40" fill="#daa520" opacity="0.4" />
            {/* Piume punta colore rarità */}
            <ellipse cx="11" cy="38" rx="1.5" ry="3" fill={color} opacity="0.6" />
            <ellipse cx="53" cy="38" rx="1.5" ry="3" fill={color} opacity="0.6" />
          </g>
          <g className="part-body">
            {/* Tunica lunga bianco-dorata */}
            <path d="M23 28 L20 58 L44 58 L41 28 Z" fill="#f8f8f8" />
            <path d="M24 30 L22 56 L42 56 L40 30 Z" fill="#fff8dc" opacity="0.6" />
            {/* Trim dorato verticale */}
            <rect x="31" y="28" width="2" height="30" fill="#daa520" />
            {/* Simbolo sacro sul petto - sole stilizzato */}
            <circle cx="32" cy="34" r="3.5" fill={color}>
              <animate attributeName="opacity" values="1;0.65;1" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="32" cy="34" r="2" fill="#fff" />
            <circle cx="32" cy="34" r="0.8" fill={color} />
            {/* Raggi del sole */}
            <line x1="32" y1="29.5" x2="32" y2="31.5" stroke="#daa520" strokeWidth="0.6" />
            <line x1="32" y1="36.5" x2="32" y2="38.5" stroke="#daa520" strokeWidth="0.6" />
            <line x1="27.5" y1="34" x2="29.5" y2="34" stroke="#daa520" strokeWidth="0.6" />
            <line x1="34.5" y1="34" x2="36.5" y2="34" stroke="#daa520" strokeWidth="0.6" />
            {/* Cintura corda */}
            <path d="M22 42 Q32 44 42 42 L42 44 Q32 46 22 44 Z" fill="#daa520" />
            <circle cx="32" cy="46" r="1.5" fill="#daa520" />
            <path d="M30.5 46 L30 53 M33.5 46 L34 53" stroke="#daa520" strokeWidth="0.6" />
            {/* Sandali dorati */}
            <rect x="24" y="55" width="8" height="3" rx="1" fill="#daa520" />
            <rect x="32" y="55" width="8" height="3" rx="1" fill="#daa520" />
            <line x1="28" y1="55" x2="28" y2="58" stroke="#a8841a" strokeWidth="0.4" />
            <line x1="36" y1="55" x2="36" y2="58" stroke="#a8841a" strokeWidth="0.4" />
          </g>
          <g className="part-head">
            <circle cx="32" cy="20" r="9" fill={skin} />
            {/* AUREOLA flottante sopra la testa */}
            <ellipse cx="32" cy="9" rx="10" ry="2.5" fill="none" stroke={color} strokeWidth="1.4" opacity="0.85">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2.4s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="32" cy="9" rx="8" ry="2" fill={color} opacity="0.4">
              <animate attributeName="rx" values="7;9;7" dur="2.4s" repeatCount="indefinite" />
            </ellipse>
            {/* Capelli biondi a frangia */}
            <path d="M23 18 Q25 11 32 10 Q39 11 41 18 Q38 14 32 13 Q26 14 23 18 Z" fill="#f0d080" />
            <path d="M26 14 Q28 16 30 14 Q30 17 26 18 Z" fill="#daa520" opacity="0.5" />
            {/* Occhi sereni azzurri */}
            <ellipse cx="29" cy="20.5" rx="1.3" ry="1.1" fill="#4a90d9" />
            <ellipse cx="35" cy="20.5" rx="1.3" ry="1.1" fill="#4a90d9" />
            <circle cx="29" cy="20.3" r="0.4" fill="#fff" />
            <circle cx="35" cy="20.3" r="0.4" fill="#fff" />
            {/* Bocca calma */}
            <path d="M30 24 Q32 25 34 24" stroke="#c4905f" strokeWidth="0.5" fill="none" />
          </g>
          {/* BRACCIO SINISTRO con libro/preghiera */}
          <g className="part-arm-l">
            <rect x="20" y="30" width="4" height="8" rx="2" fill="#f8f8f8" />
            <rect x="14" y="34" width="8" height="6" rx="0.5" fill="#5d3a1f" />
            <rect x="14.5" y="34.5" width="7" height="5" rx="0.3" fill="#daa520" />
            {/* Croce sul libro */}
            <rect x="17.5" y="35.5" width="1" height="3" fill={color} />
            <rect x="16.5" y="36.5" width="3" height="1" fill={color} />
          </g>
          {/* BRACCIO DESTRO + BASTONE DORATO con sole */}
          <g className="part-arm-r">
            <rect x="40" y="30" width="4" height="6" rx="2" fill="#f8f8f8" />
            <rect x="44.5" y="14" width="2.5" height="44" rx="1" fill="#daa520" />
            <rect x="44.5" y="20" width="2.5" height="1" fill="#a8841a" />
            <rect x="44.5" y="40" width="2.5" height="1" fill="#a8841a" />
            {/* Sole in cima */}
            <circle cx="45.75" cy="12" r="4" fill={color}>
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="45.75" cy="12" r="2.2" fill="#fff" />
            <circle cx="45.75" cy="12" r="1" fill={color} />
            {/* Raggi sole */}
            <line x1="45.75" y1="6" x2="45.75" y2="8" stroke={color} strokeWidth="0.8" />
            <line x1="45.75" y1="16" x2="45.75" y2="18" stroke={color} strokeWidth="0.8" />
            <line x1="40" y1="12" x2="42" y2="12" stroke={color} strokeWidth="0.8" />
            <line x1="49.5" y1="12" x2="51.5" y2="12" stroke={color} strokeWidth="0.8" />
            <line x1="41.5" y1="7.5" x2="42.8" y2="9" stroke={color} strokeWidth="0.6" />
            <line x1="48.7" y1="9" x2="50" y2="7.5" stroke={color} strokeWidth="0.6" />
          </g>
        </g>
      );

    case 'ombra':
      return (
        <g filter="url(#shadow)">
          {/* MANTELLO scuro che si allarga */}
          <g className="part-cape">
            <path d="M22 24 L14 58 L50 58 L42 24 L40 26 L32 28 L24 26 Z" fill="#0a0a14" />
            <path d="M24 26 L18 56 L46 56 L40 26 L32 30 Z" fill="#16162a" />
            {/* Bordi colore rarità */}
            <path d="M14 58 L18 56 L18 58 Z" fill={color} />
            <path d="M50 58 L46 56 L46 58 Z" fill={color} />
            {/* Cappa che si frange */}
            <path d="M22 50 L24 58 L26 56 L25 50 Z" fill="#1a1a2e" />
            <path d="M42 50 L40 58 L38 56 L39 50 Z" fill="#1a1a2e" />
          </g>
          <g className="part-body">
            {/* Tunica sotto al mantello */}
            <rect x="26" y="28" width="12" height="22" rx="2" fill="#16162a" />
            <rect x="27" y="29" width="10" height="20" rx="1" fill="#1f1f35" />
            {/* Cintura con lame piccole */}
            <rect x="25" y="40" width="14" height="2.5" rx="0.5" fill="#0a0a14" />
            <rect x="27" y="39.5" width="1" height="3.5" fill="#888" />
            <rect x="29.5" y="39.5" width="1" height="3.5" fill="#888" />
            <rect x="33.5" y="39.5" width="1" height="3.5" fill="#888" />
            <rect x="36" y="39.5" width="1" height="3.5" fill="#888" />
            {/* Gambe nere */}
            <rect x="26" y="50" width="5" height="8" rx="2" fill="#0a0a14" />
            <rect x="33" y="50" width="5" height="8" rx="2" fill="#0a0a14" />
            {/* Stivali leggeri */}
            <rect x="25" y="56" width="7" height="3" rx="1" fill="#050508" />
            <rect x="32" y="56" width="7" height="3" rx="1" fill="#050508" />
          </g>
          <g className="part-head">
            {/* Faccia in penombra */}
            <circle cx="32" cy="20" r="9" fill={skin} opacity="0.85" />
            {/* CAPPUCCIO che lascia in ombra il volto */}
            <path d="M21 22 Q22 8 32 6 Q42 8 43 22 L41 22 Q40 11 32 10 Q24 11 23 22 Z" fill="#0a0a14" />
            <path d="M23 22 Q24 11 32 9 Q40 11 41 22 L40 22 Q39 14 32 13 Q25 14 24 22 Z" fill="#16162a" />
            {/* Maschera che copre bocca/naso */}
            <path d="M25 22 L39 22 L37 26 L27 26 Z" fill="#0a0a14" />
            <line x1="28" y1="24" x2="36" y2="24" stroke="#1f1f35" strokeWidth="0.5" />
            {/* Occhi che brillano nell'ombra */}
            <circle cx="29" cy="19" r="1.4" fill={color}>
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="35" cy="19" r="1.4" fill={color}>
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="29" cy="18.8" r="0.5" fill={light} />
            <circle cx="35" cy="18.8" r="0.5" fill={light} />
          </g>
          {/* BRACCIO SINISTRO + PUGNALE incrociato avanti */}
          <g className="part-arm-l">
            <rect x="22" y="29" width="4" height="6" rx="2" fill="#0a0a14" />
            <rect x="17" y="32" width="6" height="4" rx="2" fill={skin} opacity="0.9" />
            <g transform="rotate(60 18 34)">
              <circle cx="18" cy="40" r="1.3" fill="#1f1f35" />
              <circle cx="18" cy="40" r="0.7" fill={color} />
              <rect x="17.2" y="34" width="1.6" height="6" rx="0.3" fill="#0a0a14" />
              <path d="M14 34 L15 32.5 L21 32.5 L22 34 L21 35 L15 35 Z" fill="url(#metal-grad)" />
              {/* Lama ricurva */}
              <path d="M16.5 32.5 Q17 24 18 18 Q19 22 19.5 32.5 Z" fill="url(#metal-grad)" />
              <path d="M17 32.5 Q17.5 24 18 20" stroke={light} strokeWidth="0.25" fill="none" opacity="0.85" />
              <circle cx="18" cy="18" r="0.5" fill={color}>
                <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>
          {/* BRACCIO DESTRO + PUGNALE incrociato dietro */}
          <g className="part-arm-r">
            <rect x="38" y="29" width="4" height="6" rx="2" fill="#0a0a14" />
            <rect x="41" y="32" width="6" height="4" rx="2" fill={skin} opacity="0.9" />
            <g transform="rotate(-60 46 34)">
              <circle cx="46" cy="40" r="1.3" fill="#1f1f35" />
              <circle cx="46" cy="40" r="0.7" fill={color} />
              <rect x="45.2" y="34" width="1.6" height="6" rx="0.3" fill="#0a0a14" />
              <path d="M42 34 L43 32.5 L49 32.5 L50 34 L49 35 L43 35 Z" fill="url(#metal-grad)" />
              <path d="M44.5 32.5 Q45 24 46 18 Q47 22 47.5 32.5 Z" fill="url(#metal-grad)" />
              <path d="M45 32.5 Q45.5 24 46 20" stroke={light} strokeWidth="0.25" fill="none" opacity="0.85" />
              <circle cx="46" cy="18" r="0.5" fill={color}>
                <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>
        </g>
      );

    case 'ranger':
      return (
        <g filter="url(#shadow)">
          {/* MANTELLO LEGGERO verde dietro */}
          <g className="part-cape">
            <path d="M22 26 Q17 32 17 42 Q18 50 21 56 Q23 50 24 42 Q24 36 24 30 Z" fill="#1e3a0e" />
            <path d="M42 26 Q47 32 47 42 Q46 50 43 56 Q41 50 40 42 Q40 36 40 30 Z" fill="#1e3a0e" />
            <path d="M21 56 L23 56 L24 50 L23 50 Z" fill={color} />
            <path d="M43 56 L41 56 L40 50 L41 50 Z" fill={color} />
          </g>
          <g className="part-body">
            {/* Gambe in pantaloni di pelle */}
            <rect x="25" y="46" width="6" height="11" rx="2" fill="#3e2412" />
            <rect x="33" y="46" width="6" height="11" rx="2" fill="#3e2412" />
            {/* Stivali alti */}
            <rect x="24" y="53" width="8" height="7" rx="2" fill="#2d1a0a" />
            <rect x="32" y="53" width="8" height="7" rx="2" fill="#2d1a0a" />
            <rect x="24" y="53" width="8" height="0.8" fill={color} />
            <rect x="32" y="53" width="8" height="0.8" fill={color} />
            {/* Tunica verde da bosco */}
            <path d="M24 28 L23 46 L41 46 L40 28 Z" fill="#2d5016" />
            <path d="M25 30 L24 44 L40 44 L39 30 Z" fill="#3d6b22" opacity="0.7" />
            {/* Cinta in cuoio diagonale (cinghia faretra) */}
            <path d="M22 30 L42 36 L42 38 L22 32 Z" fill="#5d3a1f" />
            <circle cx="32" cy="34.2" r="1.4" fill={color} />
            {/* Cintura */}
            <rect x="22" y="40" width="20" height="2.5" rx="0.5" fill="#3e2412" />
            <rect x="30" y="39.5" width="4" height="3.5" rx="0.5" fill="#5d3a1f" />
            <circle cx="32" cy="41.2" r="0.7" fill={color} />
          </g>
          <g className="part-head">
            <circle cx="32" cy="20" r="9" fill={skin} />
            {/* Cappello ranger a tesa larga */}
            <ellipse cx="32" cy="14.5" rx="13" ry="2.2" fill="#3e2412" />
            <path d="M24 13 Q26 7 32 6 Q38 7 40 13 L40 15 L24 15 Z" fill="#5d3a1f" />
            <ellipse cx="32" cy="13" rx="8" ry="2.5" fill="#3e2412" opacity="0.5" />
            {/* Piuma sul cappello */}
            <path d="M40 8 Q44 4 46 6 Q44 10 41 12 Z" fill={color}>
              <animateTransform attributeName="transform" type="rotate" values="0 40 10;3 40 10;0 40 10" dur="3s" repeatCount="indefinite" />
            </path>
            <path d="M41 9 Q43 7 44 8" stroke={light} strokeWidth="0.4" fill="none" />
            {/* Capelli sulle orecchie */}
            <path d="M23 18 Q24 20 25 22" stroke="#5d3a1f" strokeWidth="1.5" fill="none" />
            <path d="M41 18 Q40 20 39 22" stroke="#5d3a1f" strokeWidth="1.5" fill="none" />
            {/* Occhi affilati verdi */}
            <circle cx="29" cy="20.5" r="1.2" fill="#2e7d32">
              <animate attributeName="r" values="1;1.4;1" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="35" cy="20.5" r="1.2" fill="#2e7d32">
              <animate attributeName="r" values="1;1.4;1" dur="2.5s" repeatCount="indefinite" />
            </circle>
            {/* Vernice verde sulle guance */}
            <line x1="26" y1="23" x2="28" y2="24" stroke="#1e3a0e" strokeWidth="0.6" />
            <line x1="38" y1="23" x2="36" y2="24" stroke="#1e3a0e" strokeWidth="0.6" />
          </g>
          {/* BRACCIO SINISTRO che tiene l'arco */}
          <g className="part-arm-l">
            <rect x="20" y="30" width="5" height="6" rx="2" fill="#2d5016" />
            <rect x="14" y="32" width="6" height="4" rx="2" fill={skin} />
            {/* ARCO ricurvo grande */}
            <path d="M14 8 Q4 24 14 40 Q6 24 14 8 Z" fill="none" stroke="#5d3a1f" strokeWidth="1.8" />
            <path d="M14 10 Q6 24 14 38" fill="none" stroke="#8d5a2f" strokeWidth="0.6" />
            {/* Corda dell'arco tesa */}
            <line x1="14" y1="8" x2="14" y2="40" stroke="#f0f0f0" strokeWidth="0.4" />
            {/* Decorazione manopola */}
            <rect x="12.5" y="22" width="3" height="4" rx="0.5" fill={color} />
            <line x1="13" y1="23" x2="15" y2="25" stroke={dark} strokeWidth="0.3" />
            {/* Freccia incoccata */}
            <line x1="14" y1="24" x2="22" y2="24" stroke="#8d5a2f" strokeWidth="0.7" />
            <polygon points="22,23.4 24,24 22,24.6" fill="url(#metal-grad)" />
            <path d="M14 23.4 L11 22.5 L11 23.5 Z" fill={color} />
            <path d="M14 24.6 L11 25.5 L11 24.5 Z" fill={color} />
          </g>
          {/* BRACCIO DESTRO + FARETRA visibile */}
          <g className="part-arm-r">
            <rect x="39" y="30" width="5" height="6" rx="2" fill="#2d5016" />
            <rect x="44" y="32" width="6" height="4" rx="2" fill={skin} />
            {/* Faretra dietro la schiena */}
            <rect x="44" y="20" width="6" height="20" rx="1.5" fill="#3e2412" />
            <rect x="44" y="20" width="6" height="1.2" fill={color} />
            <rect x="44" y="38.5" width="6" height="1.2" fill={color} />
            {/* Frecce nella faretra */}
            <line x1="45.5" y1="20" x2="45.5" y2="14" stroke="#8d5a2f" strokeWidth="0.6" />
            <line x1="47" y1="20" x2="47" y2="13" stroke="#8d5a2f" strokeWidth="0.6" />
            <line x1="48.5" y1="20" x2="48.5" y2="15" stroke="#8d5a2f" strokeWidth="0.6" />
            <path d="M44.8 14 L45.5 13 L46.2 14 Z" fill={color} />
            <path d="M46.3 13 L47 12 L47.7 13 Z" fill={color} />
            <path d="M47.8 15 L48.5 14 L49.2 15 Z" fill={color} />
          </g>
        </g>
      );

    case 'sciamano':
      return (
        <g filter="url(#shadow)">
          {/* SPIRITI che fluttuano */}
          <g className="part-cape">
            <circle cx="50" cy="22" r="2" fill={color} opacity="0.4">
              <animate attributeName="cy" values="22;18;22" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="52" cy="38" r="1.5" fill={light} opacity="0.5">
              <animate attributeName="cy" values="38;42;38" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="50" r="1.2" fill={color} opacity="0.4">
              <animate attributeName="cy" values="50;46;50" dur="3.5s" repeatCount="indefinite" />
            </circle>
          </g>
          <g className="part-body">
            {/* Vesti lunghe tribali con frange */}
            <path d="M24 28 L20 56 L44 56 L40 28 Z" fill="#2d0a4d" />
            <path d="M25 30 L22 54 L42 54 L39 30 Z" fill="#4a148c" />
            {/* Strisce verticali colore rarità */}
            <path d="M27 30 L26 54 L28 54 L29 30 Z" fill={color} opacity="0.5" />
            <path d="M35 30 L36 54 L38 54 L37 30 Z" fill={color} opacity="0.5" />
            {/* Frange in basso */}
            <line x1="22" y1="54" x2="21" y2="58" stroke="#2d0a4d" strokeWidth="1" />
            <line x1="26" y1="54" x2="25.5" y2="58" stroke="#2d0a4d" strokeWidth="1" />
            <line x1="30" y1="54" x2="29.5" y2="58" stroke="#2d0a4d" strokeWidth="1" />
            <line x1="34" y1="54" x2="34.5" y2="58" stroke="#2d0a4d" strokeWidth="1" />
            <line x1="38" y1="54" x2="38.5" y2="58" stroke="#2d0a4d" strokeWidth="1" />
            <line x1="42" y1="54" x2="43" y2="58" stroke="#2d0a4d" strokeWidth="1" />
            {/* Ossi/perle decorativi sulla collana */}
            <ellipse cx="30" cy="32" rx="0.8" ry="1.5" fill="#f0e6d2" />
            <ellipse cx="32" cy="33" rx="0.8" ry="1.5" fill="#f0e6d2" />
            <ellipse cx="34" cy="32" rx="0.8" ry="1.5" fill="#f0e6d2" />
            {/* Simbolo tribale sul petto */}
            <circle cx="32" cy="40" r="2.5" fill={dark} />
            <circle cx="32" cy="40" r="1.5" fill={color}>
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </g>
          <g className="part-head">
            <circle cx="32" cy="20" r="9" fill={skin} />
            {/* Vernice tribale colore rarità */}
            <line x1="26" y1="17" x2="30" y2="20" stroke={color} strokeWidth="1.5" />
            <line x1="38" y1="17" x2="34" y2="20" stroke={color} strokeWidth="1.5" />
            <line x1="26" y1="22" x2="29" y2="23" stroke={dark} strokeWidth="1" />
            <line x1="38" y1="22" x2="35" y2="23" stroke={dark} strokeWidth="1" />
            {/* Punto sulla fronte */}
            <circle cx="32" cy="14" r="1.2" fill={color}>
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Occhi gialli/colorati */}
            <circle cx="29" cy="19.5" r="1.3" fill={color} />
            <circle cx="35" cy="19.5" r="1.3" fill={color} />
            <circle cx="29" cy="19.5" r="0.5" fill={dark} />
            <circle cx="35" cy="19.5" r="0.5" fill={dark} />
            {/* COPRICAPO TRIBALE con piume multiple */}
            <path d="M22 14 Q24 8 32 6 Q40 8 42 14 L40 16 Q36 12 32 12 Q28 12 24 16 Z" fill="#2d0a4d" />
            <path d="M22 14 Q24 8 32 6 Q40 8 42 14" fill="none" stroke={color} strokeWidth="0.6" />
            {/* Piume con animazione gentle sway */}
            <g>
              <ellipse cx="26" cy="9" rx="1.5" ry="6" fill={color} transform="rotate(-20 26 9)">
                <animateTransform attributeName="transform" type="rotate" values="-20 26 9;-15 26 9;-20 26 9" dur="3s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="26" cy="6" rx="0.6" ry="2" fill={light} transform="rotate(-20 26 6)" />
            </g>
            <g>
              <ellipse cx="32" cy="6" rx="1.6" ry="7" fill={dark} />
              <ellipse cx="32" cy="3" rx="0.6" ry="2.5" fill={light} />
            </g>
            <g>
              <ellipse cx="38" cy="9" rx="1.5" ry="6" fill={light} transform="rotate(20 38 9)">
                <animateTransform attributeName="transform" type="rotate" values="20 38 9;15 38 9;20 38 9" dur="3.2s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="38" cy="6" rx="0.6" ry="2" fill={color} transform="rotate(20 38 6)" />
            </g>
            {/* Banda frontale */}
            <rect x="23" y="14" width="18" height="1.5" fill={color} />
            {/* Piccoli ossi pendenti */}
            <line x1="25" y1="15.5" x2="25" y2="17.5" stroke="#f0e6d2" strokeWidth="0.5" />
            <ellipse cx="25" cy="18" rx="0.5" ry="0.8" fill="#f0e6d2" />
            <line x1="39" y1="15.5" x2="39" y2="17.5" stroke="#f0e6d2" strokeWidth="0.5" />
            <ellipse cx="39" cy="18" rx="0.5" ry="0.8" fill="#f0e6d2" />
          </g>
          {/* BRACCIO SINISTRO + TOTEM BASTONE */}
          <g className="part-arm-l">
            <rect x="20" y="30" width="4" height="6" rx="2" fill="#4a148c" />
            <rect x="14" y="34" width="6" height="4" rx="2" fill={skin} />
            {/* Bastone totem */}
            <rect x="11" y="14" width="3" height="44" rx="1" fill="#5d3a1f" />
            {/* Nodi del bastone */}
            <rect x="10.5" y="24" width="4" height="1.5" rx="0.5" fill="#3e2210" />
            <rect x="10.5" y="40" width="4" height="1.5" rx="0.5" fill="#3e2210" />
            {/* Teschio in cima al totem */}
            <ellipse cx="12.5" cy="11" rx="3.5" ry="3" fill="#f0e6d2" />
            <circle cx="11.3" cy="11" r="0.9" fill={dark} />
            <circle cx="13.7" cy="11" r="0.9" fill={dark} />
            <path d="M11 13.5 L12 14 L13 13.5 L14 14" stroke={dark} strokeWidth="0.4" fill="none" />
            {/* Bagliore sopra il teschio */}
            <circle cx="12.5" cy="6" r="2.5" fill={color} opacity="0.4">
              <animate attributeName="r" values="2;3.5;2" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="12.5" cy="6" r="1.3" fill={light}>
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite" />
            </circle>
            {/* Piuma legata al totem */}
            <ellipse cx="15" cy="16" rx="0.7" ry="2.5" fill={color} transform="rotate(30 15 16)" />
          </g>
          {/* BRACCIO DESTRO che casta */}
          <g className="part-arm-r">
            <rect x="40" y="30" width="4" height="6" rx="2" fill="#4a148c" />
            <rect x="43" y="34" width="6" height="4" rx="2" fill={skin} />
            {/* Sfera spirituale nella mano */}
            <circle cx="50" cy="38" r="3.5" fill={color} opacity="0.3">
              <animate attributeName="r" values="3;4;3" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="38" r="2" fill={color} opacity="0.7" />
            <circle cx="50" cy="38" r="0.9" fill={light} />
          </g>
        </g>
      );

    case 'crono':
      return (
        <g filter="url(#shadow)">
          {/* QUADRANTE OROLOGIO sfocato in background */}
          <g className="part-cape">
            <circle cx="32" cy="34" r="22" fill="none" stroke={color} strokeWidth="0.4" opacity="0.15" />
            <circle cx="32" cy="34" r="18" fill="none" stroke={light} strokeWidth="0.3" opacity="0.12" />
            <text x="32" y="14" fontSize="3.5" textAnchor="middle" fill={color} opacity="0.4">XII</text>
            <text x="52" y="36" fontSize="3" textAnchor="middle" fill={color} opacity="0.3">III</text>
            <text x="12" y="36" fontSize="3" textAnchor="middle" fill={color} opacity="0.3">IX</text>
            {/* Particelle che si muovono in orbita */}
            <circle cx="14" cy="26" r="1.4" fill={color} opacity="0.45">
              <animate attributeName="cy" values="26;20;26" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="40" r="1.1" fill={light} opacity="0.4">
              <animate attributeName="cy" values="40;46;40" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="48" cy="20" r="0.9" fill={color} opacity="0.5">
              <animate attributeName="cx" values="48;52;48" dur="3s" repeatCount="indefinite" />
            </circle>
          </g>
          <g className="part-body">
            {/* Veste lunga blu navy con simboli */}
            <path d="M23 28 L20 58 L44 58 L41 28 Z" fill="#06246e" />
            <path d="M24 30 L22 56 L42 56 L40 30 Z" fill="#0d47a1" />
            {/* Trim argento/rarità lungo bordo */}
            <path d="M23 28 L20 58 L21 58 L24 28 Z" fill={color} />
            <path d="M41 28 L44 58 L43 58 L40 28 Z" fill={color} />
            {/* Stivali */}
            <rect x="24" y="54" width="8" height="5" rx="2" fill="#06246e" />
            <rect x="32" y="54" width="8" height="5" rx="2" fill="#06246e" />
            <rect x="24" y="54" width="8" height="0.8" fill={color} />
            <rect x="32" y="54" width="8" height="0.8" fill={color} />
            {/* OROLOGIO PRINCIPALE sul petto */}
            <circle cx="32" cy="36" r="5.5" fill="#0a1a3a" stroke={color} strokeWidth="0.8" />
            <circle cx="32" cy="36" r="4.5" fill="#06246e" stroke={light} strokeWidth="0.3" opacity="0.6" />
            {/* Marker delle ore */}
            <line x1="32" y1="31.5" x2="32" y2="32.5" stroke={light} strokeWidth="0.5" />
            <line x1="32" y1="39.5" x2="32" y2="40.5" stroke={light} strokeWidth="0.5" />
            <line x1="27.5" y1="36" x2="28.5" y2="36" stroke={light} strokeWidth="0.5" />
            <line x1="35.5" y1="36" x2="36.5" y2="36" stroke={light} strokeWidth="0.5" />
            {/* Lancetta minuti (ruota veloce) */}
            <g transform-origin="32 36">
              <line x1="32" y1="36" x2="32" y2="32" stroke={color} strokeWidth="0.8">
                <animateTransform attributeName="transform" type="rotate" from="0 32 36" to="360 32 36" dur="4s" repeatCount="indefinite" />
              </line>
            </g>
            {/* Lancetta ore (ruota lenta) */}
            <g transform-origin="32 36">
              <line x1="32" y1="36" x2="34" y2="36" stroke={light} strokeWidth="0.5">
                <animateTransform attributeName="transform" type="rotate" from="0 32 36" to="360 32 36" dur="14s" repeatCount="indefinite" />
              </line>
            </g>
            <circle cx="32" cy="36" r="0.7" fill={color} />
            {/* Cintura */}
            <rect x="22" y="44" width="20" height="2.5" rx="0.5" fill="#06246e" />
            <rect x="30" y="43.5" width="4" height="3.5" rx="0.5" fill={color} />
            <circle cx="32" cy="45.2" r="0.7" fill={light} />
          </g>
          <g className="part-head">
            <circle cx="32" cy="20" r="9" fill={skin} />
            {/* Capelli argentei lunghi */}
            <path d="M22 17 Q24 8 32 6 Q40 8 42 17 L42 22 Q40 14 32 13 Q24 14 22 22 Z" fill="#e8e8e8" />
            <path d="M23 18 Q25 12 32 11 Q39 12 41 18" fill="#f8f8f8" opacity="0.6" />
            {/* Ciocche laterali lunghe */}
            <path d="M22 18 Q20 22 22 28 L24 28 Q23 22 24 18 Z" fill="#e8e8e8" />
            <path d="M42 18 Q44 22 42 28 L40 28 Q41 22 40 18 Z" fill="#e8e8e8" />
            {/* Cerchietto frontale con gemma */}
            <rect x="23" y="13.5" width="18" height="1.5" fill={color} />
            <circle cx="32" cy="14.25" r="1.2" fill={light}>
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2.4s" repeatCount="indefinite" />
            </circle>
            {/* Occhi luminosi che cambiano colore */}
            <circle cx="29" cy="20.5" r="1.4" fill={color}>
              <animate attributeName="fill" values={`${color};${light};${color}`} dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="35" cy="20.5" r="1.4" fill={color}>
              <animate attributeName="fill" values={`${color};${light};${color}`} dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="29" cy="20.3" r="0.4" fill="#fff" />
            <circle cx="35" cy="20.3" r="0.4" fill="#fff" />
          </g>
          {/* BRACCIO SINISTRO con clessidra */}
          <g className="part-arm-l">
            <rect x="20" y="30" width="4" height="6" rx="2" fill="#0d47a1" />
            <rect x="14" y="34" width="6" height="4" rx="2" fill={skin} />
            {/* Clessidra */}
            <rect x="11" y="38" width="8" height="1" fill="url(#metal-grad)" />
            <rect x="11" y="49" width="8" height="1" fill="url(#metal-grad)" />
            <path d="M12 39 L18 39 L15.5 44 L18 49 L12 49 L14.5 44 Z" fill={color} opacity="0.4" />
            {/* Sabbia che cade */}
            <path d="M13.5 40 L16.5 40 L15.5 44 Z" fill={light} />
            <line x1="15" y1="44" x2="15" y2="48" stroke={light} strokeWidth="0.3">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </line>
            <path d="M13 49 L17 49 L15 47 Z" fill={light} />
          </g>
          {/* BRACCIO DESTRO + STAFF con ingranaggio */}
          <g className="part-arm-r">
            <rect x="40" y="30" width="4" height="6" rx="2" fill="#0d47a1" />
            <rect x="44" y="34" width="6" height="4" rx="2" fill={skin} />
            {/* Asta */}
            <rect x="46.5" y="14" width="2.5" height="44" rx="1" fill="url(#metal-grad)" />
            {/* Ingranaggio in cima */}
            <g>
              <circle cx="47.75" cy="11" r="4" fill={color} opacity="0.85" />
              <circle cx="47.75" cy="11" r="2.4" fill="#06246e" />
              <circle cx="47.75" cy="11" r="0.7" fill={light} />
              {/* Denti */}
              <g>
                <rect x="47.25" y="6" width="1" height="1.5" fill={color} />
                <rect x="47.25" y="14.5" width="1" height="1.5" fill={color} />
                <rect x="42.75" y="10.5" width="1.5" height="1" fill={color} />
                <rect x="51.25" y="10.5" width="1.5" height="1" fill={color} />
                <rect x="44.5" y="7.5" width="1.2" height="1.2" fill={color} transform="rotate(45 45.1 8.1)" />
                <rect x="49.8" y="7.5" width="1.2" height="1.2" fill={color} transform="rotate(45 50.4 8.1)" />
                <animateTransform attributeName="transform" type="rotate" from="0 47.75 11" to="360 47.75 11" dur="8s" repeatCount="indefinite" />
              </g>
            </g>
          </g>
        </g>
      );

    case 'dragoon':
      return (
        <g filter="url(#shadow)">
          {/* MANTELLO PESANTE rosso-scuro con stemma */}
          <g className="part-cape">
            <path d="M20 28 Q14 32 13 42 Q12 52 16 58 Q19 50 21 42 Q22 36 22 30 Z" fill="#5a1010" />
            <path d="M44 28 Q50 32 51 42 Q52 52 48 58 Q45 50 43 42 Q42 36 42 30 Z" fill="#5a1010" />
            <path d="M16 58 Q19 50 21 42 L22 42 Q21 52 18 60 Z" fill={color} />
            <path d="M48 58 Q45 50 43 42 L42 42 Q43 52 46 60 Z" fill={color} />
          </g>
          <g className="part-body">
            {/* Gambe armate */}
            <rect x="25" y="46" width="6" height="11" rx="2" fill="#1a2228" />
            <rect x="33" y="46" width="6" height="11" rx="2" fill="#1a2228" />
            {/* Tassets squamati */}
            <path d="M22 41 L24 50 L28 49 L26 41 Z" fill="#37474f" />
            <path d="M42 41 L40 50 L36 49 L38 41 Z" fill="#37474f" />
            <rect x="28" y="41" width="8" height="9" rx="1" fill="#37474f" />
            {/* Squame sull'addome */}
            <circle cx="29" cy="44" r="0.8" fill={color} opacity="0.5" />
            <circle cx="32" cy="44" r="0.8" fill={color} opacity="0.5" />
            <circle cx="35" cy="44" r="0.8" fill={color} opacity="0.5" />
            <circle cx="30.5" cy="47" r="0.8" fill={color} opacity="0.5" />
            <circle cx="33.5" cy="47" r="0.8" fill={color} opacity="0.5" />
            {/* Sabatons */}
            <path d="M22 56 L33 56 L33 60 L24 60 Z" fill="#0f1418" />
            <path d="M31 56 L42 56 L40 60 L31 60 Z" fill="#0f1418" />
            <rect x="22" y="56" width="11" height="1" fill={color} />
            <rect x="31" y="56" width="11" height="1" fill={color} />
            {/* Corazza pesante scaglie di drago */}
            <path d="M22 27 L32 24 L42 27 L41 41 L32 43 L23 41 Z" fill="#37474f" />
            <path d="M23 28 L32 26 L41 28 L40 40 L32 41.5 L24 40 Z" fill="#455a64" opacity="0.7" />
            {/* Pattern scaglie */}
            <path d="M26 30 Q27 32 28 30 Q29 32 30 30 Q31 32 32 30 Q33 32 34 30 Q35 32 36 30 Q37 32 38 30"
              stroke={color} strokeWidth="0.4" fill="none" opacity="0.6" />
            <path d="M25 34 Q26 36 27 34 Q28 36 29 34 Q30 36 31 34 Q32 36 33 34 Q34 36 35 34 Q36 36 37 34 Q38 36 39 34"
              stroke={color} strokeWidth="0.4" fill="none" opacity="0.6" />
            {/* Gemma centrale a forma di drago/diamante */}
            <path d="M32 31 L34 34 L32 38 L30 34 Z" fill={color}>
              <animate attributeName="opacity" values="1;0.6;1" dur="2.4s" repeatCount="indefinite" />
            </path>
            <path d="M32 32 L33 34 L32 36 L31 34 Z" fill={light} />
            {/* Pauldroni a corna di drago */}
            <ellipse cx="21" cy="27" rx="5.5" ry="4.5" fill="#37474f" />
            <ellipse cx="21" cy="27" rx="4" ry="3" fill="#455a64" opacity="0.7" />
            <path d="M16 26 L17 21 L20 26 Z" fill={color} />
            <path d="M21 25 L23 19 L26 27 Z" fill={color} />
            <ellipse cx="43" cy="27" rx="5.5" ry="4.5" fill="#37474f" />
            <ellipse cx="43" cy="27" rx="4" ry="3" fill="#455a64" opacity="0.7" />
            <path d="M38 27 L41 19 L43 25 Z" fill={color} />
            <path d="M44 26 L47 21 L48 26 Z" fill={color} />
          </g>
          <g className="part-head">
            {/* ELMO da DRAGOON con corna */}
            <path d="M23 18 Q23 8 32 6 Q41 8 41 18 L41 22 L23 22 Z" fill="#37474f" />
            <path d="M24 18 Q25 10 32 8 Q39 10 40 18" fill="#455a64" opacity="0.7" />
            {/* Visiera con fessura */}
            <path d="M25 16 L39 16 L38 19 L26 19 Z" fill="#050505" />
            {/* Fessura visore */}
            <rect x="25" y="16" width="14" height="1.4" fill={color} opacity="0.85">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2.4s" repeatCount="indefinite" />
            </rect>
            {/* Corna laterali */}
            <path d="M22 14 Q18 8 16 10 Q19 14 22 16 Z" fill={color} />
            <path d="M42 14 Q46 8 48 10 Q45 14 42 16 Z" fill={color} />
            <path d="M22 14 Q19 11 18 11" stroke={light} strokeWidth="0.3" fill="none" />
            <path d="M42 14 Q45 11 46 11" stroke={light} strokeWidth="0.3" fill="none" />
            {/* Cresta centrale di crine */}
            <path d="M30 7 L31 3 L33 6 L35 3 L36 7" fill={color} stroke={dark} strokeWidth="0.3" />
            <path d="M30 7 L36 7" stroke="#5a1010" strokeWidth="2" />
            {/* Trim rarità */}
            <line x1="23" y1="11" x2="41" y2="11" stroke={color} strokeWidth="0.8" />
          </g>
          {/* BRACCIO SINISTRO + SCUDO con stemma drago */}
          <g className="part-arm-l">
            <rect x="17" y="28" width="6" height="14" rx="2" fill="#37474f" />
          </g>
          {/* BRACCIO DESTRO + LANCIA gigante ornata */}
          <g className="part-arm-r">
            <rect x="41" y="28" width="6" height="14" rx="2" fill="#37474f" />
            {/* Asta della lancia */}
            <rect x="48" y="14" width="3" height="46" rx="1" fill="#5d3a1f" />
            <rect x="48" y="14" width="3" height="46" rx="1" fill="url(#metal-grad)" opacity="0.15" />
            {/* Anelli decorativi */}
            <rect x="47.5" y="22" width="4" height="1.5" rx="0.5" fill={color} />
            <rect x="47.5" y="36" width="4" height="1.5" rx="0.5" fill={color} />
            <rect x="47.5" y="50" width="4" height="1.5" rx="0.5" fill={color} />
            {/* Bandiera al centro */}
            <path d="M51 18 Q56 19 56 24 Q56 28 51 27 Z" fill={color} />
            <path d="M52 20 L55 20 L54 22 L52 22 Z" fill={light} opacity="0.6" />
            {/* Punta della lancia (grande) */}
            <path d="M49.5 14 L43 4 L49.5 0 L56 4 L50 14 Z" fill="url(#metal-grad)" />
            <path d="M49.5 14 L46 6 L49.5 2 L53 6 L50 14 Z" fill={dark} opacity="0.4" />
            <line x1="49.5" y1="2" x2="49.5" y2="14" stroke={light} strokeWidth="0.4" />
            <circle cx="49.5" cy="3" r="0.8" fill={color}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>
      );

    case 'samurai':
      return (
        <g filter="url(#shadow)">
          {/* PETALI di sakura che cadono */}
          <g className="part-cape">
            <path d="M14 18 Q15 16 16 18 Q15 20 14 18 Z" fill={color} opacity="0.6">
              <animateTransform attributeName="transform" type="rotate" values="0 15 18;360 15 18" dur="6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
            </path>
            <path d="M50 30 Q51 28 52 30 Q51 32 50 30 Z" fill={light} opacity="0.5">
              <animateTransform attributeName="transform" type="rotate" values="0 51 30;-360 51 30" dur="7s" repeatCount="indefinite" />
            </path>
            <path d="M12 44 Q13 42 14 44 Q13 46 12 44 Z" fill={color} opacity="0.55">
              <animateTransform attributeName="transform" type="rotate" values="0 13 44;360 13 44" dur="5s" repeatCount="indefinite" />
            </path>
          </g>
          <g className="part-body">
            {/* Gambe hakama larghe */}
            <path d="M23 42 L21 58 L31 58 L31 42 Z" fill="#0a0e2e" />
            <path d="M33 42 L33 58 L43 58 L41 42 Z" fill="#0a0e2e" />
            {/* Pieghe hakama */}
            <line x1="26" y1="43" x2="25" y2="57" stroke="#1a237e" strokeWidth="0.4" />
            <line x1="38" y1="43" x2="39" y2="57" stroke="#1a237e" strokeWidth="0.4" />
            {/* Sandali geta */}
            <rect x="22" y="56" width="9" height="3" rx="0.5" fill="#3e2412" />
            <rect x="33" y="56" width="9" height="3" rx="0.5" fill="#3e2412" />
            <rect x="22" y="58.5" width="9" height="1.5" fill="#1a0e08" />
            <rect x="33" y="58.5" width="9" height="1.5" fill="#1a0e08" />
            {/* Kimono superiore */}
            <path d="M22 27 L21 42 L43 42 L42 27 Z" fill="#1a237e" />
            <path d="M23 28 L22 41 L42 41 L41 28 Z" fill="#2a347e" opacity="0.6" />
            {/* Sovrapposizione kimono diagonale */}
            <path d="M32 27 L24 42 L22 42 L30 27 Z" fill="#0a0e2e" />
            {/* Mon (stemma familiare) sul petto */}
            <circle cx="30" cy="33" r="2" fill={color} />
            <circle cx="30" cy="33" r="1.2" fill={light} />
            <circle cx="30" cy="33" r="0.5" fill={color} />
            {/* Cintura obi larga colore rarità */}
            <rect x="21" y="40" width="22" height="4" rx="0.5" fill={color} />
            <rect x="21" y="40" width="22" height="0.8" fill={light} />
            <rect x="21" y="43" width="22" height="0.5" fill={dark} />
            {/* Nodo obi */}
            <rect x="40" y="40.5" width="4" height="5" rx="0.5" fill={color} transform="rotate(8 42 43)" />
          </g>
          <g className="part-head">
            <circle cx="32" cy="20" r="9" fill={skin} />
            {/* Capelli tirati indietro */}
            <path d="M22 17 Q24 8 32 7 Q40 8 42 17 L42 22 Q39 13 32 12 Q25 13 22 22 Z" fill="#0a0a14" />
            {/* Chonmage (top knot) */}
            <ellipse cx="32" cy="8" rx="2.5" ry="1.8" fill="#0a0a14" />
            <ellipse cx="32" cy="6.5" rx="1.4" ry="2.5" fill="#0a0a14" />
            <rect x="31.3" y="6" width="1.4" height="2" fill={color} />
            {/* Banda frontale */}
            <rect x="23" y="14" width="18" height="1.8" fill="#e0e0e0" />
            <circle cx="32" cy="14.9" r="1.2" fill={color}>
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2.4s" repeatCount="indefinite" />
            </circle>
            {/* Occhi determinati con sopracciglia */}
            <line x1="26.5" y1="17.5" x2="31" y2="19" stroke="#0a0a14" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="33" y1="19" x2="37.5" y2="17.5" stroke="#0a0a14" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="29" cy="20" r="0.9" fill={color} />
            <circle cx="35" cy="20" r="0.9" fill={color} />
            {/* Espressione concentrata */}
            <line x1="30" y1="24" x2="34" y2="24" stroke="#7a5040" strokeWidth="0.5" />
          </g>
          {/* BRACCIO SINISTRO + KATANA al fianco (impugnatura visibile) */}
          <g className="part-arm-l">
            <rect x="20" y="29" width="4" height="8" rx="2" fill="#1a237e" />
            <rect x="15" y="32" width="6" height="4" rx="2" fill={skin} />
            {/* Saya (fodero) lunga */}
            <g transform="rotate(-15 17 38)">
              <rect x="16" y="38" width="3" height="20" rx="0.5" fill="#0a0a14" />
              <rect x="16" y="38" width="3" height="20" rx="0.5" fill={color} opacity="0.25" />
              <rect x="16" y="42" width="3" height="0.8" fill={color} />
              <rect x="16" y="50" width="3" height="0.8" fill={color} />
              {/* Tsuba (guard) */}
              <rect x="14.5" y="38" width="6" height="1.5" rx="0.5" fill="url(#metal-grad)" />
              <circle cx="17.5" cy="38.7" r="0.6" fill={color} />
              {/* Impugnatura legata */}
              <rect x="16.2" y="33" width="2.6" height="5" rx="0.4" fill="#3e2412" />
              <line x1="16.4" y1="34" x2="18.6" y2="34" stroke="#1a0e08" strokeWidth="0.3" />
              <line x1="16.4" y1="35.5" x2="18.6" y2="35.5" stroke="#1a0e08" strokeWidth="0.3" />
              <line x1="16.4" y1="37" x2="18.6" y2="37" stroke="#1a0e08" strokeWidth="0.3" />
              <circle cx="17.5" cy="33" r="0.8" fill="url(#metal-grad)" />
            </g>
          </g>
          {/* BRACCIO DESTRO + KATANA SGUAINATA in alto */}
          <g className="part-arm-r">
            <rect x="40" y="29" width="4" height="6" rx="2" fill="#1a237e" />
            <rect x="43" y="32" width="6" height="4" rx="2" fill={skin} />
            <g transform="rotate(35 47 34)">
              <circle cx="47" cy="40" r="1.7" fill="url(#metal-grad)" />
              <circle cx="47" cy="40" r="0.9" fill={color} />
              {/* Tsuka (impugnatura) */}
              <rect x="46" y="34" width="2" height="6" rx="0.4" fill="#3e2412" />
              <line x1="46.2" y1="35.5" x2="47.8" y2="35.5" stroke="#1a0e08" strokeWidth="0.4" />
              <line x1="46.2" y1="37.5" x2="47.8" y2="37.5" stroke="#1a0e08" strokeWidth="0.4" />
              {/* Tsuba quadrata */}
              <rect x="44" y="33.5" width="6" height="1.3" fill="url(#metal-grad)" />
              {/* Lama curva katana */}
              <path d="M45.5 33.5 Q46.5 18 48 8 Q48.8 18 48.5 33.5 Z" fill="url(#metal-grad)" />
              <path d="M46 33.5 Q46.8 22 47.8 12" stroke="#5a5a5a" strokeWidth="0.3" fill="none" />
              <path d="M48.5 33.5 Q48.8 20 48 10" stroke={light} strokeWidth="0.3" fill="none" opacity="0.85" />
              <circle cx="48" cy="8" r="0.7" fill={color}>
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>
        </g>
      );

    case 'necromante':
      return (
        <g filter="url(#shadow)">
          {/* TESCHI FLOTTANTI come spettri evocati */}
          <g className="part-cape">
            {/* Teschio piccolo sx */}
            <g opacity="0.7">
              <ellipse cx="12" cy="24" rx="2.5" ry="2" fill="#d8d0c0">
                <animate attributeName="cy" values="24;20;24" dur="3.5s" repeatCount="indefinite" />
              </ellipse>
              <circle cx="11" cy="24" r="0.6" fill="#00e676">
                <animate attributeName="cy" values="24;20;24" dur="3.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="13" cy="24" r="0.6" fill="#00e676">
                <animate attributeName="cy" values="24;20;24" dur="3.5s" repeatCount="indefinite" />
              </circle>
            </g>
            {/* Teschio piccolo dx */}
            <g opacity="0.6">
              <ellipse cx="52" cy="32" rx="2.2" ry="1.8" fill="#d8d0c0">
                <animate attributeName="cy" values="32;28;32" dur="4s" repeatCount="indefinite" />
              </ellipse>
              <circle cx="51.2" cy="32" r="0.5" fill="#00e676">
                <animate attributeName="cy" values="32;28;32" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="52.8" cy="32" r="0.5" fill="#00e676">
                <animate attributeName="cy" values="32;28;32" dur="4s" repeatCount="indefinite" />
              </circle>
            </g>
            {/* Nebbia oscura ai piedi */}
            <ellipse cx="32" cy="60" rx="22" ry="3" fill={color} opacity="0.15">
              <animate attributeName="rx" values="20;24;20" dur="3s" repeatCount="indefinite" />
            </ellipse>
          </g>
          <g className="part-body">
            {/* Veste lunga necromantica (più larga in basso) */}
            <path d="M22 28 L18 58 L46 58 L42 28 Z" fill="#0a0418" />
            <path d="M23 29 L20 56 L44 56 L41 29 Z" fill="#1a0a2e" />
            {/* Strisce verde-acido verticali */}
            <line x1="28" y1="30" x2="26" y2="56" stroke="#00e676" strokeWidth="0.4" opacity="0.5" />
            <line x1="36" y1="30" x2="38" y2="56" stroke="#00e676" strokeWidth="0.4" opacity="0.5" />
            {/* Bordo strappato in basso */}
            <path d="M18 58 L19 60 L21 58 L22 60 L24 58 L25 60 L27 58 L29 60 L30 58 L32 60 L34 58 L35 60 L37 58 L39 60 L40 58 L42 60 L43 58 L45 60 L46 58 Z" fill="#0a0418" />
            {/* TESCHIO grande sul petto */}
            <ellipse cx="32" cy="36" rx="3.5" ry="3" fill="#d8d0c0" />
            <ellipse cx="32" cy="34" rx="3.5" ry="2.5" fill="#e8e0d0" />
            <circle cx="30.5" cy="35" r="1" fill="#0a0418" />
            <circle cx="33.5" cy="35" r="1" fill="#0a0418" />
            {/* Occhi del teschio bagliore */}
            <circle cx="30.5" cy="35" r="0.5" fill="#00e676">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="33.5" cy="35" r="0.5" fill="#00e676">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Bocca del teschio */}
            <path d="M30 37.5 L30.5 38.5 L31.5 37.5 L32 38.5 L32.5 37.5 L33.5 38.5 L34 37.5" stroke="#0a0418" strokeWidth="0.6" fill="none" />
            {/* Cintura con ossi */}
            <rect x="22" y="42" width="20" height="2.5" rx="0.5" fill="#0a0418" />
            <ellipse cx="26" cy="43.2" rx="1" ry="0.7" fill="#d8d0c0" />
            <ellipse cx="32" cy="43.2" rx="1" ry="0.7" fill="#d8d0c0" />
            <ellipse cx="38" cy="43.2" rx="1" ry="0.7" fill="#d8d0c0" />
          </g>
          <g className="part-head">
            <circle cx="32" cy="18" r="9" fill={skin} opacity="0.5" />
            {/* CAPPUCCIO profondo che lascia il viso in ombra */}
            <path d="M21 22 Q21 6 32 4 Q43 6 43 22 L43 24 L21 24 Z" fill="#0a0418" />
            <path d="M22 22 Q22 8 32 6 Q42 8 42 22" fill="#1a0a2e" />
            <path d="M24 22 Q24 11 32 9 Q40 11 40 22" fill="#2a1040" opacity="0.7" />
            {/* Ombra interna del cappuccio */}
            <ellipse cx="32" cy="20" rx="7" ry="7" fill="#0a0418" opacity="0.7" />
            {/* Occhi maligni verdi */}
            <circle cx="29" cy="19" r="1.6" fill="#00e676">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="35" cy="19" r="1.6" fill="#00e676">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="29" cy="18.7" r="0.5" fill="#e8ffe8" />
            <circle cx="35" cy="18.7" r="0.5" fill="#e8ffe8" />
            {/* Glow attorno alla testa */}
            <ellipse cx="32" cy="18" rx="12" ry="11" fill={color} opacity="0.05" />
          </g>
          {/* BRACCIO SINISTRO + sfera di energia oscura */}
          <g className="part-arm-l">
            <rect x="20" y="30" width="4" height="6" rx="2" fill="#1a0a2e" />
            <rect x="14" y="34" width="6" height="4" rx="2" fill={skin} opacity="0.7" />
            <circle cx="14" cy="40" r="4.5" fill={color} opacity="0.3">
              <animate attributeName="r" values="3.5;5;3.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="14" cy="40" r="2.8" fill={color} opacity="0.65">
              <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="14" cy="40" r="1.3" fill="#00e676">
              <animate attributeName="r" values="1;1.6;1" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Particella dell'energia che si stacca */}
            <circle cx="11" cy="43" r="0.6" fill={color} opacity="0.5">
              <animate attributeName="cy" values="43;47;43" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
          {/* BRACCIO DESTRO + STAFF con teschio */}
          <g className="part-arm-r">
            <rect x="40" y="30" width="4" height="6" rx="2" fill="#1a0a2e" />
            <rect x="44" y="34" width="6" height="4" rx="2" fill={skin} opacity="0.7" />
            {/* Asta nera */}
            <rect x="46.5" y="14" width="2.5" height="44" rx="1" fill="#0a0418" />
            <rect x="46.5" y="14" width="2.5" height="44" rx="1" fill={color} opacity="0.15" />
            <line x1="46.5" y1="26" x2="49" y2="26" stroke={color} strokeWidth="0.4" />
            <line x1="46.5" y1="42" x2="49" y2="42" stroke={color} strokeWidth="0.4" />
            {/* Teschio in cima */}
            <ellipse cx="47.75" cy="11" rx="3.5" ry="3" fill="#d8d0c0" />
            <ellipse cx="47.75" cy="10" rx="3.5" ry="2.5" fill="#e8e0d0" />
            <circle cx="46.5" cy="11" r="0.9" fill="#0a0418" />
            <circle cx="49" cy="11" r="0.9" fill="#0a0418" />
            <circle cx="46.5" cy="11" r="0.5" fill="#00e676">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="49" cy="11" r="0.5" fill="#00e676">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            <path d="M46 13 L46.5 14 L47.25 13.5 L48 14 L48.75 13" stroke="#0a0418" strokeWidth="0.5" fill="none" />
            {/* Corona di spine sul teschio */}
            <path d="M45 9 L46 7 L47 9 L48 7 L49 9 L50 7 L50.5 9" stroke={color} strokeWidth="0.6" fill="none" />
            {/* Aura oscura sopra */}
            <circle cx="47.75" cy="9" r="5" fill={color} opacity="0.2">
              <animate attributeName="r" values="4;6;4" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>
      );

    case 'alchimista':
      return (
        <g filter="url(#shadow)">
          {/* FUMI ED ESPLOSIONI nello sfondo */}
          <g className="part-cape">
            <circle cx="50" cy="22" r="2.5" fill={color} opacity="0.3">
              <animate attributeName="r" values="2;3.5;2" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="cy" values="22;18;22" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="13" cy="30" r="1.8" fill="#4caf50" opacity="0.4">
              <animate attributeName="cy" values="30;26;30" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="11" cy="20" r="1.2" fill="#f44336" opacity="0.5">
              <animate attributeName="cy" values="20;14;20" dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.6s" repeatCount="indefinite" />
            </circle>
          </g>
          <g className="part-body">
            {/* Camice lungo bianco */}
            <path d="M23 27 L21 58 L43 58 L41 27 Z" fill="#f5f5f5" />
            <path d="M24 28 L22 56 L42 56 L40 28 Z" fill="#e8e8e8" />
            {/* Bottoni del camice */}
            <circle cx="32" cy="32" r="0.7" fill={color} />
            <circle cx="32" cy="36" r="0.7" fill={color} />
            <circle cx="32" cy="50" r="0.7" fill={color} />
            {/* Tasca laterale con scrolls */}
            <rect x="36" y="44" width="6" height="8" rx="1" fill="#d8d8d8" />
            <line x1="36" y1="48" x2="42" y2="48" stroke="#a8a8a8" strokeWidth="0.4" />
            <rect x="37.5" y="42" width="3" height="3" rx="0.5" fill="#5d3a1f" />
            {/* Cintura con fiale colorate */}
            <rect x="22" y="40" width="20" height="2.5" rx="0.5" fill="#5d3a1f" />
            <rect x="22" y="40" width="20" height="0.8" fill={color} />
            {/* Fialette tipo bottoni */}
            <g>
              <rect x="24" y="37" width="2.5" height="5" rx="0.8" fill="#4caf50" />
              <rect x="24" y="37" width="2.5" height="1" rx="0.5" fill="#5d3a1f" />
              <circle cx="25.25" cy="40" r="0.4" fill="#a8eba8" />
            </g>
            <g>
              <rect x="28" y="37" width="2.5" height="5" rx="0.8" fill="#f44336" />
              <rect x="28" y="37" width="2.5" height="1" rx="0.5" fill="#5d3a1f" />
              <circle cx="29.25" cy="40" r="0.4" fill="#ffaaaa" />
            </g>
            <g>
              <rect x="33.5" y="37" width="2.5" height="5" rx="0.8" fill="#2196f3" />
              <rect x="33.5" y="37" width="2.5" height="1" rx="0.5" fill="#5d3a1f" />
              <circle cx="34.75" cy="40" r="0.4" fill="#aaddff" />
            </g>
            <g>
              <rect x="37.5" y="37" width="2.5" height="5" rx="0.8" fill={color} />
              <rect x="37.5" y="37" width="2.5" height="1" rx="0.5" fill="#5d3a1f" />
              <circle cx="38.75" cy="40" r="0.4" fill={light} />
            </g>
            {/* Scarpe da lab */}
            <rect x="24" y="55" width="8" height="4" rx="1" fill="#5d3a1f" />
            <rect x="32" y="55" width="8" height="4" rx="1" fill="#5d3a1f" />
          </g>
          <g className="part-head">
            <circle cx="32" cy="18" r="9" fill={skin} />
            {/* Capelli arruffati ARANCIONI */}
            <path d="M22 14 Q23 6 26 8 Q28 4 30 7 Q31 3 32 7 Q33 3 34 7 Q36 4 38 8 Q41 6 42 14 Q40 16 38 14 Q36 16 34 14 Q32 16 30 14 Q28 16 26 14 Q24 16 22 14 Z" fill="#ff8f00" />
            <path d="M24 12 Q26 8 28 11" stroke="#cc6600" strokeWidth="0.4" fill="none" />
            <path d="M36 11 Q38 8 40 12" stroke="#cc6600" strokeWidth="0.4" fill="none" />
            {/* OCCHIALONI grandi (stile aviatore lab) */}
            <ellipse cx="28" cy="19" rx="4.5" ry="3.8" fill="#0a0a14" />
            <ellipse cx="36" cy="19" rx="4.5" ry="3.8" fill="#0a0a14" />
            <ellipse cx="28" cy="19" rx="3.6" ry="3" fill="#bbdefb" opacity="0.4" />
            <ellipse cx="36" cy="19" rx="3.6" ry="3" fill="#bbdefb" opacity="0.4" />
            {/* Riflesso lenti */}
            <ellipse cx="27" cy="18" rx="1.2" ry="0.8" fill="#fff" opacity="0.7" />
            <ellipse cx="35" cy="18" rx="1.2" ry="0.8" fill="#fff" opacity="0.7" />
            {/* Banda elastica degli occhialoni */}
            <line x1="32.5" y1="19" x2="31.5" y2="19" stroke="#5d3a1f" strokeWidth="1.5" />
            <path d="M23.5 19 Q22 18 21 19" stroke="#5d3a1f" strokeWidth="1.2" fill="none" />
            <path d="M40.5 19 Q42 18 43 19" stroke="#5d3a1f" strokeWidth="1.2" fill="none" />
            {/* Pupille concentratissime */}
            <circle cx="28" cy="19.5" r="1" fill={color}>
              <animate attributeName="r" values="0.8;1.2;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="36" cy="19.5" r="1" fill={color}>
              <animate attributeName="r" values="0.8;1.2;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="28" cy="19.5" r="0.3" fill="#fff" />
            <circle cx="36" cy="19.5" r="0.3" fill="#fff" />
            {/* Sorriso da scienziato pazzo */}
            <path d="M30 24 Q31 25.5 32 25.5 Q33 25.5 34 24" stroke="#7a5040" strokeWidth="0.6" fill="none" />
          </g>
          {/* BRACCIO SINISTRO + LIBRO/PERGAMENA con formule */}
          <g className="part-arm-l">
            <rect x="20" y="30" width="4" height="6" rx="2" fill="#f5f5f5" />
            <rect x="13" y="32" width="9" height="10" rx="0.5" fill="#f5e8c8" />
            <rect x="13" y="32" width="9" height="10" rx="0.5" fill={color} opacity="0.15" />
            {/* Bordo libro */}
            <rect x="13" y="32" width="9" height="1.2" fill="#5d3a1f" />
            <rect x="13" y="40.8" width="9" height="1.2" fill="#5d3a1f" />
            {/* Formule scribacchiate */}
            <line x1="14.5" y1="35" x2="20.5" y2="35" stroke="#5d3a1f" strokeWidth="0.3" />
            <line x1="14.5" y1="37" x2="19" y2="37" stroke="#5d3a1f" strokeWidth="0.3" />
            <line x1="14.5" y1="39" x2="20.5" y2="39" stroke="#5d3a1f" strokeWidth="0.3" />
            {/* Simbolo alchemico al centro */}
            <circle cx="17.5" cy="37" r="1.5" fill="none" stroke={color} strokeWidth="0.4" />
            <line x1="16" y1="37" x2="19" y2="37" stroke={color} strokeWidth="0.4" />
          </g>
          {/* BRACCIO DESTRO + FIASCA che bolle */}
          <g className="part-arm-r">
            <rect x="40" y="30" width="4" height="6" rx="2" fill="#f5f5f5" />
            <rect x="42" y="34" width="6" height="4" rx="2" fill={skin} />
            {/* Beuta */}
            <rect x="46" y="32" width="2.5" height="3" rx="0.4" fill="#5d3a1f" />
            <path d="M45 35 L50 35 L52 44 Q52 47 49 47 L47 47 Q44 47 44 44 Z" fill={color} opacity="0.3" />
            <path d="M45 35 L50 35 L52 44 Q52 47 49 47 L47 47 Q44 47 44 44 Z" fill="url(#metal-grad)" opacity="0.2" />
            <path d="M46 36 L49.5 36 L51 43 Q51 46 49 46 L47 46 Q45 46 45 43 Z" fill={color} opacity="0.6" />
            {/* Liquido che si muove */}
            <ellipse cx="48" cy="44" rx="3" ry="0.8" fill={light} opacity="0.6">
              <animate attributeName="cy" values="44;43;44" dur="1.6s" repeatCount="indefinite" />
            </ellipse>
            {/* Bolle */}
            <circle cx="47" cy="42" r="0.4" fill="#fff" opacity="0.7">
              <animate attributeName="cy" values="44;38;44" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="49" cy="43" r="0.5" fill="#fff" opacity="0.6">
              <animate attributeName="cy" values="45;38;45" dur="2.3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.3s" repeatCount="indefinite" />
            </circle>
            {/* Fumo che sale dalla beuta */}
            <circle cx="47.5" cy="29" r="1.4" fill={color} opacity="0.4">
              <animate attributeName="cy" values="29;22;15" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.2;0" dur="3s" repeatCount="indefinite" />
              <animate attributeName="r" values="1.4;2;2.4" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="48.5" cy="28" r="1.1" fill={color} opacity="0.35">
              <animate attributeName="cy" values="28;20;13" dur="3.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0.15;0" dur="3.4s" repeatCount="indefinite" />
            </circle>
          </g>
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
        <g filter="url(#shadow)">
          <g className="part-body">
            {/* Corpo infuocato */}
            <path d="M20 48 Q16 36 22 28 Q28 22 32 18 Q36 22 42 28 Q48 36 44 48 Z" fill="#e65100" />
            <path d="M24 46 Q20 38 26 32 Q30 26 32 22 Q34 26 38 32 Q44 38 40 46 Z" fill="#ff6d00" />
            <path d="M27 40 Q32 44 37 40" fill="#ffab00" />
          </g>
          <g className="part-head">
            <path d="M26 22 Q24 12 28 8 Q30 14 32 18" fill="#ffab00" opacity="0.8">
              <animate attributeName="d" values="M26 22 Q24 12 28 8 Q30 14 32 18;M26 22 Q22 10 26 6 Q30 12 32 18;M26 22 Q24 12 28 8 Q30 14 32 18" dur="0.8s" repeatCount="indefinite" />
            </path>
            <circle cx="28" cy="32" r="3" fill="#fff" />
            <circle cx="36" cy="32" r="3" fill="#fff" />
            <circle cx="28" cy="32" r="1.5" fill="#b71c1c" />
            <circle cx="36" cy="32" r="1.5" fill="#b71c1c" />
          </g>
          <g className="part-arm-l">
            <path d="M20 34 L10 30 L8 26" fill="none" stroke="#e65100" strokeWidth="4" strokeLinecap="round" />
          </g>
          <g className="part-arm-r">
            <path d="M44 34 L54 30 L56 26" fill="none" stroke="#e65100" strokeWidth="4" strokeLinecap="round" />
          </g>
        </g>
      );

    case 'Re del Vuoto':
      return (
        <g filter="url(#shadow)">
          <g className="part-body">
            {/* Corpo etereo */}
            <path d="M20 48 Q16 34 24 24 Q28 18 32 14 Q36 18 40 24 Q48 34 44 48 Q38 56 32 56 Q26 56 20 48Z" fill="#311b92" opacity="0.9" />
            <path d="M24 46 Q20 36 28 28 Q30 22 32 18 Q34 22 36 28 Q44 36 40 46 Q36 52 32 52 Q28 52 24 46Z" fill="#4527a0" />
          </g>
          <g className="part-head">
            {/* Corona */}
            <polygon points="24,20 26,10 28,18 30,8 32,18 34,8 36,18 38,10 40,20" fill="#ffd600" />
            {/* Occhi void */}
            <circle cx="28" cy="32" r="3" fill="#e040fb">
              <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="36" cy="32" r="3" fill="#e040fb">
              <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
          <g className="part-arm-l">
            <path d="M20 36 L12 40 L10 44" fill="none" stroke="#4527a0" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          </g>
          <g className="part-arm-r">
            <path d="M44 36 L52 40 L54 44" fill="none" stroke="#4527a0" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          </g>
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
