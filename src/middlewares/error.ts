import type { Context } from 'hono'
import type { ServerErrorStatusCode } from 'hono/utils/http-status'
import { AppError } from '@/utils/errors'
import { HTTPException } from 'hono/http-exception'

export function errorHandler(error: Error, c: Context) {
  console.error('[=Error=]', error)
  if (error instanceof AppError) {
    return c.json({
      status: error.status,
      message: error.message,
    }, error.statusCode as ServerErrorStatusCode)
  }
  else if (error instanceof HTTPException) {
    if (error.res?.statusText === 'Unauthorized') {
      return c.json({
        status: 'fail',
        message: 'Unauthorized',
      }, 401)
    }
  }
  return c.json({
    status: 'error',
    message: 'Internal Server Error',
  }, 500)
}
