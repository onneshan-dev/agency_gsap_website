import { Hono } from 'hono';
const app = new Hono();
app.get('/', (c) => c.json({ message: 'Analytics routes - WIP' }));
export default app;