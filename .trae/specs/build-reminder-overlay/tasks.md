# Tasks
- [x] Task 1: 确定最小可用产品与技术方案
  - [x] SubTask 1.1: 确认首版仅支持单条提示词、固定间隔、空格关闭
  - [x] SubTask 1.2: 选定桌面技术栈，优先评估 `Tauri + Web UI`
  - [x] SubTask 1.3: 明确跨平台打包目标与首发平台优先级

- [x] Task 2: 搭建桌面应用骨架与配置入口
  - [x] SubTask 2.1: 创建应用入口与窗口生命周期管理
  - [x] SubTask 2.2: 建立本地配置读取逻辑，支持提示词与间隔秒数
  - [x] SubTask 2.3: 为缺省配置提供合理默认值

- [x] Task 3: 实现周期性全屏提醒能力
  - [x] SubTask 3.1: 实现提醒调度器，按设定秒数触发
  - [x] SubTask 3.2: 实现全屏、置顶、聚焦的提醒覆盖层
  - [x] SubTask 3.3: 在提醒界面渲染提示词文本

- [x] Task 4: 实现键盘取消交互
  - [x] SubTask 4.1: 监听提醒界面的空格键事件
  - [x] SubTask 4.2: 关闭当前提醒并恢复等待下一轮调度
  - [x] SubTask 4.3: 验证重复弹出与取消流程稳定

- [x] Task 5: 完成打包与基础验证
  - [x] SubTask 5.1: 生成无需额外运行环境的可执行产物
  - [x] SubTask 5.2: 验证配置读取、3 秒弹窗、空格关闭三个核心流程
  - [x] SubTask 5.3: 记录后续扩展项的实现边界，不阻塞首版交付

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 4]
