import { Hono } from 'hono'

export const app = new Hono<HonoEnv>()

app.get('/', async (c) => {
  return c.text('OK')
})

export default app
