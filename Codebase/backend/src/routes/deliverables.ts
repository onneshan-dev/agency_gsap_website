import { Hono } from 'hono';
const app = new Hono();
app.get('/', (c) => c.json({ message: 'Deliverable routes - WIP' }));
export default app;