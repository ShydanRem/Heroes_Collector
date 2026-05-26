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
        <defs>
          <filter id="m-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" />
            <feOffset dx="0.5" dy="1" result="moff" />
            <feComponentTransfer><feFuncA type="linear" slope="0.45" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="m-eye-glow">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#ff3d00" />
          </radialGradient>
        </defs>
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
        <g filter="url(#m-shadow)">
          <defs>
            <radialGradient id="slime-body" cx="42%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#b06be6" />
              <stop offset="55%" stopColor="#6b2fa0" />
              <stop offset="100%" stopColor="#360a5e" />
            </radialGradient>
            <radialGradient id="slime-eye">
              <stop offset="0%" stopColor="#fffde7" />
              <stop offset="55%" stopColor="#ffee58" />
              <stop offset="100%" stopColor="#f9a825" />
            </radialGradient>
          </defs>

          {/* ombra a terra */}
          <ellipse cx="32" cy="52" rx="20" ry="4.5" fill="#1a0a2e" opacity="0.45" />

          {/* corpo blob che pulsa */}
          <path d="M14 42 Q12 27 22 21 Q28 17 32 16 Q36 17 42 21 Q52 27 50 42 Q48 52 32 52 Q16 52 14 42 Z" fill="url(#slime-body)">
            <animate attributeName="d" values="M14 42 Q12 27 22 21 Q28 17 32 16 Q36 17 42 21 Q52 27 50 42 Q48 52 32 52 Q16 52 14 42 Z;M15 41 Q13 26 23 20 Q28 16 32 15 Q36 16 41 20 Q51 26 49 41 Q47 53 32 53 Q17 53 15 41 Z;M14 42 Q12 27 22 21 Q28 17 32 16 Q36 17 42 21 Q52 27 50 42 Q48 52 32 52 Q16 52 14 42 Z" dur="2.6s" repeatCount="indefinite" />
          </path>

          {/* highlight gloss */}
          <ellipse cx="25" cy="27" rx="5" ry="3.4" fill="#d8a8f5" opacity="0.55" />
          <ellipse cx="23" cy="25" rx="2" ry="1.2" fill="#fff" opacity="0.5" />

          {/* bolle interne */}
          <circle cx="38" cy="40" r="2.2" fill="#360a5e" opacity="0.5" />
          <circle cx="30" cy="46" r="1.4" fill="#360a5e" opacity="0.4" />

          {/* occhi maligni */}
          <ellipse cx="26" cy="35" rx="3.2" ry="3.6" fill="url(#slime-eye)" />
          <ellipse cx="38" cy="35" rx="3.2" ry="3.6" fill="url(#slime-eye)" />
          <ellipse cx="26.6" cy="36" rx="1.3" ry="2" fill="#1a0033" />
          <ellipse cx="38.6" cy="36" rx="1.3" ry="2" fill="#1a0033" />
          {/* sopracciglia arrabbiate */}
          <path d="M22 31 L29 33" stroke="#2a0540" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M42 31 L35 33" stroke="#2a0540" strokeWidth="1.1" strokeLinecap="round" />
          {/* bocca ghignante */}
          <path d="M27 43 Q32 47 37 43 Q34 44 32 44 Q30 44 27 43 Z" fill="#1a0033" />

          {/* goccia che cola */}
          <ellipse cx="48" cy="46" rx="1.8" ry="2.6" fill="url(#slime-body)" opacity="0.85">
            <animate attributeName="cy" values="44;56;44" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0;0.9" dur="2.8s" repeatCount="indefinite" />
          </ellipse>
        </g>
      );
    case 'Goblin':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="gob-skin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6fa83c" />
              <stop offset="100%" stopColor="#3a6420" />
            </linearGradient>
            <linearGradient id="gob-blade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8e8e8" />
              <stop offset="100%" stopColor="#7a7a7a" />
            </linearGradient>
          </defs>

          {/* gambe corte */}
          <rect x="25" y="46" width="6" height="9" rx="2" fill="#2f5019" />
          <rect x="33" y="46" width="6" height="9" rx="2" fill="#2f5019" />
          <ellipse cx="27.5" cy="55" rx="4" ry="2.2" fill="#241208" />
          <ellipse cx="36.5" cy="55" rx="4" ry="2.2" fill="#241208" />

          {/* corpo + gilet di cuoio */}
          <path d="M24 31 Q23 44 26 47 L38 47 Q41 44 40 31 Q32 28 24 31 Z" fill="url(#gob-skin)" />
          <path d="M26 32 L26 46 L30 46 L29 33 Z" fill="#5a3410" />
          <path d="M38 32 L38 46 L34 46 L35 33 Z" fill="#5a3410" />
          <rect x="28" y="40" width="8" height="2" rx="0.5" fill="#3a2208" />
          <circle cx="32" cy="41" r="0.9" fill="#caa05a" />

          {/* braccio sx + braccio dx con pugnale */}
          <path d="M24 33 Q18 36 16 41 L19 43 Q22 38 26 37 Z" fill="url(#gob-skin)" />
          <g transform="rotate(18 44 38)">
            <path d="M40 33 Q46 35 48 40 L45 42 Q42 38 38 37 Z" fill="url(#gob-skin)" />
            <rect x="46" y="38" width="5" height="2.4" rx="0.6" fill="#3a2208" />
            <polygon points="51,39.2 62,37 51,41" fill="url(#gob-blade)" />
            <polygon points="51,39.2 58,38.6 51,40.2" fill="#fff" opacity="0.4" />
          </g>

          {/* testa grande */}
          <ellipse cx="32" cy="21" rx="12" ry="10" fill="url(#gob-skin)" />
          {/* orecchie a punta */}
          <path d="M20 18 L9 11 L18 21 Z" fill="url(#gob-skin)" />
          <path d="M44 18 L55 11 L46 21 Z" fill="url(#gob-skin)" />
          <path d="M20 18 L12 13 L18 20 Z" fill="#2f5019" />
          <path d="M44 18 L52 13 L46 20 Z" fill="#2f5019" />
          {/* occhi che brillano */}
          <ellipse cx="27" cy="20" rx="3.2" ry="3" fill="url(#m-eye-glow)" />
          <ellipse cx="37" cy="20" rx="3.2" ry="3" fill="url(#m-eye-glow)" />
          <circle cx="27.6" cy="20.4" r="1.2" fill="#1a0a00" />
          <circle cx="37.6" cy="20.4" r="1.2" fill="#1a0a00" />
          <path d="M23 16 L30 18 M41 16 L34 18" stroke="#2f5019" strokeWidth="1" strokeLinecap="round" />
          {/* naso adunco */}
          <path d="M32 21 Q30 25 32 27 Q34 26 33 23 Z" fill="#3a6420" />
          {/* ghigno con zanne */}
          <path d="M27 28 Q32 31 37 28" fill="none" stroke="#1a0a00" strokeWidth="1" />
          <polygon points="29,28 30,31 31,28" fill="#fff" />
          <polygon points="34,28 35,31 36,28" fill="#fff" />
        </g>
      );
    case 'Pipistrello Vampiro':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="bat-wing" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a2768" />
              <stop offset="100%" stopColor="#1c0f2e" />
            </linearGradient>
            <radialGradient id="bat-body" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#5e3a82" />
              <stop offset="100%" stopColor="#2a1840" />
            </radialGradient>
          </defs>

          {/* ala sx che sbatte */}
          <path d="M24 30 Q12 20 4 24 Q9 26 8 30 Q13 29 15 33 Q19 31 22 35 Z" fill="url(#bat-wing)" stroke="#160a26" strokeWidth="0.5">
            <animate attributeName="d" values="M24 30 Q12 20 4 24 Q9 26 8 30 Q13 29 15 33 Q19 31 22 35 Z;M24 30 Q13 24 6 30 Q10 31 10 34 Q14 33 16 36 Q19 34 22 37 Z;M24 30 Q12 20 4 24 Q9 26 8 30 Q13 29 15 33 Q19 31 22 35 Z" dur="0.7s" repeatCount="indefinite" />
          </path>
          {/* ala dx che sbatte */}
          <path d="M40 30 Q52 20 60 24 Q55 26 56 30 Q51 29 49 33 Q45 31 42 35 Z" fill="url(#bat-wing)" stroke="#160a26" strokeWidth="0.5">
            <animate attributeName="d" values="M40 30 Q52 20 60 24 Q55 26 56 30 Q51 29 49 33 Q45 31 42 35 Z;M40 30 Q51 24 58 30 Q54 31 54 34 Q50 33 48 36 Q45 34 42 37 Z;M40 30 Q52 20 60 24 Q55 26 56 30 Q51 29 49 33 Q45 31 42 35 Z" dur="0.7s" repeatCount="indefinite" />
          </path>

          {/* corpo peloso */}
          <ellipse cx="32" cy="36" rx="8" ry="10" fill="url(#bat-body)" />
          <path d="M26 33 Q32 31 38 33 Q37 30 32 30 Q27 30 26 33 Z" fill="#6e4a92" opacity="0.6" />
          {/* zampette */}
          <path d="M29 45 L28 49 M32 46 L32 50 M35 45 L36 49" stroke="#1c0f2e" strokeWidth="1" strokeLinecap="round" />

          {/* testa */}
          <circle cx="32" cy="26" r="7.5" fill="url(#bat-body)" />
          {/* orecchie */}
          <path d="M26 22 L22 12 L30 20 Z" fill="url(#bat-body)" />
          <path d="M38 22 L42 12 L34 20 Z" fill="url(#bat-body)" />
          <path d="M26 21 L24 15 L29 20 Z" fill="#3a2456" />
          <path d="M38 21 L40 15 L35 20 Z" fill="#3a2456" />
          {/* occhi che brillano */}
          <ellipse cx="28.5" cy="25" rx="2.4" ry="2.6" fill="url(#m-eye-glow)">
            <animate attributeName="ry" values="2.4;2.8;2.4" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="35.5" cy="25" rx="2.4" ry="2.6" fill="url(#m-eye-glow)">
            <animate attributeName="ry" values="2.4;2.8;2.4" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="28.8" cy="25.3" r="0.9" fill="#3a0000" />
          <circle cx="35.8" cy="25.3" r="0.9" fill="#3a0000" />
          {/* naso + zanne */}
          <path d="M31 28 Q32 29.5 33 28 Z" fill="#1c0f2e" />
          <polygon points="30,30 30.6,33 31.2,30" fill="#fff" />
          <polygon points="32.8,30 33.4,33 34,30" fill="#fff" />
        </g>
      );
    case 'Scheletro':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="skel-bone" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f3eede" />
              <stop offset="100%" stopColor="#b8ad94" />
            </linearGradient>
            <radialGradient id="skel-eye">
              <stop offset="0%" stopColor="#d6fff0" />
              <stop offset="50%" stopColor="#26e0a3" />
              <stop offset="100%" stopColor="#0a6b4a" />
            </radialGradient>
          </defs>

          {/* gambe ossee */}
          <rect x="28" y="44" width="2.4" height="12" rx="1" fill="url(#skel-bone)" />
          <rect x="33.6" y="44" width="2.4" height="12" rx="1" fill="url(#skel-bone)" />
          <ellipse cx="29.2" cy="56" rx="3" ry="1.6" fill="#9c9078" />
          <ellipse cx="34.8" cy="56" rx="3" ry="1.6" fill="#9c9078" />
          {/* bacino */}
          <path d="M27 42 Q32 46 37 42 L36 44 Q32 47 28 44 Z" fill="url(#skel-bone)" />

          {/* spina + gabbia toracica */}
          <rect x="30.6" y="28" width="2.8" height="15" rx="1" fill="#cfc6ac" />
          <path d="M26 30 Q32 33 38 30 M25.5 33 Q32 36 38.5 33 M26 36 Q32 39 38 36" fill="none" stroke="url(#skel-bone)" strokeWidth="1.8" strokeLinecap="round" />
          {/* clavicole/spalle */}
          <path d="M24 28 Q32 25 40 28" fill="none" stroke="url(#skel-bone)" strokeWidth="2.2" strokeLinecap="round" />

          {/* braccio sx osseo */}
          <path d="M24 29 L18 36 L20 44" fill="none" stroke="url(#skel-bone)" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20" cy="44" r="1.6" fill="url(#skel-bone)" />
          {/* braccio dx con spada arrugginita */}
          <path d="M40 29 L45 35 L44 41" fill="none" stroke="url(#skel-bone)" strokeWidth="2.2" strokeLinecap="round" />
          <g transform="rotate(8 44 40)">
            <rect x="42.8" y="38" width="2.4" height="4" rx="0.5" fill="#3a2a18" />
            <rect x="40.5" y="37.4" width="7" height="1.6" rx="0.5" fill="#6b5230" />
            <path d="M43 37.4 L42 14 L45 16 L46 37.4 Z" fill="#8a8470" />
            <path d="M43.4 37 L42.6 16" stroke="#b8b29c" strokeWidth="0.4" />
            <path d="M44 24 L46.5 23 M43.6 30 L45.8 29.2" stroke="#5a5444" strokeWidth="0.5" />
          </g>

          {/* teschio */}
          <path d="M24 18 Q24 9 32 8 Q40 9 40 18 Q40 24 36 26 L28 26 Q24 24 24 18 Z" fill="url(#skel-bone)" />
          {/* orbite incandescenti */}
          <ellipse cx="28.5" cy="18" rx="3" ry="3.4" fill="#1a1208" />
          <ellipse cx="35.5" cy="18" rx="3" ry="3.4" fill="#1a1208" />
          <circle cx="28.5" cy="18.4" r="1.6" fill="url(#skel-eye)">
            <animate attributeName="r" values="1.3;1.9;1.3" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="35.5" cy="18.4" r="1.6" fill="url(#skel-eye)">
            <animate attributeName="r" values="1.3;1.9;1.3" dur="2.2s" repeatCount="indefinite" />
          </circle>
          {/* naso + denti */}
          <polygon points="32,21 30.6,24 33.4,24" fill="#6b6450" />
          <path d="M28 26 L36 26 L35.4 29 L28.6 29 Z" fill="#e7e0cc" />
          <path d="M30 26 L30 29 M32 26 L32 29 M34 26 L34 29" stroke="#9c9078" strokeWidth="0.5" />
        </g>
      );
    case 'Fuocofatuo':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <radialGradient id="wisp-core" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#eafdff" />
              <stop offset="45%" stopColor="#5ad6ff" />
              <stop offset="100%" stopColor="#1565c0" />
            </radialGradient>
            <radialGradient id="wisp-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5ad6ff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#1565c0" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3s" repeatCount="indefinite" />

            {/* alone */}
            <circle cx="32" cy="30" r="20" fill="url(#wisp-aura)">
              <animate attributeName="r" values="17;21;17" dur="2.4s" repeatCount="indefinite" />
            </circle>

            {/* corpo a fiamma */}
            <path d="M32 12 Q40 22 39 32 Q39 44 32 48 Q25 44 25 32 Q24 22 32 12 Z" fill="url(#wisp-core)">
              <animate attributeName="d" values="M32 12 Q40 22 39 32 Q39 44 32 48 Q25 44 25 32 Q24 22 32 12 Z;M32 11 Q41 21 39 33 Q38 45 32 49 Q26 45 25 33 Q23 21 32 11 Z;M32 12 Q40 22 39 32 Q39 44 32 48 Q25 44 25 32 Q24 22 32 12 Z" dur="1.6s" repeatCount="indefinite" />
            </path>
            {/* nucleo chiaro */}
            <ellipse cx="32" cy="32" rx="5" ry="8" fill="#eafdff" opacity="0.7" />

            {/* faccino spettrale */}
            <ellipse cx="29" cy="30" rx="1.6" ry="2.4" fill="#0b3a66" />
            <ellipse cx="35" cy="30" rx="1.6" ry="2.4" fill="#0b3a66" />
            <path d="M29 37 Q32 40 35 37 Q32 38.5 29 37 Z" fill="#0b3a66" />
          </g>

          {/* scintille che salgono */}
          <circle cx="26" cy="40" r="0.8" fill="#aef0ff">
            <animate attributeName="cy" values="44;14;44" dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.9;0" dur="3.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="39" cy="42" r="0.7" fill="#7fdcff">
            <animate attributeName="cy" values="46;18;46" dur="3.8s" begin="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.8;0" dur="3.8s" begin="1s" repeatCount="indefinite" />
          </circle>
        </g>
      );
    case 'Ratto Gigante':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="rat-fur" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7a6e60" />
              <stop offset="100%" stopColor="#43392e" />
            </linearGradient>
          </defs>

          {/* coda lunga che ondeggia */}
          <path d="M16 44 Q4 44 5 36 Q6 30 11 31" fill="none" stroke="#caa78c" strokeWidth="2" strokeLinecap="round">
            <animate attributeName="d" values="M16 44 Q4 44 5 36 Q6 30 11 31;M16 44 Q3 45 4 37 Q5 29 11 30;M16 44 Q4 44 5 36 Q6 30 11 31" dur="2.4s" repeatCount="indefinite" />
          </path>

          {/* corpo gobbo */}
          <path d="M16 46 Q14 32 28 30 Q44 28 50 38 Q52 44 46 48 Q32 52 22 50 Q17 49 16 46 Z" fill="url(#rat-fur)" />
          {/* dorso piu chiaro */}
          <path d="M22 33 Q34 30 46 38" fill="none" stroke="#8f8273" strokeWidth="1.4" opacity="0.6" strokeLinecap="round" />

          {/* zampe + artigli */}
          <path d="M26 50 L25 56 M30 51 L30 56" stroke="#43392e" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M44 48 L45 55 M48 46 L50 53" stroke="#43392e" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M24 56 L23 58 M25 56 L25 58 M29 56 L29 58 M31 56 L31 58" stroke="#e7dcc8" strokeWidth="0.6" strokeLinecap="round" />

          {/* testa con muso appuntito (verso dx) */}
          <path d="M44 36 Q56 34 61 40 Q62 43 59 44 Q54 45 50 44 Q46 43 44 40 Z" fill="url(#rat-fur)" />
          {/* orecchio tondo */}
          <circle cx="46" cy="33" r="4" fill="url(#rat-fur)" />
          <circle cx="46" cy="33" r="2.2" fill="#caa78c" opacity="0.7" />
          {/* naso */}
          <circle cx="61" cy="41" r="1.3" fill="#3a2a20" />
          {/* baffi */}
          <path d="M58 42 L63 43 M58 42.6 L63 44.4 M58 41.2 L63 41" stroke="#e7dcc8" strokeWidth="0.4" opacity="0.8" />
          {/* dente */}
          <path d="M57 43 L57.4 46 L58.2 43 Z" fill="#fff" />
          {/* occhio rosso */}
          <circle cx="52" cy="39" r="1.8" fill="url(#m-eye-glow)">
            <animate attributeName="r" values="1.5;2;1.5" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="52.3" cy="39.2" r="0.7" fill="#2a0000" />
        </g>
      );
    case 'Orco Guerriero':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="orc-skin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#74944f" />
              <stop offset="100%" stopColor="#36481f" />
            </linearGradient>
            <linearGradient id="orc-blade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8e8e8" />
              <stop offset="100%" stopColor="#6f6f6f" />
            </linearGradient>
          </defs>

          {/* gambe tozze */}
          <rect x="25" y="46" width="6.5" height="10" rx="2" fill="#34461f" />
          <rect x="32.5" y="46" width="6.5" height="10" rx="2" fill="#34461f" />
          <ellipse cx="28" cy="56" rx="4.2" ry="2.2" fill="#241404" />
          <ellipse cx="36" cy="56" rx="4.2" ry="2.2" fill="#241404" />

          {/* torso massiccio */}
          <path d="M21 30 Q19 45 26 48 L38 48 Q45 45 43 30 Q32 26 21 30 Z" fill="url(#orc-skin)" />
          <path d="M26 32 Q32 35 38 32" stroke="#2f421c" strokeWidth="1" fill="none" />
          {/* cinghia + cintura */}
          <path d="M22 33 L42 40 L42 42 L22 35 Z" fill="#4a3418" />
          <rect x="24" y="44" width="16" height="3" rx="1" fill="#3a2810" />

          {/* spalle e braccia enormi */}
          <ellipse cx="20" cy="31" rx="5" ry="5.5" fill="url(#orc-skin)" />
          <ellipse cx="44" cy="31" rx="5" ry="5.5" fill="url(#orc-skin)" />
          <path d="M17 33 Q14 40 17 45 L21 44 Q19 39 21 35 Z" fill="url(#orc-skin)" />
          <path d="M47 33 Q50 39 48 45 L44 44 Q46 39 44 35 Z" fill="url(#orc-skin)" />

          {/* ASCIA da guerra */}
          <g transform="rotate(12 50 30)">
            <rect x="49" y="10" width="2.4" height="38" rx="1" fill="#4a3418" />
            <path d="M44 12 Q58 10 56 24 Q50 20 44 22 Z" fill="url(#orc-blade)" />
            <path d="M45 14 Q54 13 55 21" stroke="#fff" strokeWidth="0.5" fill="none" opacity="0.4" />
          </g>

          {/* testa */}
          <ellipse cx="32" cy="20" rx="10" ry="9" fill="url(#orc-skin)" />
          {/* mascella sporgente */}
          <path d="M25 24 Q32 30 39 24 Q38 28 32 28 Q26 28 25 24 Z" fill="url(#orc-skin)" />
          {/* zanne */}
          <polygon points="28,26 27,21 29.5,25" fill="#f3eede" />
          <polygon points="36,26 37,21 34.5,25" fill="#f3eede" />
          {/* occhi */}
          <ellipse cx="28.5" cy="19" rx="2.4" ry="2" fill="url(#m-eye-glow)" />
          <ellipse cx="35.5" cy="19" rx="2.4" ry="2" fill="url(#m-eye-glow)" />
          <circle cx="28.7" cy="19.2" r="0.9" fill="#1a0a00" />
          <circle cx="35.7" cy="19.2" r="0.9" fill="#1a0a00" />
          <path d="M25 15 L31 17 M39 15 L33 17" stroke="#2f421c" strokeWidth="1" strokeLinecap="round" />
          {/* naso */}
          <path d="M31 20 Q30 23 32 24 Q34 23 33 20 Z" fill="#3c5226" />
        </g>
      );
    case 'Mago Oscuro':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="dmage-robe" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3a1a5e" />
              <stop offset="100%" stopColor="#140622" />
            </linearGradient>
            <radialGradient id="dmage-orb" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#e0c8ff" />
              <stop offset="50%" stopColor="#9a4dff" />
              <stop offset="100%" stopColor="#4a148c" />
            </radialGradient>
          </defs>

          {/* veste lunga */}
          <path d="M23 26 L17 58 L41 58 L37 26 Q30 23 23 26 Z" fill="url(#dmage-robe)" />
          <path d="M28 28 L26 58 L31 58 L31 28 Z" fill="#3a1a5e" opacity="0.45" />
          {/* maniche */}
          <path d="M23 29 Q14 35 15 47 L20 46 Q20 37 26 33 Z" fill="url(#dmage-robe)" />
          <path d="M37 29 Q44 33 45 42 L41 43 Q40 36 34 33 Z" fill="url(#dmage-robe)" />

          {/* bastone runico */}
          <rect x="45.5" y="16" width="2.2" height="42" rx="1" fill="#2a1a3a" />
          <path d="M43.5 16 Q46.6 13 49.7 16" fill="none" stroke="#2a1a3a" strokeWidth="1.4" />
          {/* orbe magica con alone */}
          <circle cx="46.6" cy="12" r="8" fill="url(#dmage-orb)" opacity="0.22">
            <animate attributeName="r" values="7;9.5;7" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="46.6" cy="12" r="4.2" fill="url(#dmage-orb)">
            <animate attributeName="opacity" values="0.85;1;0.85" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="45" cy="10.5" r="1.2" fill="#fff" opacity="0.7" />

          {/* cappuccio */}
          <path d="M22 22 Q23 7 32 6 Q41 7 42 22 Q37 17 32 17 Q27 17 22 22 Z" fill="url(#dmage-robe)" />
          {/* volto in ombra */}
          <path d="M26 18 Q26 27 32 28 Q38 27 38 18 Q32 15 26 18 Z" fill="#0a0414" />
          {/* occhi violetti ardenti */}
          <ellipse cx="29.5" cy="21" rx="1.5" ry="1.9" fill="#c9a0ff">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="34.5" cy="21" rx="1.5" ry="1.9" fill="#c9a0ff">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </ellipse>
          {/* spilla al collo */}
          <circle cx="32" cy="30" r="1.6" fill="url(#dmage-orb)" />
        </g>
      );
    case 'Cavaliere Nero':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="kn-plate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5a5e6e" />
              <stop offset="55%" stopColor="#2c2f3a" />
              <stop offset="100%" stopColor="#121319" />
            </linearGradient>
            <linearGradient id="kn-blade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d8dbe6" />
              <stop offset="100%" stopColor="#5a5e6e" />
            </linearGradient>
          </defs>

          {/* gambe armate */}
          <rect x="25" y="45" width="6" height="12" rx="2" fill="#1a1c24" />
          <rect x="33" y="45" width="6" height="12" rx="2" fill="#1a1c24" />
          <path d="M24 55 L32 55 L32 59 L23 59 Z" fill="#0c0d12" />
          <path d="M32 55 L40 55 L41 59 L32 59 Z" fill="#0c0d12" />

          {/* corazza */}
          <path d="M23 28 L31 25 L41 28 L40 45 L32 47 L24 45 Z" fill="url(#kn-plate)" />
          <path d="M24 29 L31 26.5 L40 29 L39 44 L32 45.5 L25 44 Z" fill="#3a3e4c" opacity="0.5" />
          <line x1="32" y1="26" x2="32" y2="46" stroke="#0a0b10" strokeWidth="0.8" />
          {/* gemma sul petto */}
          <circle cx="32" cy="34" r="2" fill="url(#m-eye-glow)">
            <animate attributeName="opacity" values="1;0.5;1" dur="2.2s" repeatCount="indefinite" />
          </circle>

          {/* spalle spuntate */}
          <ellipse cx="22" cy="28" rx="5.5" ry="4.5" fill="url(#kn-plate)" />
          <ellipse cx="42" cy="28" rx="5.5" ry="4.5" fill="url(#kn-plate)" />
          <polygon points="18,27 20,22 23,27" fill="#3a3e4c" />
          <polygon points="41,27 44,22 46,27" fill="#3a3e4c" />
          {/* braccia */}
          <rect x="17" y="30" width="5" height="13" rx="2" fill="url(#kn-plate)" />
          <rect x="42" y="30" width="5" height="13" rx="2" fill="url(#kn-plate)" />

          {/* SPADONE */}
          <g>
            <rect x="49" y="40" width="2" height="6" rx="0.4" fill="#2a1a10" />
            <path d="M45 40 L55 40 L53 42 L47 42 Z" fill="url(#kn-blade)" />
            <path d="M48 40 L50 8 L52 40 Z" fill="url(#kn-blade)" />
            <line x1="50" y1="11" x2="50" y2="39" stroke="#9aa0b0" strokeWidth="0.4" />
            <circle cx="50" cy="47" r="1.4" fill="#3a3e4c" />
          </g>

          {/* elmo */}
          <path d="M25 14 Q25 9 32 8 Q39 9 39 14 L39 22 L25 22 Z" fill="url(#kn-plate)" />
          <rect x="27" y="16" width="10" height="2.4" fill="#050608" />
          <circle cx="29.5" cy="17.2" r="0.85" fill="url(#m-eye-glow)">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="34.5" cy="17.2" r="0.85" fill="url(#m-eye-glow)">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* corna */}
          <path d="M25 14 Q20 10 19 5 Q24 8 27 12 Z" fill="#2c2f3a" />
          <path d="M39 14 Q44 10 45 5 Q40 8 37 12 Z" fill="#2c2f3a" />
          {/* cresta */}
          <path d="M30 8 L32 3 L34 8 Z" fill="#7a1f2b" />
        </g>
      );
    case 'Strega':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="witch-robe" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a2168" />
              <stop offset="100%" stopColor="#1a0a2e" />
            </linearGradient>
            <radialGradient id="witch-star">
              <stop offset="0%" stopColor="#fffde7" />
              <stop offset="60%" stopColor="#7cf2c0" />
              <stop offset="100%" stopColor="#11a36a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* veste con maniche larghe */}
          <path d="M23 30 L18 58 L42 58 L37 30 Q30 27 23 30 Z" fill="url(#witch-robe)" />
          <path d="M23 32 Q15 38 16 48 L20 47 Q20 39 26 35 Z" fill="url(#witch-robe)" />
          <path d="M37 32 Q45 38 44 48 L40 47 Q40 39 34 35 Z" fill="url(#witch-robe)" />
          {/* mani verdi */}
          <ellipse cx="18" cy="48" rx="2.1" ry="1.6" fill="#8fbf5a" />
          <ellipse cx="46" cy="48" rx="2.1" ry="1.6" fill="#8fbf5a" />

          {/* bacchetta con stella */}
          <g transform="rotate(18 47 42)">
            <rect x="46" y="30" width="1.6" height="16" rx="0.6" fill="#3a2a10" />
            <circle cx="46.8" cy="28" r="6" fill="url(#witch-star)">
              <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
            </circle>
            <path d="M46.8 24 L48 27 L51 27.4 L48.6 29.4 L49.4 32.4 L46.8 30.6 L44.2 32.4 L45 29.4 L42.6 27.4 L45.6 27 Z" fill="#d6fff0" />
          </g>

          {/* capelli stopposi */}
          <path d="M24 22 Q20 34 18 44 Q22 36 25 30 Z" fill="#b8b0a0" />
          <path d="M40 22 Q44 34 46 44 Q42 36 39 30 Z" fill="#b8b0a0" />

          {/* faccia verde */}
          <circle cx="32" cy="22" r="8.2" fill="#8fbf5a" />
          {/* mento appuntito */}
          <path d="M28 28 Q32 34 36 28 Q34 30 32 30 Q30 30 28 28 Z" fill="#8fbf5a" />
          {/* naso adunco lungo */}
          <path d="M32 21 Q28 27 31 30 Q33.5 29 33.5 24 Z" fill="#7aa84a" />
          <circle cx="30.8" cy="29" r="0.7" fill="#5e8636" />
          {/* occhi gialli */}
          <ellipse cx="29" cy="21" rx="2" ry="1.8" fill="url(#m-eye-glow)" />
          <ellipse cx="35.5" cy="21" rx="2" ry="1.8" fill="url(#m-eye-glow)" />
          <circle cx="29.3" cy="21.3" r="0.8" fill="#1a0a00" />
          <circle cx="35.8" cy="21.3" r="0.8" fill="#1a0a00" />
          <path d="M26 17 L31 18.5 M39 17 L34 18.5" stroke="#5e8636" strokeWidth="0.9" strokeLinecap="round" />
          {/* ghigno con dente */}
          <path d="M29 26 Q32 28.5 35 25.5" fill="none" stroke="#3a2a10" strokeWidth="0.8" />
          <polygon points="31,26.6 31.4,28.8 32,26.6" fill="#fff" />

          {/* cappello a punta piegata */}
          <ellipse cx="32" cy="14.5" rx="13" ry="2.8" fill="url(#witch-robe)" />
          <path d="M24 15 Q27 5 33 1 Q37 -0.5 35.5 4 Q31 8 30 15 Z" fill="url(#witch-robe)" />
          <ellipse cx="34" cy="3.5" rx="1.4" ry="1.1" fill="#7cf2c0" />
          <rect x="25" y="12.5" width="14" height="2.4" rx="0.6" fill="#2a1145" transform="rotate(-3 32 13.7)" />
          <rect x="30.5" y="12" width="3" height="3" rx="0.4" fill="#c9a93a" transform="rotate(-3 32 13.5)" />
        </g>
      );
    case 'Assassino Ombra':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="assa-cloak" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1c2230" />
              <stop offset="100%" stopColor="#070a12" />
            </linearGradient>
            <linearGradient id="assa-blade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cfe6ff" />
              <stop offset="100%" stopColor="#5a6b80" />
            </linearGradient>
            <radialGradient id="assa-eye">
              <stop offset="0%" stopColor="#eaffff" />
              <stop offset="55%" stopColor="#36e0ff" />
              <stop offset="100%" stopColor="#0a7aa0" />
            </radialGradient>
          </defs>

          {/* mantello che si allarga */}
          <path d="M22 26 L13 56 L51 56 L42 26 L34 30 L30 30 Z" fill="url(#assa-cloak)" />
          <path d="M24 28 L18 54 L46 54 L40 28 L32 31 Z" fill="#141a26" />
          {/* frange */}
          <path d="M20 50 L22 56 L24 53 Z" fill="#0a0e16" />
          <path d="M44 50 L42 56 L40 53 Z" fill="#0a0e16" />

          {/* tunica */}
          <rect x="27" y="29" width="10" height="20" rx="2" fill="#10141e" />
          <rect x="26" y="40" width="12" height="2.4" rx="0.5" fill="#070a12" />

          {/* braccio sx + pugnale */}
          <g transform="rotate(48 19 36)">
            <rect x="17.6" y="34" width="2.8" height="6" rx="0.5" fill="#0a0e16" />
            <path d="M16 34 L22 34 L21 36 L17 36 Z" fill="#3a4252" />
            <path d="M17.5 34 Q19 24 19 19 Q20 24 20.5 34 Z" fill="url(#assa-blade)" />
          </g>
          {/* braccio dx + pugnale */}
          <g transform="rotate(-48 45 36)">
            <rect x="43.6" y="34" width="2.8" height="6" rx="0.5" fill="#0a0e16" />
            <path d="M42 34 L48 34 L47 36 L43 36 Z" fill="#3a4252" />
            <path d="M43.5 34 Q45 24 45 19 Q46 24 46.5 34 Z" fill="url(#assa-blade)" />
          </g>

          {/* cappuccio */}
          <path d="M22 22 Q23 8 32 7 Q41 8 42 22 Q37 17 32 17 Q27 17 22 22 Z" fill="url(#assa-cloak)" />
          {/* volto in ombra + maschera */}
          <path d="M26 18 Q26 27 32 28 Q38 27 38 18 Q32 15 26 18 Z" fill="#06080e" />
          <path d="M27 23 L37 23 L35 26 L29 26 Z" fill="#10141e" />
          {/* occhi cyan affilati */}
          <ellipse cx="29.3" cy="20.5" rx="1.5" ry="1.3" fill="url(#assa-eye)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2.2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="34.7" cy="20.5" rx="1.5" ry="1.3" fill="url(#assa-eye)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2.2s" repeatCount="indefinite" />
          </ellipse>
        </g>
      );
    case 'Drago Antico':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="drago-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7f1010" />
              <stop offset="45%" stopColor="#b71c1c" />
              <stop offset="100%" stopColor="#e8552f" />
            </linearGradient>
            <linearGradient id="drago-belly" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#caa05a" />
              <stop offset="100%" stopColor="#7a4a1e" />
            </linearGradient>
            <linearGradient id="drago-wing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3a0808" />
              <stop offset="100%" stopColor="#7a1414" />
            </linearGradient>
            <radialGradient id="drago-fire" cx="20%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#fff59d" />
              <stop offset="40%" stopColor="#ff9800" />
              <stop offset="100%" stopColor="#e53935" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="drago-eye">
              <stop offset="0%" stopColor="#fffde7" />
              <stop offset="55%" stopColor="#ffd600" />
              <stop offset="100%" stopColor="#ff6f00" />
            </radialGradient>
          </defs>

          {/* ALA membranosa che sbatte */}
          <g>
            <animateTransform attributeName="transform" type="rotate" values="0 32 30;-4 32 30;0 32 30" dur="3.4s" repeatCount="indefinite" />
            <path d="M32 30 Q9 6 3 13 Q9 15 8 21 Q14 18 16 24 Q20 20 23 27 Q27 24 30 31 Z" fill="url(#drago-wing)" stroke="#2a0606" strokeWidth="0.6" />
            <path d="M32 30 L3 13 M32 30 L8 21 M32 30 L16 24 M32 30 L23 27" stroke="#2a0606" strokeWidth="0.6" fill="none" opacity="0.7" />
          </g>

          {/* CODA con punta ossea */}
          <path d="M19 45 Q9 51 4 47 Q2 44 5 41 Q9 43 12 45 Q15 46 19 45 Z" fill="url(#drago-body)" />
          <polygon points="5,41 3,38 7,40" fill="#caa05a" />

          {/* CORPO scaglioso */}
          <path d="M16 42 Q13 28 26 26 Q37 26 40 35 Q42 45 33 50 Q23 54 18 47 Q15 45 16 42 Z" fill="url(#drago-body)" />
          {/* pancia a placche */}
          <path d="M22 48 Q30 52 36 45 Q35 50 30 51 Q25 52 22 48 Z" fill="url(#drago-belly)" />
          <path d="M25 49 L26 51 M29 50 L30 52 M32 48 L33 50" stroke="#5e3713" strokeWidth="0.5" />

          {/* cresta dorsale (3 spine) */}
          <path d="M19 30 L18 25 L22 29 Z" fill="#3a0808" />
          <path d="M25 27 L25 21 L29 26 Z" fill="#3a0808" />
          <path d="M32 27 L34 22 L36 28 Z" fill="#3a0808" />

          {/* ZAMPA con artigli */}
          <path d="M28 49 L26 57 L24 57 L26 52 Z" fill="#7f1010" />
          <path d="M31 49 L34 57 L32 57 L31 52 Z" fill="#8b1a1a" />
          <path d="M24 57 L23 59 M26 57 L25.5 59.4 M32 57 L32 59.4 M34 57 L35 59" stroke="#f5e6c8" strokeWidth="0.7" strokeLinecap="round" />

          {/* COLLO arcuato */}
          <path d="M36 33 Q41 25 45 20 Q47 17 51 18 L52 22 Q47 23 44 28 Q41 33 39 37 Z" fill="url(#drago-body)" />
          <path d="M41 28 L42 24 L44 28 Z" fill="#3a0808" />
          <path d="M45 23 L46 19 L48 23 Z" fill="#3a0808" />

          {/* TESTA */}
          <path d="M47 11 Q55 10 59 15 Q60 18 57 20 Q52 21 48 19 Q45 16 46 13 Q46 11 47 11 Z" fill="url(#drago-body)" />
          {/* mascella + denti */}
          <path d="M50 19 Q55 21 59 18 L58 21 Q53 22 50 20 Z" fill="#7f1010" />
          <path d="M52 20 L52.5 21.8 L53 20 M55 20 L55.5 21.8 L56 20" stroke="#fff" strokeWidth="0.5" fill="#fff" />
          {/* corna */}
          <path d="M49 10 Q47 4 44 2 Q48 4 50 9 Z" fill="#d7c9a0" />
          <path d="M54 10 Q55 3 59 1 Q56 5 56 10 Z" fill="#d7c9a0" />
          {/* occhio incandescente */}
          <ellipse cx="52" cy="14.5" rx="2.1" ry="2.1" fill="url(#drago-eye)">
            <animate attributeName="rx" values="1.9;2.4;1.9" dur="2.4s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="52.4" cy="14.5" rx="0.6" ry="1.3" fill="#3a0000" />
          <circle cx="57.5" cy="16" r="0.6" fill="#3a0000" />

          {/* FUOCO dal muso */}
          <ellipse cx="60" cy="17" rx="3" ry="1.6" fill="url(#drago-fire)">
            <animate attributeName="rx" values="2;3.5;2" dur="0.45s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;1;0.5" dur="0.45s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="60" cy="17" r="1" fill="#ffeb3b">
            <animate attributeName="cx" values="59;62;59" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
          </circle>

          {/* riflessi scaglie */}
          <ellipse cx="24" cy="34" rx="1.6" ry="1.1" fill="#f4a98a" opacity="0.55" />
          <ellipse cx="30" cy="33" rx="1.3" ry="0.9" fill="#f4a98a" opacity="0.45" />
          <ellipse cx="27" cy="41" rx="1.5" ry="1" fill="#f4a98a" opacity="0.4" />
        </g>
      );

    case 'Lich Re':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="lich-robe" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3a1060" />
              <stop offset="100%" stopColor="#120322" />
            </linearGradient>
            <linearGradient id="lich-bone" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#eef0e2" />
              <stop offset="100%" stopColor="#b3b29a" />
            </linearGradient>
            <linearGradient id="lich-gold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffe082" />
              <stop offset="100%" stopColor="#bf8f1a" />
            </linearGradient>
            <radialGradient id="lich-eye">
              <stop offset="0%" stopColor="#eaffff" />
              <stop offset="55%" stopColor="#b14dff" />
              <stop offset="100%" stopColor="#5a1a8a" />
            </radialGradient>
          </defs>

          {/* veste regale */}
          <path d="M22 30 L16 58 L48 58 L42 30 Q32 26 22 30 Z" fill="url(#lich-robe)" />
          <path d="M31 32 L29 58 L35 58 L33 32 Z" fill="#5a2a8a" opacity="0.4" />
          <path d="M16 58 Q32 54 48 58" fill="none" stroke="url(#lich-gold)" strokeWidth="1.2" />
          {/* maniche */}
          <path d="M22 31 Q13 37 14 50 L19 49 Q19 39 25 35 Z" fill="url(#lich-robe)" />
          <path d="M42 31 Q51 37 50 50 L45 49 Q45 39 39 35 Z" fill="url(#lich-robe)" />
          <path d="M15 49 L13 53 M17 49 L17 53 M19 49 L21 52" stroke="url(#lich-bone)" strokeWidth="1.1" strokeLinecap="round" />

          {/* bastone necromante */}
          <rect x="47" y="14" width="2.2" height="44" rx="1" fill="#2a1a3a" />
          <path d="M44 15 Q48 9 52 15 Q50 16 48 15 Q46 16 44 15 Z" fill="url(#lich-gold)" />
          <circle cx="48" cy="11" r="3" fill="url(#lich-eye)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* colletto alto */}
          <path d="M26 30 L24 24 L32 27 L40 24 L38 30 Z" fill="url(#lich-robe)" />
          {/* teschio */}
          <path d="M25 18 Q25 9 32 8 Q39 9 39 18 Q39 24 35 26 L29 26 Q25 24 25 18 Z" fill="url(#lich-bone)" />
          {/* corona */}
          <path d="M24 11 L24 6 L27 9 L29 4 L32 9 L35 4 L37 9 L40 6 L40 11 Z" fill="url(#lich-gold)" />
          <circle cx="32" cy="6.5" r="1.2" fill="#b14dff" />
          <circle cx="27" cy="8.5" r="0.8" fill="#ff5277" />
          <circle cx="37" cy="8.5" r="0.8" fill="#ff5277" />
          {/* orbite ardenti */}
          <ellipse cx="28.5" cy="18" rx="2.6" ry="3" fill="#140622" />
          <ellipse cx="35.5" cy="18" rx="2.6" ry="3" fill="#140622" />
          <circle cx="28.5" cy="18.3" r="1.5" fill="url(#lich-eye)">
            <animate attributeName="r" values="1.2;1.8;1.2" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="35.5" cy="18.3" r="1.5" fill="url(#lich-eye)">
            <animate attributeName="r" values="1.2;1.8;1.2" dur="2.2s" repeatCount="indefinite" />
          </circle>
          {/* naso + denti */}
          <polygon points="32,21 30.7,23.6 33.3,23.6" fill="#8a8870" />
          <path d="M29 26 L35 26 L34.5 28.6 L29.5 28.6 Z" fill="#dedcc6" />
          <path d="M31 26 L31 28.6 M33 26 L33 28.6" stroke="#9c9a82" strokeWidth="0.4" />
        </g>
      );
    case 'Golem di Ferro':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="golem-iron" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9aa3b3" />
              <stop offset="55%" stopColor="#5a6170" />
              <stop offset="100%" stopColor="#2a2f3a" />
            </linearGradient>
            <radialGradient id="golem-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff6d0" />
              <stop offset="50%" stopColor="#ff7a18" />
              <stop offset="100%" stopColor="#ff7a18" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* gambe blocco */}
          <rect x="24" y="44" width="7" height="13" rx="1.5" fill="url(#golem-iron)" />
          <rect x="33" y="44" width="7" height="13" rx="1.5" fill="url(#golem-iron)" />
          <rect x="23" y="55" width="9" height="4" rx="1" fill="#2a2f3a" />
          <rect x="32" y="55" width="9" height="4" rx="1" fill="#2a2f3a" />

          {/* busto enorme */}
          <path d="M20 26 L44 26 L42 46 L22 46 Z" fill="url(#golem-iron)" />
          <path d="M22 28 L42 28 L40.5 44 L23.5 44 Z" fill="#4a5160" opacity="0.5" />
          <circle cx="24" cy="29" r="1" fill="#2a2f3a" />
          <circle cx="40" cy="29" r="1" fill="#2a2f3a" />
          <circle cx="24" cy="43" r="1" fill="#2a2f3a" />
          <circle cx="40" cy="43" r="1" fill="#2a2f3a" />
          {/* nucleo incandescente */}
          <circle cx="32" cy="36" r="7" fill="url(#golem-core)" opacity="0.3">
            <animate attributeName="r" values="6;8.5;6" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="32" cy="36" r="3.4" fill="url(#golem-core)">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <path d="M27 40 L29 42 M37 40 L35 42 M28 32 L30 30" stroke="#ff8a3c" strokeWidth="0.6" opacity="0.7" />

          {/* spalle e braccia */}
          <rect x="14" y="25" width="9" height="9" rx="2" fill="url(#golem-iron)" />
          <rect x="41" y="25" width="9" height="9" rx="2" fill="url(#golem-iron)" />
          <rect x="15" y="33" width="7" height="11" rx="2" fill="url(#golem-iron)" />
          <rect x="42" y="33" width="7" height="11" rx="2" fill="url(#golem-iron)" />
          <rect x="13" y="42" width="10" height="8" rx="2" fill="url(#golem-iron)" />
          <rect x="41" y="42" width="10" height="8" rx="2" fill="url(#golem-iron)" />

          {/* testa */}
          <rect x="27" y="14" width="10" height="11" rx="2" fill="url(#golem-iron)" />
          <rect x="28.5" y="18" width="7" height="3" rx="1" fill="#0c0f16" />
          <circle cx="30.5" cy="19.5" r="1" fill="url(#golem-core)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="33.5" cy="19.5" r="1" fill="url(#golem-core)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      );
    case 'Fantasma Supremo':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <radialGradient id="ghost-body" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#f2f8ff" />
              <stop offset="60%" stopColor="#aac4ff" />
              <stop offset="100%" stopColor="#6a8cff" />
            </radialGradient>
            <radialGradient id="ghost-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#aec8ff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6a8cff" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -2.5;0 0" dur="3.4s" repeatCount="indefinite" />

            <ellipse cx="32" cy="30" rx="20" ry="23" fill="url(#ghost-aura)">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
            </ellipse>

            {/* corpo con coda spettrale */}
            <path d="M18 30 Q18 12 32 11 Q46 12 46 30 L46 48 Q43 44 40 48 Q37 52 34 48 Q31 44 28 48 Q25 52 22 48 Q19 44 18 48 Z" fill="url(#ghost-body)" opacity="0.9">
              <animate attributeName="d" values="M18 30 Q18 12 32 11 Q46 12 46 30 L46 48 Q43 44 40 48 Q37 52 34 48 Q31 44 28 48 Q25 52 22 48 Q19 44 18 48 Z;M18 30 Q18 12 32 11 Q46 12 46 30 L46 50 Q43 45 40 49 Q37 53 34 49 Q31 45 28 49 Q25 53 22 49 Q19 45 18 50 Z;M18 30 Q18 12 32 11 Q46 12 46 30 L46 48 Q43 44 40 48 Q37 52 34 48 Q31 44 28 48 Q25 52 22 48 Q19 44 18 48 Z" dur="2.6s" repeatCount="indefinite" />
            </path>
            {/* braccia wispy */}
            <path d="M18 31 Q10 33 9 41 Q13 36 19 37 Z" fill="url(#ghost-body)" opacity="0.7" />
            <path d="M46 31 Q54 33 55 41 Q51 36 45 37 Z" fill="url(#ghost-body)" opacity="0.7" />
            {/* corona spettrale */}
            <path d="M25 13 L25 8 L28 11 L32 6 L36 11 L39 8 L39 13 Z" fill="#cfe4ff" opacity="0.85" />
            {/* occhi vuoti */}
            <ellipse cx="27" cy="26" rx="2.4" ry="3.4" fill="#1a3a6a" />
            <ellipse cx="37" cy="26" rx="2.4" ry="3.4" fill="#1a3a6a" />
            <ellipse cx="27" cy="26" rx="1.2" ry="2" fill="#eaf6ff">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="37" cy="26" rx="1.2" ry="2" fill="#eaf6ff">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite" />
            </ellipse>
            {/* bocca urlante */}
            <ellipse cx="32" cy="35" rx="2.3" ry="3.4" fill="#1a3a6a" opacity="0.85" />
          </g>
        </g>
      );
    case 'Signore del Tempo':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="time-robe" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1b6f6a" />
              <stop offset="100%" stopColor="#06201f" />
            </linearGradient>
            <linearGradient id="time-gold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffe082" />
              <stop offset="100%" stopColor="#bf8f1a" />
            </linearGradient>
            <radialGradient id="time-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7ff0dc" />
              <stop offset="100%" stopColor="#7ff0dc" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* anello orario rotante */}
          <g>
            <animateTransform attributeName="transform" type="rotate" values="0 32 34;360 32 34" dur="14s" repeatCount="indefinite" />
            <circle cx="32" cy="34" r="16" fill="none" stroke="#5fe0d0" strokeWidth="0.7" opacity="0.4" strokeDasharray="2 3.5" />
          </g>

          {/* veste */}
          <path d="M23 28 L18 58 L46 58 L41 28 Q32 25 23 28 Z" fill="url(#time-robe)" />
          <path d="M23 30 Q14 36 15 48 L20 47 Q20 38 26 34 Z" fill="url(#time-robe)" />
          <path d="M41 30 Q50 36 49 48 L44 47 Q44 38 38 34 Z" fill="url(#time-robe)" />

          {/* medaglione orologio */}
          <circle cx="32" cy="37" r="6.5" fill="url(#time-glow)" opacity="0.5" />
          <circle cx="32" cy="37" r="5.2" fill="#0e3a3a" stroke="url(#time-gold)" strokeWidth="1" />
          <line x1="32" y1="37" x2="32" y2="32.5" stroke="#aef0e6" strokeWidth="0.8" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 32 37;360 32 37" dur="6s" repeatCount="indefinite" />
          </line>
          <line x1="32" y1="37" x2="35.4" y2="37" stroke="#aef0e6" strokeWidth="0.8" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 32 37;360 32 37" dur="24s" repeatCount="indefinite" />
          </line>
          <circle cx="32" cy="37" r="0.9" fill="url(#time-gold)" />

          {/* clessidra sul bastone */}
          <rect x="46" y="20" width="2" height="38" rx="1" fill="url(#time-gold)" />
          <path d="M43.5 13 L50.5 13 L47 17 Z" fill="#0e3a3a" stroke="url(#time-gold)" strokeWidth="0.6" />
          <path d="M43.5 21 L50.5 21 L47 17 Z" fill="#0e3a3a" stroke="url(#time-gold)" strokeWidth="0.6" />
          <circle cx="47" cy="17" r="0.8" fill="#7ff0dc">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" />
          </circle>

          {/* cappuccio */}
          <path d="M23 23 Q24 9 32 8 Q40 9 41 23 Q36 18 32 18 Q28 18 23 23 Z" fill="url(#time-robe)" />
          <path d="M26 19 Q26 27 32 28 Q38 27 38 19 Q32 16 26 19 Z" fill="#06201f" />
          <ellipse cx="29.5" cy="21.5" rx="1.4" ry="1.7" fill="#7ff0dc">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="34.5" cy="21.5" rx="1.4" ry="1.7" fill="#7ff0dc">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </ellipse>
        </g>
      );
    case 'Treant Antico':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="treant-bark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6e4a2a" />
              <stop offset="100%" stopColor="#3a2412" />
            </linearGradient>
            <radialGradient id="treant-leaf" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#6abf3a" />
              <stop offset="100%" stopColor="#2f6b18" />
            </radialGradient>
          </defs>

          {/* radici / gambe */}
          <path d="M26 48 Q24 56 20 59 M28 50 L28 58 M36 50 L36 58 M38 48 Q40 56 44 59" stroke="#3a2412" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* tronco */}
          <path d="M24 24 Q21 44 28 52 L36 52 Q43 44 40 24 Q32 21 24 24 Z" fill="url(#treant-bark)" />
          <path d="M28 28 Q27 40 30 50 M36 28 Q37 40 34 50 M32 26 L32 50" stroke="#2a1808" strokeWidth="0.7" fill="none" opacity="0.6" />

          {/* braccia ramo */}
          <path d="M24 30 Q14 28 10 20" stroke="#4a3018" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M40 30 Q50 28 54 20" stroke="#4a3018" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M10 20 L7 16 M10 20 L12 15 M10 20 L6 22" stroke="#4a3018" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M54 20 L57 16 M54 20 L52 15 M54 20 L58 22" stroke="#4a3018" strokeWidth="1.4" strokeLinecap="round" />

          {/* chioma di foglie */}
          <ellipse cx="32" cy="13" rx="15" ry="9" fill="url(#treant-leaf)" />
          <ellipse cx="21" cy="16" rx="7" ry="5" fill="url(#treant-leaf)" />
          <ellipse cx="43" cy="16" rx="7" ry="5" fill="url(#treant-leaf)" />
          <ellipse cx="9" cy="18" rx="4" ry="3" fill="url(#treant-leaf)" />
          <ellipse cx="55" cy="18" rx="4" ry="3" fill="url(#treant-leaf)" />
          <ellipse cx="28" cy="8" rx="5" ry="3.5" fill="#7fd24a" opacity="0.7" />

          {/* occhi ambra incavati */}
          <ellipse cx="28" cy="34" rx="2.4" ry="2.8" fill="#1a0e04" />
          <ellipse cx="36" cy="34" rx="2.4" ry="2.8" fill="#1a0e04" />
          <circle cx="28" cy="34.3" r="1.3" fill="#ffb74d">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="36" cy="34.3" r="1.3" fill="#ffb74d">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite" />
          </circle>
          {/* bocca nodosa */}
          <path d="M28 42 Q32 46 36 42 Q34 44 32 44 Q30 44 28 42 Z" fill="#1a0e04" />
        </g>
      );
    case 'Signore della Guerra':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="war-armor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8a4242" />
              <stop offset="55%" stopColor="#4a2424" />
              <stop offset="100%" stopColor="#1c0e0e" />
            </linearGradient>
            <linearGradient id="war-blade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e4ee" />
              <stop offset="100%" stopColor="#6a6f7e" />
            </linearGradient>
          </defs>

          {/* mantello rosso */}
          <path d="M20 28 L14 56 L26 56 L24 30 Z" fill="#5a0f12" />
          <path d="M44 28 L50 56 L38 56 L40 30 Z" fill="#5a0f12" />
          <path d="M14 56 L18 54 L18 56 Z" fill="#7a1a1d" />

          {/* gambe */}
          <rect x="25" y="46" width="6.5" height="11" rx="2" fill="#2a2230" />
          <rect x="32.5" y="46" width="6.5" height="11" rx="2" fill="#2a2230" />
          <rect x="24" y="55" width="8" height="4" rx="1" fill="#14101a" />
          <rect x="32" y="55" width="8" height="4" rx="1" fill="#14101a" />

          {/* corazza */}
          <path d="M22 28 L32 25 L42 28 L40 46 L32 48 L24 46 Z" fill="url(#war-armor)" />
          <line x1="32" y1="26" x2="32" y2="47" stroke="#1a0a0a" strokeWidth="0.8" />
          <circle cx="32" cy="34" r="2.2" fill="url(#m-eye-glow)">
            <animate attributeName="opacity" values="1;0.5;1" dur="2.2s" repeatCount="indefinite" />
          </circle>

          {/* spalle spuntate */}
          <ellipse cx="20" cy="28" rx="6.5" ry="5" fill="url(#war-armor)" />
          <ellipse cx="44" cy="28" rx="6.5" ry="5" fill="url(#war-armor)" />
          <polygon points="15,27 17,21 21,27" fill="#9a4a4a" />
          <polygon points="43,27 47,21 49,27" fill="#9a4a4a" />
          <rect x="15" y="31" width="6" height="14" rx="2" fill="url(#war-armor)" />
          <rect x="43" y="31" width="6" height="14" rx="2" fill="url(#war-armor)" />

          {/* ascia enorme */}
          <g transform="rotate(14 50 28)">
            <rect x="49" y="6" width="2.6" height="42" rx="1" fill="#3a2418" />
            <path d="M44 8 Q60 6 57 22 Q50 18 44 19 Z" fill="url(#war-blade)" />
            <path d="M51.6 8 Q60 10 58 22 Q53 19 51.6 19 Z" fill="url(#war-blade)" opacity="0.85" />
            <path d="M45 10 Q55 9 55 19" stroke="#fff" strokeWidth="0.5" fill="none" opacity="0.4" />
          </g>

          {/* elmo cornuto */}
          <path d="M25 14 Q25 8 32 7 Q39 8 39 14 L39 22 L25 22 Z" fill="url(#war-armor)" />
          <rect x="27" y="16" width="10" height="2.6" fill="#050405" />
          <circle cx="29.5" cy="17.3" r="0.9" fill="url(#m-eye-glow)">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="34.5" cy="17.3" r="0.9" fill="url(#m-eye-glow)">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
          <path d="M25 13 Q18 11 16 4 Q23 7 27 12 Z" fill="#9a4a4a" />
          <path d="M39 13 Q46 11 48 4 Q41 7 37 12 Z" fill="#9a4a4a" />
        </g>
      );
    case 'Wyrm di Cristallo':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="cryw-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dffaff" />
              <stop offset="50%" stopColor="#4cc4e6" />
              <stop offset="100%" stopColor="#1565a0" />
            </linearGradient>
            <radialGradient id="cryw-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#9be8ff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#1565a0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cryw-eye">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#c46bff" />
              <stop offset="100%" stopColor="#7a1ad6" />
            </radialGradient>
          </defs>

          <ellipse cx="32" cy="36" rx="27" ry="22" fill="url(#cryw-aura)">
            <animate attributeName="opacity" values="0.55;0.95;0.55" dur="3s" repeatCount="indefinite" />
          </ellipse>

          {/* corpo serpentino a S */}
          <path d="M6 52 Q4 44 12 42 Q22 40 22 33 Q22 24 32 22 Q44 20 50 26 L48 31 Q42 26 34 28 Q28 30 28 36 Q28 46 16 48 Q10 49 11 53 Z" fill="url(#cryw-body)" stroke="#bdf3ff" strokeWidth="0.4" />
          {/* sfaccettature */}
          <path d="M22 33 L26 30 L26 36 Z" fill="#eafdff" opacity="0.55" />
          <path d="M28 41 L24 44 L24 38 Z" fill="#eafdff" opacity="0.45" />
          <path d="M34 26 L38 24 L37 30 Z" fill="#eafdff" opacity="0.5" />
          {/* creste di cristallo dorsali */}
          <polygon points="20,30 18,23 24,29" fill="#9be8ff" />
          <polygon points="30,24 30,17 35,23" fill="#9be8ff" />
          <polygon points="14,44 12,38 18,43" fill="#9be8ff" />
          {/* punta coda */}
          <polygon points="11,53 6,57 12,49" fill="#9be8ff" />

          {/* testa cristallina */}
          <path d="M44 22 Q54 20 58 26 Q59 29 56 30 Q50 31 46 28 Q43 25 44 22 Z" fill="url(#cryw-body)" stroke="#bdf3ff" strokeWidth="0.4" />
          <polygon points="48,21 46,13 51,19" fill="#dffaff" />
          <ellipse cx="52" cy="25" rx="1.8" ry="1.8" fill="url(#cryw-eye)">
            <animate attributeName="rx" values="1.5;2.1;1.5" dur="2.2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="52.3" cy="25" rx="0.5" ry="1" fill="#3a0a5a" />
          {/* fauci */}
          <path d="M55 28 Q58 30 60 28 L59 30 Q56 31 55 29 Z" fill="#bdf3ff" />

          {/* scintille */}
          <circle cx="24" cy="20" r="0.6" fill="#fff">
            <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="40" cy="38" r="0.5" fill="#dffaff">
            <animate attributeName="opacity" values="0;1;0" dur="3s" begin="0.8s" repeatCount="indefinite" />
          </circle>
        </g>
      );
    case 'Idra Velenosa':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <linearGradient id="hydra-body" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5fae33" />
              <stop offset="100%" stopColor="#1f5a1f" />
            </linearGradient>
            <radialGradient id="hydra-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#9fe04a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1f5a1f" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hydra-eye">
              <stop offset="0%" stopColor="#fbffe0" />
              <stop offset="60%" stopColor="#ccff33" />
              <stop offset="100%" stopColor="#6b8f0a" />
            </radialGradient>
          </defs>

          <ellipse cx="32" cy="40" rx="24" ry="19" fill="url(#hydra-aura)">
            <animate attributeName="opacity" values="0.55;0.95;0.55" dur="2.8s" repeatCount="indefinite" />
          </ellipse>

          {/* corpo base */}
          <ellipse cx="32" cy="47" rx="14" ry="8.5" fill="url(#hydra-body)" />
          <path d="M22 49 Q32 53 42 49" stroke="#1f5a1f" strokeWidth="0.8" fill="none" opacity="0.5" />

          {/* collo + testa centrale */}
          <path d="M30 46 Q28 30 31 18 Q32 16 34 18 Q34 32 34 46 Z" fill="url(#hydra-body)" />
          <path d="M28 17 Q32 12 38 15 Q40 17 38 19 Q34 21 30 20 Q27 19 28 17 Z" fill="url(#hydra-body)" />
          <ellipse cx="34" cy="16.5" rx="1.3" ry="1.3" fill="url(#hydra-eye)" />
          <polygon points="36,19 36.4,21.5 37,19" fill="#eaffd0" />
          <polygon points="33,20 33.4,22 34,20" fill="#eaffd0" />

          {/* collo sx */}
          <path d="M27 46 Q20 36 17 24 Q16 21 19 21 Q22 34 30 44 Z" fill="url(#hydra-body)" />
          <path d="M13 20 Q17 16 21 19 Q23 21 21 23 Q17 24 14 22 Q12 21 13 20 Z" fill="url(#hydra-body)" />
          <ellipse cx="18" cy="20" rx="1.2" ry="1.2" fill="url(#hydra-eye)" />
          <polygon points="14,22 14,24.4 15,22" fill="#eaffd0" />
          {/* veleno che gocciola */}
          <circle cx="15.5" cy="25" r="1" fill="#9fe04a">
            <animate attributeName="cy" values="24;36;24" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0;0.9" dur="2.6s" repeatCount="indefinite" />
          </circle>

          {/* collo dx */}
          <path d="M37 46 Q44 36 47 24 Q48 21 45 21 Q42 34 34 44 Z" fill="url(#hydra-body)" />
          <path d="M43 20 Q47 16 51 19 Q53 21 51 23 Q47 24 44 22 Q42 21 43 20 Z" fill="url(#hydra-body)" />
          <ellipse cx="46" cy="20" rx="1.2" ry="1.2" fill="url(#hydra-eye)" />
          <polygon points="50,22 50,24.4 51,22" fill="#eaffd0" />
          <circle cx="48.5" cy="25" r="0.9" fill="#9fe04a">
            <animate attributeName="cy" values="24;35;24" dur="3s" begin="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0;0.9" dur="3s" begin="1s" repeatCount="indefinite" />
          </circle>
        </g>
      );
    case 'Ifrit':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <radialGradient id="ifrit-body" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#ffe08a" />
              <stop offset="50%" stopColor="#e23a0a" />
              <stop offset="100%" stopColor="#7a0f0f" />
            </radialGradient>
            <radialGradient id="ifrit-aura" cx="50%" cy="55%" r="50%">
              <stop offset="0%" stopColor="#ff9e3c" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#e23a0a" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="32" cy="34" rx="22" ry="25" fill="url(#ifrit-aura)">
            <animate attributeName="opacity" values="0.55;1;0.55" dur="2.4s" repeatCount="indefinite" />
          </ellipse>

          {/* corpo che sfuma in fiamma */}
          <path d="M24 26 Q22 44 26 52 Q28 56 32 50 Q36 56 38 52 Q42 44 40 26 Q32 23 24 26 Z" fill="url(#ifrit-body)">
            <animate attributeName="d" values="M24 26 Q22 44 26 52 Q28 56 32 50 Q36 56 38 52 Q42 44 40 26 Q32 23 24 26 Z;M24 26 Q22 44 25 53 Q27 57 32 51 Q37 57 39 53 Q42 44 40 26 Q32 23 24 26 Z;M24 26 Q22 44 26 52 Q28 56 32 50 Q36 56 38 52 Q42 44 40 26 Q32 23 24 26 Z" dur="1.4s" repeatCount="indefinite" />
          </path>
          <path d="M30 30 L32 36 L30 42 M36 32 L34 38" stroke="#fff2a0" strokeWidth="0.6" opacity="0.75" />

          {/* braccia */}
          <path d="M24 30 Q15 32 12 42 Q17 36 26 36 Z" fill="url(#ifrit-body)" />
          <path d="M40 30 Q49 32 52 42 Q47 36 38 36 Z" fill="url(#ifrit-body)" />
          {/* spalle in fiamme */}
          <path d="M22 28 Q20 22 23 18 Q24 24 27 26 Z" fill="#ff9e3c" />
          <path d="M42 28 Q44 22 41 18 Q40 24 37 26 Z" fill="#ff9e3c" />

          {/* testa */}
          <ellipse cx="32" cy="20" rx="8" ry="8" fill="url(#ifrit-body)" />
          {/* corna */}
          <path d="M26 14 Q22 8 20 3 Q26 7 28 13 Z" fill="#2a0a0a" />
          <path d="M38 14 Q42 8 44 3 Q38 7 36 13 Z" fill="#2a0a0a" />
          {/* capelli di fiamma */}
          <path d="M26 13 Q28 5 32 2 Q33 7 32 12" fill="none" stroke="#ff7a18" strokeWidth="1.6" strokeLinecap="round">
            <animate attributeName="stroke" values="#ff7a18;#ffb74d;#ff7a18" dur="1s" repeatCount="indefinite" />
          </path>
          <path d="M32 12 Q34 4 38 3 Q37 9 36 13" fill="none" stroke="#ff7a18" strokeWidth="1.6" strokeLinecap="round">
            <animate attributeName="stroke" values="#ff7a18;#ffd54f;#ff7a18" dur="1.2s" repeatCount="indefinite" />
          </path>

          {/* occhi bianchi ardenti */}
          <ellipse cx="29" cy="20" rx="2" ry="1.6" fill="#fffde7">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.6s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="35" cy="20" rx="2" ry="1.6" fill="#fffde7">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.6s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="29" cy="20.2" r="0.7" fill="#e23a0a" />
          <circle cx="35" cy="20.2" r="0.7" fill="#e23a0a" />
          {/* bocca con zanne */}
          <path d="M29 24 Q32 27 35 24" stroke="#7a0f0f" strokeWidth="0.8" fill="none" />
          <polygon points="30,24.5 30.4,26 31,24.5" fill="#fff" />
          <polygon points="33,24.5 33.4,26 34,24.5" fill="#fff" />

          {/* scintille */}
          <circle cx="20" cy="36" r="0.7" fill="#ffd54f">
            <animate attributeName="cy" values="40;14;40" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.9;0" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="44" cy="34" r="0.6" fill="#ff8a3c">
            <animate attributeName="cy" values="38;12;38" dur="3.2s" begin="0.9s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.8;0" dur="3.2s" begin="0.9s" repeatCount="indefinite" />
          </circle>
        </g>
      );
    case 'Re del Vuoto':
      return (
        <g filter="url(#m-shadow)">
          <defs>
            <radialGradient id="void-body" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#3a1860" />
              <stop offset="100%" stopColor="#05010f" />
            </radialGradient>
            <radialGradient id="void-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7a1ad6" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#ff3df0" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#05010f" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="32" cy="32" rx="25" ry="27" fill="url(#void-aura)">
            <animate attributeName="opacity" values="0.55;1;0.55" dur="3.2s" repeatCount="indefinite" />
          </ellipse>

          {/* mantello */}
          <path d="M21 26 L14 58 L50 58 L43 26 L34 30 L30 30 Z" fill="url(#void-body)" />
          <path d="M23 28 L18 56 L46 56 L41 28 L32 32 Z" fill="#0a0418" />
          {/* stelle nel corpo */}
          <circle cx="26" cy="42" r="0.6" fill="#d6b8ff">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="38" cy="46" r="0.5" fill="#ffb8f0">
            <animate attributeName="opacity" values="1;0.2;1" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="32" cy="50" r="0.5" fill="#b8d0ff">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2.8s" repeatCount="indefinite" />
          </circle>
          {/* crepe magenta */}
          <path d="M32 30 L30 38 L33 46 M28 34 L26 41" stroke="#ff3df0" strokeWidth="0.6" opacity="0.8">
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.2s" repeatCount="indefinite" />
          </path>

          {/* spalle aguzze */}
          <polygon points="20,30 17,23 25,29" fill="#1a0a30" />
          <polygon points="44,30 47,23 39,29" fill="#1a0a30" />

          {/* cappuccio + volto */}
          <path d="M23 22 Q24 8 32 7 Q40 8 41 22 Q36 17 32 17 Q28 17 23 22 Z" fill="url(#void-body)" />
          <path d="M26 18 Q26 27 32 28 Q38 27 38 18 Q32 15 26 18 Z" fill="#05010f" />

          {/* corona del vuoto */}
          <path d="M24 11 L22 4 L27 8 L29 2 L32 7 L35 2 L37 8 L42 4 L40 11 Z" fill="#1a0a30" stroke="#ff3df0" strokeWidth="0.5" />
          <circle cx="32" cy="5.5" r="1.2" fill="#ff3df0">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* occhi a stella */}
          <path d="M28.5 20.5 L29.2 22 L30.7 22.5 L29.2 23 L28.5 24.5 L27.8 23 L26.3 22.5 L27.8 22 Z" fill="#ff8af2">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M35.5 20.5 L36.2 22 L37.7 22.5 L36.2 23 L35.5 24.5 L34.8 23 L33.3 22.5 L34.8 22 Z" fill="#ff8af2">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </path>
        </g>
      );
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
