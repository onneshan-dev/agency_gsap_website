import { Hono } from 'hono';
const app = new Hono();
app.get('/', (c) => c.json({ message: 'Payment routes - WIP' }));
export default app;