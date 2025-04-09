import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { errorHandler } from './middlewares/error'
import { registerRoutes } from './routes'

const app = new Hono()

app.use('*', logger())
// app.use('*', cors({
//   origin: ["*"],
//   credentials: true,
// }))
app.use('*', secureHeaders())
app.onError(errorHandler)
registerRoutes(app)

export default app
