import { describe, expect, it } from 'vitest'

import {
  DEFAULT_REMINDER_CONFIG,
  formatIntervalLabel,
  sanitizeReminderConfig,
} from '@/utils/reminder'

describe('sanitizeReminderConfig', () => {
  it('在缺失输入时返回默认配置', () => {
    expect(sanitizeReminderConfig()).toEqual(DEFAULT_REMINDER_CONFIG)
  })

  it('会修正空白提示词和非法间隔', () => {
    expect(
      sanitizeReminderConfig({
        message: '   ',
        intervalSeconds: 0,
      }),
    ).toEqual(DEFAULT_REMINDER_CONFIG)
  })

  it('会保留有效配置并裁剪秒数为整数', () => {
    expect(
      sanitizeReminderConfig({
        message: '去做当前最重要的任务',
        intervalSeconds: 3.8,
      }),
    ).toEqual({
      message: '去做当前最重要的任务',
      intervalSeconds: 3,
    })
  })
})

describe('formatIntervalLabel', () => {
  it('格式化秒数字段', () => {
    expect(formatIntervalLabel(5)).toBe('5 秒')
  })
})
