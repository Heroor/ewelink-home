declare global {
  interface HonoBindings {
    APPID: string
    APP_SECRET: string
    DEVICE_ID: string
    REDIRECT_URL: string
    KV: KVNamespace
  }
  interface HonoEnv {
    Bindings: HonoBindings
  }
}

export {}
