import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from './config/env';
import { heroRoutes } from './routes/heroes';
import { userRoutes } from './routes/users';
import { battleRoutes } from './routes/battles';
import { partyRoutes } from './routes/parties';
import { itemRoutes } from './routes/items';
import { raidRoutes } from './routes/raid';
import { shopRoutes } from './routes/shop';
import { missionRoutes } from './routes/missions';
import { twitchRoutes } from './routes/twitch';
import { achievementRoutes } from './routes/achievements';
import { zoneRoutes } from './routes/zones';
import { twitchAuth } from './middleware/twitchAuth';

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

// Routes Twitch webhook (NON protette da auth - Twitch manda direttamente)
app.use('/api/twitch', twitchRoutes);

// Routes protette da auth Twitch
app.use('/api/users', twitchAuth, userRoutes);
app.use('/api/heroes', twitchAuth, heroRoutes);
app.use('/api/parties', twitchAuth, partyRoutes);
app.use('/api/battles', twitchAuth, battleRoutes);
app.use('/api/items', twitchAuth, itemRoutes);
app.use('/api/raid', twitchAuth, raidRoutes);
app.use('/api/shop', twitchAuth, shopRoutes);
app.use('/api/missions', twitchAuth, missionRoutes);
app.use('/api/achievements', twitchAuth, achievementRoutes);
app.use('/api/zones', twitchAuth, zoneRoutes);

// WebSocket per aggiornamenti real-time
io.on('connection', (socket) => {
  console.log(`Client connesso: ${socket.id}`);

  socket.on('join-channel', (channelId: string) => {
    socket.join(`channel:${channelId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnesso: ${socket.id}`);
  });
});

// Export per uso nei services
export { io };

httpServer.listen(env.port, () => {
  console.log(`Server avviato su porta ${env.port}`);
  console.log(`Ambiente: ${env.nodeEnv}`);
});
