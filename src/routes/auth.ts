import { Hono } from 'hono'

export const app = new Hono<HonoEnv>()

app.post('/login', async (c) => {
  return c.json({
    status: 'success',
    message: 'Logged in successfully',
  })
})

export default app
