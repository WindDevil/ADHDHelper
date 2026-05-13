import { useEffect, useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

import ReminderOverlay from '@/components/ReminderOverlay'
import { useReminderApp } from '@/hooks/useReminderApp'
import { isTauriRuntime } from '@/utils/tauri'

function useIsMainWindow(): boolean {
  const [isMain, setIsMain] = useState(true)
  useEffect(() => {
    if (isTauriRuntime()) {
      try {
        setIsMain(getCurrentWindow().label === 'main')
      } catch {
        setIsMain(true)
      }
    }
  }, [])
  return isMain
}

export default function Home() {
  const slave = !useIsMainWindow()
  const {
    config,
    configPath,
    isLoading,
    isVisible,
    error,
    countdownMs,
    autoStartEnabled,
    reloadConfig,
    hideReminder,
    toggleAutoStart,
    summary,
  } = useReminderApp(slave)

  // 副窗口默认认为当前是可见的（窗口被 Rust 管理显示/隐藏）
  const effectiveVisible = slave || isVisible

  return (
    <ReminderOverlay
      config={config}
      configPath={configPath}
      intervalLabel={summary.intervalLabel}
      nextHint={summary.nextHint}
      isLoading={isLoading}
      isVisible={effectiveVisible}
      error={error}
      countdownMs={countdownMs}
      autoStartEnabled={autoStartEnabled}
      slaveMode={slave}
      onReload={() => void reloadConfig()}
      onDismiss={() => void hideReminder()}
      onToggleAutoStart={() => void toggleAutoStart()}
    />
  )
}
