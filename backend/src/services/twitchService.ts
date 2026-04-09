import axios from 'axios';
import { env } from '../config/env';
import * as userService from './userService';
import { handleChannelPointRedemption, CHANNEL_POINT_REWARDS } from './channelPointsService';
import { query } from '../config/database';

let appAccessToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Ottiene un App Access Token da Twitch (per API server-to-server).
 */
async function getAppToken(): Promise<string> {
  if (appAccessToken && Date.now() < tokenExpiresAt) {
    return appAccessToken;
  }

  const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    params: {
      client_id: env.twitch.clientId,
      client_secret: env.twitch.clientSecret,
      grant_type: 'client_credentials',
    },
  });

  appAccessToken = response.data.access_token;
  tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
  return appAccessToken!;
}

/**
 * Recupera username e display name di un utente Twitch dal suo ID.
 */
export async function getTwitchUserInfo(userId: string): Promise<{ login: string; displayName: string } | null> {
  try {
    const token = await getAppToken();
    const response = await axios.get('https://api.twitch.tv/helix/users', {
      params: { id: userId },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': env.twitch.clientId,
      },
    });
    const user = response.data.data?.[0];
    if (!user) return null;
    return { login: user.login, displayName: user.display_name };
  } catch (err) {
    console.error('Errore getTwitchUserInfo:', err);
    return null;
  }
}

/**
 * Registra i webhook EventSub per ricevere eventi dal canale.
 */
export async function registerEventSub(callbackUrl: string): Promise<void> {
  const token = await getAppToken();
  const broadcasterId = env.broadcasterId;

  const subscriptions = [
    {
      type: 'channel.chat.message',
      version: '1',
      condition: { broadcaster_user_id: broadcasterId, user_id: broadcasterId },
    },
    {
      type: 'channel.subscribe',
      version: '1',
      condition: { broadcaster_user_id: broadcasterId },
    },
    {
      type: 'channel.subscription.gift',
      version: '1',
      condition: { broadcaster_user_id: broadcasterId },
    },
    {
      type: 'stream.online',
      version: '1',
      condition: { broadcaster_user_id: broadcasterId },
    },
    {
      type: 'stream.offline',
      version: '1',
      condition: { broadcaster_user_id: broadcasterId },
    },
    {
      type: 'channel.channel_points_custom_reward_redemption.add',
      version: '1',
      condition: { broadcaster_user_id: broadcasterId },
    },
  ];

  for (const sub of subscriptions) {
    try {
      await axios.post(
        'https://api.twitch.tv/helix/eventsub/subscriptions',
        {
          ...sub,
          transport: {
            method: 'webhook',
            callback: `${callbackUrl}/api/twitch/eventsub`,
            secret: env.twitch.extensionSecret,
          },
        },
        {
          headers: {
            'Client-ID': env.twitch.clientId,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`EventSub registrato: ${sub.type}`);
    } catch (err: any) {
      console.error(`Errore registrazione EventSub ${sub.type}:`, err.response?.data || err.message);
    }
  }
}

/**
 * Gestisce gli eventi EventSub ricevuti via webhook.
 */
export async function handleEventSubEvent(
  eventType: string,
  event: any
): Promise<void> {
  switch (eventType) {
    case 'channel.chat.message':
      await handleChatMessage(event);
      break;
    case 'channel.subscribe':
      await handleSubscription(event);
      break;
    case 'channel.subscription.gift':
      await handleGiftSub(event);
      break;
    case 'stream.online':
      console.log('Stream andato online');
      break;
    case 'stream.offline':
      console.log('Stream andato offline');
      break;
    case 'channel.channel_points_custom_reward_redemption.add':
      await handleChannelPointRedeem(event);
      break;
  }
}

/**
 * Quando un utente scrive in chat: +1 messaggio, +1 energia.
 */
async function handleChatMessage(event: any): Promise<void> {
  const userId = event.chatter_user_id;
  const username = event.chatter_user_login;
  const displayName = event.chatter_user_name;

  // Assicurati che l'utente esista nel DB
  await userService.findOrCreateUser(userId, username, displayName);

  // Aggiorna attività
  await userService.addActivity(userId, 'chat', 1);

  // Aggiorna energia
  await query(
    `UPDATE users SET energy = LEAST(max_energy, energy + 1)
     WHERE twitch_user_id = $1`,
    [userId]
  );
}

/**
 * Quando un utente si iscrive: +1 mese sub, +15 energia.
 */
async function handleSubscription(event: any): Promise<void> {
  const userId = event.user_id;
  const username = event.user_login;
  const displayName = event.user_name;

  await userService.findOrCreateUser(userId, username, displayName);
  await userService.addActivity(userId, 'sub', 1);

  await query(
    `UPDATE users SET energy = LEAST(max_energy, energy + 15)
     WHERE twitch_user_id = $1`,
    [userId]
  );
}

/**
 * Gift sub: credita il gifter.
 */
async function handleGiftSub(event: any): Promise<void> {
  const gifterId = event.user_id;
  if (!gifterId) return; // sub anonima

  const gifterUsername = event.user_login;
  const gifterDisplay = event.user_name;
  const total = event.total || 1;

  await userService.findOrCreateUser(gifterId, gifterUsername, gifterDisplay);
  await userService.addActivity(gifterId, 'sub', total);

  // Bonus gold per generosità
  await userService.addGold(gifterId, total * 50);
}

/**
 * Channel Points redemption: mappa il titolo del reward al tipo.
 */
async function handleChannelPointRedeem(event: any): Promise<void> {
  const userId = event.user_id;
  const rewardTitle = event.reward?.title || '';
  const twitchRewardId = event.reward?.id || '';

  // Mappa il titolo del reward Twitch al nostro tipo
  const rewardMap: Record<string, string> = {
    'Boost Energia': 'energy_boost',
    'Ricarica Energia': 'energy_full',
    'Boost EXP': 'exp_boost',
    'Sacchetto d\'Oro': 'gold_pack',
    'Cassa Misteriosa': 'mystery_box',
    'Reroll Abilita': 'reroll',
  };

  // Cerca match parziale nel titolo
  let rewardType: string | null = null;
  for (const [title, type] of Object.entries(rewardMap)) {
    if (rewardTitle.toLowerCase().includes(title.toLowerCase())) {
      rewardType = type;
      break;
    }
  }

  if (!rewardType) {
    console.log(`Channel point reward non riconosciuto: "${rewardTitle}"`);
    return;
  }

  // Assicurati che l'utente esista
  await userService.findOrCreateUser(userId, event.user_login, event.user_name);

  const result = await handleChannelPointRedemption(userId, rewardType, twitchRewardId);
  console.log(`Channel Point redemption: ${userId} -> ${rewardType}: ${result.message}`);
}
