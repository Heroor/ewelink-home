import { Hono } from 'hono'

export const app = new Hono<HonoEnv>()

app.get('/', async (c) => {
  console.log(await c.env.KV.get('token'))
  return c.text('OK')
})

export default app
