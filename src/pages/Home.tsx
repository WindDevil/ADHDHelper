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
    reloadConfig,
    hideReminder,
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
      onReload={() => void reloadConfig()}
      onDismiss={() => void hideReminder()}
    />
  )
}
