declare global {
  interface HonoBindings {
    APPID: string
    APP_SECRET: string
  }
  interface HonoEnv {
    Bindings: HonoBindings
  }
}

export {}
