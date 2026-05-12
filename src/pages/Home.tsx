import ReminderOverlay from '@/components/ReminderOverlay'
import { useReminderApp } from '@/hooks/useReminderApp'

export default function Home() {
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
  } = useReminderApp()

  return (
    <ReminderOverlay
      config={config}
      configPath={configPath}
      intervalLabel={summary.intervalLabel}
      nextHint={summary.nextHint}
      isLoading={isLoading}
      isVisible={isVisible}
      error={error}
      countdownMs={countdownMs}
      autoStartEnabled={autoStartEnabled}
      onReload={() => void reloadConfig()}
      onDismiss={() => void hideReminder()}
      onToggleAutoStart={() => void toggleAutoStart()}
    />
  )
}
