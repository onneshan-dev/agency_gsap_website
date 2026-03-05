import { Hono } from 'hono';
const app = new Hono();
app.get('/', (c) => c.json({ message: 'Task routes - WIP' }));
export default app;