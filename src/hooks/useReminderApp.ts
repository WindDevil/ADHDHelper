import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { loadReminderConfig } from '@/services/config'
import type { ReminderConfig } from '@/types/reminder'
import {
  DEFAULT_REMINDER_CONFIG,
  formatIntervalLabel,
  sanitizeReminderConfig,
} from '@/utils/reminder'
import { isTauriRuntime } from '@/utils/tauri'

interface ReminderState {
  config: ReminderConfig
  configPath: string
  isVisible: boolean
  isLoading: boolean
  error: string | null
  lastTriggeredAt: number | null
}

const INITIAL_STATE: ReminderState = {
  config: DEFAULT_REMINDER_CONFIG,
  configPath: '',
  isVisible: false,
  isLoading: true,
  error: null,
  lastTriggeredAt: null,
}

async function callShowReminder() {
  if (!isTauriRuntime()) return
  try {
    await invoke('show_reminder')
  } catch (error) {
    console.error('show_reminder failed:', error)
  }
}

async function callHideReminder() {
  if (!isTauriRuntime()) return
  try {
    await invoke('hide_reminder')
  } catch (error) {
    console.error('hide_reminder failed:', error)
  }
}

export function useReminderApp(slave = false) {
  const [state, setState] = useState(INITIAL_STATE)
  const [countdownMs, setCountdownMs] = useState(0)
  const [autoStartEnabled, setAutoStartEnabled] = useState(false)
  const timerRef = useRef<number | null>(null)
  const cycleStartRef = useRef(Date.now())

  const load = useCallback(async () => {
    try {
      const payload = await loadReminderConfig()
      const config = sanitizeReminderConfig(payload.config)

      setState((current) => ({
        ...current,
        config,
        configPath: payload.configPath,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: error instanceof Error ? error.message : '配置加载失败',
      }))
    }
  }, [])

  // 开机自启状态
  useEffect(() => {
    if (!isTauriRuntime()) return
    isEnabled().then(setAutoStartEnabled).catch(() => {})
  }, [])

  const toggleAutoStart = useCallback(async () => {
    if (!isTauriRuntime()) return
    try {
      if (autoStartEnabled) {
        await disable()
        setAutoStartEnabled(false)
      } else {
        await enable()
        setAutoStartEnabled(true)
      }
    } catch (error) {
      console.error('toggleAutoStart failed:', error)
    }
  }, [autoStartEnabled])

  const hideReminder = useCallback(async () => {
    await callHideReminder()
    setState((current) => ({
      ...current,
      isVisible: false,
    }))
  }, [])

  const showReminder = useCallback(async () => {
    await callShowReminder()
    setState((current) => ({
      ...current,
      isVisible: true,
      lastTriggeredAt: Date.now(),
    }))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (state.isLoading || slave) {
      return undefined
    }

    const intervalMs = state.config.intervalSeconds * 1000
    timerRef.current = window.setInterval(() => {
      void showReminder()
    }, intervalMs)

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current)
      }
    }
  }, [showReminder, state.config.intervalSeconds, state.isLoading, slave])

  // 倒计时（副窗口不运行）
  useEffect(() => {
    if (state.isLoading || slave) return undefined

    const updateCountdown = () => {
      const intervalMs = state.config.intervalSeconds * 1000
      const elapsed = Date.now() - cycleStartRef.current
      const remaining = Math.max(0, Math.ceil((intervalMs - elapsed) / 1000))
      setCountdownMs(remaining)
    }

    if (state.lastTriggeredAt) {
      cycleStartRef.current = state.lastTriggeredAt
    }

    updateCountdown()
    const id = window.setInterval(updateCountdown, 200)
    return () => window.clearInterval(id)
  }, [state.isLoading, state.lastTriggeredAt, state.config.intervalSeconds])

  // 监听 Rust 侧全局快捷键触发的 Space 按下事件（仅主窗口）
  useEffect(() => {
    if (!isTauriRuntime() || slave) return undefined

    let unlisten: (() => void) | undefined
    const setup = async () => {
      const fn = await listen<null>('space-pressed', () => {
        void hideReminder()
      })
      unlisten = fn
    }
    setup()

    return () => {
      unlisten?.()
    }
  }, [hideReminder, slave])

  // 键盘监听作为后备（仅主窗口）
  const isVisibleRef = useRef(false)
  useEffect(() => {
    if (!slave) isVisibleRef.current = state.isVisible
  }, [state.isVisible, slave])

  useEffect(() => {
    if (slave) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      const isSpace = event.code === 'Space' || event.key === ' '
      if (!isSpace || !isVisibleRef.current) return

      event.preventDefault()
      event.stopPropagation()
      setTimeout(() => void hideReminder(), 0)
    }

    window.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [hideReminder])

  const summary = useMemo(
    () => ({
      intervalLabel: formatIntervalLabel(state.config.intervalSeconds),
      nextHint: `每 ${formatIntervalLabel(state.config.intervalSeconds)} 弹出一次全屏提醒`,
    }),
    [state.config.intervalSeconds],
  )

  return {
    ...state,
    countdownMs,
    autoStartEnabled,
    summary,
    hideReminder,
    reloadConfig: load,
    toggleAutoStart,
  }
}
