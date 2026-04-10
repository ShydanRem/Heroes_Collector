import { query } from '../config/database';
import axios from 'axios';
import { env } from '../config/env';

const CLASS_LABELS: Record<string, string> = {
  guardiano: 'Guardiano', lama: 'Berserker', arcano: 'Stregone', custode: 'Sacerdote',
  ombra: 'Assassino', ranger: 'Ranger', sciamano: 'Sciamano', crono: 'Cronomante',
  dragoon: 'Dragoon', samurai: 'Samurai', necromante: 'Necromante', alchimista: 'Alchimista',
};

const RARITY_LABELS: Record<string, string> = {
  comune: 'Comune', non_comune: 'Non Comune', raro: 'Raro', molto_raro: 'Molto Raro',
  epico: 'Epico', leggendario: 'Leggendario', mitico: 'Mitico', master: 'Master',
};

/**
 * Elabora un messaggio chat e risponde se e' un comando.
 * Ritorna true se il messaggio era un comando.
 */
export async function handleChatCommand(
  userId: string,
  username: string,
  displayName: string,
  message: string,
  broadcasterId: string,
): Promise<boolean> {
  const text = message.trim().toLowerCase();
  if (!text.startsWith('!')) return false;

  const parts = text.split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  let reply: string | null = null;

  try {
    switch (cmd) {
      case '!hero':
        reply = await cmdHero(userId, displayName, args);
        break;
      case '!stats':
        reply = await cmdStats(userId, displayName);
        break;
      case '!rank':
        reply = await cmdRank(userId, displayName);
        break;
      case '!top':
        reply = await cmdTop();
        break;
      case '!daily':
        reply = await cmdDaily(userId, displayName);
        break;
      case '!comandi':
      case '!help':
        reply = '📖 Comandi: !hero, !stats, !rank, !top, !daily, !comandi';
        break;
    }
  } catch (err) {
    console.error(`Errore comando ${cmd}:`, err);
  }

  if (reply) {
    await sendChatMessage(broadcasterId, reply);
    return true;
  }

  return false;
}

// ===== COMANDI =====

async function cmdHero(userId: string, displayName: string, args: string[]): Promise<string | null> {
  // !hero oppure !hero @nomeutente
  let targetUserId = userId;
  let targetName = displayName;

  if (args.length > 0) {
    const targetUsername = args[0].replace('@', '').toLowerCase();
    const targetUser = await query(
      'SELECT twitch_user_id, display_name FROM users WHERE LOWER(twitch_username) = $1',
      [targetUsername]
    );
    if (targetUser.rows.length === 0) return `@${displayName} Utente "${targetUsername}" non trovato nel gioco.`;
    targetUserId = targetUser.rows[0].twitch_user_id;
    targetName = targetUser.rows[0].display_name;
  }

  const hero = await query(
    'SELECT * FROM heroes WHERE twitch_user_id = $1',
    [targetUserId]
  );

  if (hero.rows.length === 0) return `@${displayName} ${targetName} non ha ancora un eroe!`;

  const h = hero.rows[0];
  const cls = CLASS_LABELS[h.hero_class] || h.hero_class;
  const rar = RARITY_LABELS[h.rarity] || h.rarity;

  return `⚔️ ${h.display_name} — ${cls} ${rar} Lv.${h.level} | HP:${h.hp} ATK:${h.atk} DEF:${h.def} SPD:${h.spd}`;
}

async function cmdStats(userId: string, displayName: string): Promise<string | null> {
  const user = await query(
    'SELECT gold, energy, max_energy, login_streak FROM users WHERE twitch_user_id = $1',
    [userId]
  );
  if (user.rows.length === 0) return `@${displayName} Non sei ancora nel gioco! Apri il pannello sotto il video.`;

  const u = user.rows[0];
  const essences = u.essences || 0;
  const streak = u.login_streak || 0;

  return `📊 @${displayName} — Gold: ${u.gold} | Energia: ${Math.floor(u.energy)}/${u.max_energy} | Essenze: ${essences} | Streak: ${streak}🔥`;
}

async function cmdRank(userId: string, displayName: string): Promise<string | null> {
  const rank = await query(
    `SELECT elo_rating, wins, losses,
       (SELECT COUNT(*) + 1 FROM leaderboard l2 WHERE l2.elo_rating > l.elo_rating) as rank
     FROM leaderboard l WHERE user_id = $1`,
    [userId]
  );

  if (rank.rows.length === 0) return `@${displayName} Non hai ancora giocato in PVP!`;

  const r = rank.rows[0];
  const winRate = (r.wins + r.losses) > 0 ? Math.round((r.wins / (r.wins + r.losses)) * 100) : 0;

  return `🏆 @${displayName} — #${r.rank} | ELO: ${r.elo_rating} | ${r.wins}W/${r.losses}L (${winRate}%)`;
}

async function cmdTop(): Promise<string | null> {
  const top = await query(
    `SELECT h.display_name, h.hero_class, h.level
     FROM heroes h JOIN users u ON u.twitch_user_id = h.twitch_user_id
     WHERE u.opted_in = TRUE
     ORDER BY h.level DESC LIMIT 3`
  );

  if (top.rows.length === 0) return '🏆 Nessun eroe ancora!';

  const medals = ['🥇', '🥈', '🥉'];
  const lines = top.rows.map((h: any, i: number) =>
    `${medals[i]} ${h.display_name} (${CLASS_LABELS[h.hero_class] || h.hero_class} Lv.${h.level})`
  );

  return `🏆 Top eroi: ${lines.join(' | ')}`;
}

async function cmdDaily(userId: string, displayName: string): Promise<string | null> {
  const user = await query(
    'SELECT login_streak, last_login_date FROM users WHERE twitch_user_id = $1',
    [userId]
  );
  if (user.rows.length === 0) return `@${displayName} Non sei ancora nel gioco!`;

  const u = user.rows[0];
  const today = new Date().toISOString().split('T')[0];
  const lastLogin = u.last_login_date ? new Date(u.last_login_date).toISOString().split('T')[0] : null;
  const claimed = lastLogin === today;

  if (claimed) {
    return `@${displayName} Hai gia riscosso il daily! Streak: ${u.login_streak}🔥 Torna domani!`;
  }
  return `@${displayName} Non hai ancora riscosso il daily! Apri il pannello e riscuoti. Streak: ${u.login_streak || 0}🔥`;
}

// ===== INVIO MESSAGGI IN CHAT =====

/**
 * Manda un messaggio in chat tramite Twitch Helix API.
 * Richiede TWITCH_BOT_TOKEN con scope user:write:chat
 */
async function sendChatMessage(broadcasterId: string, message: string): Promise<void> {
  const botToken = process.env.TWITCH_BOT_TOKEN;
  const botUserId = process.env.TWITCH_BOT_USER_ID || broadcasterId;

  if (!botToken) {
    console.log(`[CHAT CMD] ${message}`);
    console.log('[CHAT CMD] TWITCH_BOT_TOKEN non configurato — messaggio non inviato in chat');
    return;
  }

  try {
    await axios.post(
      'https://api.twitch.tv/helix/chat/messages',
      {
        broadcaster_id: broadcasterId,
        sender_id: botUserId,
        message,
      },
      {
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Client-Id': env.twitch.clientId,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err: any) {
    console.error('Errore invio chat:', err.response?.data || err.message);
  }
}
