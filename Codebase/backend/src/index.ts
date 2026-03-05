import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';

// Import route handlers (we'll create Hono versions)
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

// Environment bindings type
type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY: string;
  WHATSAPP_API_KEY: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use(logger());
app.use(cors({
  origin: (origin, c) => c.env.FRONTEND_URL || 'http://localhost:5173',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
}));

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'cloudflare-workers'
  });
});

// Mount routes
app.route('/api/proposals', proposalRoutes);
app.route('/api/chat', chatRoutes);
app.route('/api/quotes', quoteRoutes);
app.route('/api/agreements', agreementRoutes);
app.route('/api/projects', projectRoutes);
app.route('/api/milestones', milestoneRoutes);
app.route('/api/tasks', taskRoutes);
app.route('/api/deliverables', deliverableRoutes);
app.route('/api/revisions', revisionRoutes);
app.route('/api/team', teamRoutes);
app.route('/api/invoices', paymentRoutes);
app.route('/api/notifications', notificationRoutes);
app.route('/api/sla', slaRoutes);
app.route('/api/templates', templateRoutes);
app.route('/api/analytics', analyticsRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;