import type { ReminderConfig } from '@/types/reminder'

export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  message: '回到当前最重要的事',
  intervalSeconds: 3,
}

export function sanitizeReminderConfig(
  input?: Partial<ReminderConfig> | null,
): ReminderConfig {
  const message = input?.message?.trim()
  const rawInterval = Number(input?.intervalSeconds)
  const intervalSeconds =
    Number.isFinite(rawInterval) && rawInterval >= 1
      ? Math.floor(rawInterval)
      : DEFAULT_REMINDER_CONFIG.intervalSeconds

  return {
    message: message || DEFAULT_REMINDER_CONFIG.message,
    intervalSeconds,
  }
}

export function formatIntervalLabel(intervalSeconds: number): string {
  return `${intervalSeconds} 秒`
}
