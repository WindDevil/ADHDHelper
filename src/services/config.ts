import { invoke } from '@tauri-apps/api/core'

import type { ReminderConfigPayload } from '@/types/reminder'
import { DEFAULT_REMINDER_CONFIG } from '@/utils/reminder'
import { isTauriRuntime } from '@/utils/tauri'

const FALLBACK_CONFIG_PATH = '浏览器预览模式下未创建本地配置文件'

export async function loadReminderConfig(): Promise<ReminderConfigPayload> {
  if (!isTauriRuntime()) {
    return {
      config: DEFAULT_REMINDER_CONFIG,
      configPath: FALLBACK_CONFIG_PATH,
    }
  }

  return invoke<ReminderConfigPayload>('load_config')
}
