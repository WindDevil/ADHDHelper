export interface ReminderConfig {
  message: string
  intervalSeconds: number
}

export interface ReminderConfigPayload {
  config: ReminderConfig
  configPath: string
}
