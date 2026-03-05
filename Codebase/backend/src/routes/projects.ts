import { Hono } from 'hono';
const app = new Hono();
app.get('/', (c) => c.json({ message: 'Project routes - WIP' }));
export default app;