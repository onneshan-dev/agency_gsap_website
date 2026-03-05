import { Hono } from 'hono';
const app = new Hono();
app.get('/', (c) => c.json({ message: 'Team routes - WIP' }));
export default app;