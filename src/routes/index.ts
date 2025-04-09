import type { Hono } from 'hono'
import authRoutes from './auth'
import healthRoutes from './health'

export function registerRoutes(app: Hono) {
  app
    .basePath('/api')
    .route('/health', healthRoutes)
    .route('/auth', authRoutes)

  // console.log('Routes registered:', app.routes)
}
