import type { Context } from 'hono'
import { InternalServerError } from '@/utils/errors'
import eWeLink from 'ewelink-api-next'
import { Hono } from 'hono'
import { randomString } from '../utils/string'

export const app = new Hono<HonoEnv>()

interface TokenData { accessToken: string, atExpiredTime: number, refreshToken: string, rtExpiredTime: number, region: string }
let tokenData: TokenData | null
let client: InstanceType<typeof eWeLink.WebAPI>

app.get('/login', async (c) => {
  await initClient(c)
  const loginUrl = client.oauth.createLoginUrl({
    redirectUrl: c.env.REDIRECT_URL,
    grantType: 'authorization_code',
    state: randomString(10),
  })
  return c.redirect(loginUrl)
})

app.get('/redirectUrl', async (c) => {
  await initClient(c)
  const { region, code } = c.req.query()
  const res = await client.oauth.getToken({
    region,
    redirectUrl: c.env.REDIRECT_URL,
    code,
  }) as unknown as { error: number, msg: string, data: TokenData }
  if (res.error !== 0) {
    console.error(res)
    throw new InternalServerError(res.msg)
  }
  tokenData = {
    ...res.data,
    region,
  }
  await c.env.KV.put('token', JSON.stringify(tokenData))
  return c.json({
    status: 'success',
    message: 'Login success',
    data: tokenData,
  })
})

app.get('/switch', async (c) => {
  await initClient(c)
  if (!await validateToken(c, tokenData)) {
    throw new InternalServerError('Token validation failure')
  }

  const res = await client.device.setThingStatus({
    type: 1,
    id: c.env.DEVICE_ID,
    params: {
      switches: [
        { switch: 'on', outlet: 0 },
        { switch: 'off', outlet: 1 },
        { switch: 'off', outlet: 2 },
        { switch: 'off', outlet: 3 },
      ],
    },
  }) as unknown as { error: number, msg: string }
  if (res.error !== 0) {
    console.error(res)
    throw new InternalServerError(res.msg)
  }
  return c.json({
    status: 'success',
    message: 'Device switch success',
  })
})

async function initClient(c: Context<HonoEnv>) {
  const config = {
    appId: c.env.APPID,
    appSecret: c.env.APP_SECRET,
    region: 'cn',
    requestRecord: false,
  }
  console.log('Client initialized')
  client = client ?? new eWeLink.WebAPI(config)

  const tokenJSON = await c.env.KV.get('token')
  if (tokenJSON !== null) {
    tokenData = JSON.parse(tokenJSON) as TokenData
    client.at = tokenData.accessToken
    client.region = tokenData.region
    client.setUrl(tokenData.region)
  }
}

async function validateToken(c: Context<HonoEnv>, token: TokenData | null) {
  if (token === null) {
    throw new InternalServerError('Token not found')
  }
  if (token.atExpiredTime < Date.now() && token.rtExpiredTime > Date.now()) {
    const refreshStatus = await client.user.refreshToken({
      rt: token.refreshToken,
    }) as unknown as { error: number, msg: string, data: { at: string, rt: string } }
    if (refreshStatus.error !== 0) {
      console.error(refreshStatus.msg)
      throw new InternalServerError(refreshStatus.msg)
    }
    token.accessToken = refreshStatus.data.at
    token.refreshToken = refreshStatus.data.rt
    token.atExpiredTime = token.atExpiredTime + 2592000000
    token.rtExpiredTime = token.rtExpiredTime + 5184000000
    await c.env.KV.put('token', JSON.stringify(token))
    return true
  }
  if (token.rtExpiredTime < Date.now()) {
    throw new InternalServerError('Token expired')
  }
  return true
}

export default app
