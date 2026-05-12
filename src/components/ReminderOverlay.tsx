import { AlertCircle, Keyboard, RefreshCcw } from 'lucide-react'
import { useEffect, useRef } from 'react'

import type { ReminderConfig } from '@/types/reminder'

interface ReminderOverlayProps {
  config: ReminderConfig
  configPath: string
  intervalLabel: string
  nextHint: string
  isLoading: boolean
  isVisible: boolean
  error: string | null
  countdownMs: number
  onReload: () => void
  onDismiss: () => void
}

export default function ReminderOverlay({
  config,
  configPath,
  intervalLabel,
  nextHint,
  isLoading,
  isVisible,
  error,
  countdownMs,
  onReload,
  onDismiss,
}: ReminderOverlayProps) {
  const mainRef = useRef<HTMLElement>(null)

  // 提醒出现时自动聚焦，延迟确保 WebView2 完成全屏/焦点过渡
  useEffect(() => {
    if (isVisible && mainRef.current) {
      const timer = setTimeout(() => {
        mainRef.current?.focus()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  const countdownLabel = isVisible
    ? '提醒中'
    : countdownMs > 0
      ? `${countdownMs}秒后`
      : '即将提醒...'

  return (
    <main
      ref={mainRef}
      tabIndex={-1}
      className={`app-shell ${isVisible ? 'app-shell--active' : ''}`}
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      onKeyDown={(e) => {
        if ((e.code === 'Space' || e.key === ' ') && isVisible) {
          e.preventDefault()
          onDismiss()
        }
      }}
    >
      <div className="app-shell__grain" />
      <section className="panel">
        <div className="panel__badge">
          <span className="panel__dot" />
          专注提醒
        </div>

        <p className="panel__status">
          {isLoading ? '正在读取本地配置...' : isVisible ? '提醒中' : '后台等待下一次提醒'}
        </p>

        <h1 className="panel__message">{config.message}</h1>

        <div className="panel__meta">
          <span>提醒间隔 {intervalLabel}</span>
          <span>{nextHint}</span>
        </div>

        <div className="panel__countdown">
          下次提醒：{countdownLabel}
        </div>

        <div className="panel__hint">
          <Keyboard size={18} />
          <span>按空格关闭当前提醒，应用继续在后台等待下一轮。</span>
        </div>

        <div className="panel__footer">
          <div className="panel__config">
            <span className="panel__label">配置文件</span>
            <code>{configPath || '正在生成配置文件路径...'}</code>
          </div>

          <button type="button" className="panel__button" onClick={onReload}>
            <RefreshCcw size={16} />
            重新加载配置
          </button>
        </div>

        {error ? (
          <div className="panel__error" role="status">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : null}
      </section>
    </main>
  )
}
