import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { authenticate } from './middleware/auth.js';
import { setupChatSocket } from './websocket/chat.js';

import proposalRoutes from './routes/proposals.js';
import chatRoutes from './routes/chat.js';
import quoteRoutes from './routes/quotes.js';
import agreementRoutes from './routes/agreements.js';
import projectRoutes from './routes/projects.js';
import milestoneRoutes from './routes/milestones.js';
import taskRoutes from './routes/tasks.js';
import deliverableRoutes from './routes/deliverables.js';
import revisionRoutes from './routes/revisions.js';
import teamRoutes from './routes/team.js';
import paymentRoutes from './routes/payments.js';
import notificationRoutes from './routes/notifications.js';
import slaRoutes from './routes/sla.js';
import templateRoutes from './routes/templates.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();
const httpServer = createServer(app);

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

const io = new Server(httpServer, {
  cors: { origin: frontendUrl, credentials: true },
});

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/proposals', authenticate, proposalRoutes);
app.use('/api/chat', authenticate, chatRoutes);
app.use('/api/quotes', authenticate, quoteRoutes);
app.use('/api/agreements', authenticate, agreementRoutes);
app.use('/api/projects', authenticate, projectRoutes);
app.use('/api/projects', authenticate, milestoneRoutes);
app.use('/api/projects', authenticate, taskRoutes);
app.use('/api/projects', authenticate, deliverableRoutes);
app.use('/api/projects', authenticate, revisionRoutes);
app.use('/api/team', authenticate, teamRoutes);
app.use('/api/invoices', authenticate, paymentRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);
app.use('/api/sla', authenticate, slaRoutes);
app.use('/api/templates', authenticate, templateRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);

setupChatSocket(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
