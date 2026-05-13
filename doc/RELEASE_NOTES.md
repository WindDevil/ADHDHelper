# v0.1.0-beta.1 — 开发版

## 📢 版本说明

这是 ADHD Helper 的首个公开测试版，核心功能已基本开发完成，但仍可能存在未发现的 bug 和稳定性问题。

**⚠️ 重要提示：本版本为测试版，请勿在生产环境中使用！**

本次测试的主要目标是验证全屏提醒机制在多屏环境下的可用性，以及全局快捷键的兼容性。

---

## ✨ 主要新功能

- **全屏定时提醒** — 按可配置的秒数间隔，在所有显示器上同步弹出全屏提示
- **全局快捷键关闭** — 按 Space 一键关闭提醒，应用自动回到系统托盘
- **多显示器同步** — 插入多个显示器时，每个屏幕同时显示提醒，一个空格全部关闭
- **系统托盘常驻** — 应用运行时不占用任务栏，隐藏在右下角系统托盘
- **开机自启** — 界面一键切换开机自启状态
- **配置热重载** — 修改 `config.json` 后点击按钮即时生效，无需重启
- **自定义提醒文案** — 支持任意中英文提示语

---

## 🔧 改进与优化

- 全局快捷键改为 Rust 侧实现，避免 WebView2 键盘事件不可靠的问题
- 副显示器窗口使用独立 WebView 实例但不运行独立定时器，避免重复弹窗
- 托盘菜单包含显示窗口 / 开机自启 / 退出三项操作
- 优化了窗口隐藏/显示逻辑，从 `hide()` 改为 `minimize()` 保持 WebView2 活跃
- 去除了 Trae.ai 植入的广告插件（`vite-plugin-trae-solo-badge`）

---

## 🐛 Bug 修复

- 修复了全局快捷键在 WebView2 中不可用的问题（改用 `tauri-plugin-global-shortcut`）
- 修复了快捷键处理器内部死锁导致应用卡死的问题
- 修复了倒计时显示卡在 "1秒后" 的问题
- 修复了多屏场景下副窗口独立计时导致弹窗错乱的问题
- 修复了隐藏窗口后 WebView2 焦点丢失的问题

---

## ⚠️ 已知问题

- **窗口切换短暂的视觉闪烁**：提醒弹出时，从最小化到全屏的过程中可能出现短暂的黑屏或闪烁，属于 WebView2 窗口状态切换的固有限制
- **副窗口创建延迟**：在多显示器场景下，首次弹出时副屏幕窗口的创建可能需要几百毫秒，并非完全同步
- **Space 键冲突**：全局快捷键注册的 Space 在当前窗口聚焦时会同时触发系统行为（如翻页），虽然用 `preventDefault` 做了处理，但部分场景下可能仍有冲突
- **仅支持 Windows**：当前仅测试了 Windows 10/11 环境，macOS 和 Linux 未构建和测试
- **无卸载程序**：当前仅提供 exe 文件，未打包安装程序，需手动删除文件和 `%APPDATA%\com.solo.adhdhelper` 配置目录
- **日志文件持续写入**：启用日志时会持续在 `%APPDATA%\Local\com.solo.adhdhelper\logs` 写入日志文件，长期运行需注意磁盘空间

---

## 📦 安装与使用

### 系统要求

- Windows 10 或 Windows 11
- 已安装 Microsoft Edge WebView2 运行时（Windows 11 自带，Windows 10 通常已预装）

### 下载与运行

1. 从 Release 页面下载 `adhd_helper_console.exe`（带控制台日志）或 `adhd_helper.exe`（无控制台窗口）
2. 双击运行即可 — 应用启动后自动隐藏在系统托盘
3. 等待定时器触发全屏提醒，或左键点击托盘图标手动打开窗口

### 修改配置

```
Windows: %APPDATA%\com.solo.adhdhelper\config.json
```

```json
{
  "message": "回到当前最重要的事",
  "intervalSeconds": 10
}
```

修改后点击界面中的 **「重新加载配置」** 按钮生效。

### 构建

```bash
# 构建前端
npm run build

# 构建桌面应用
npx tauri build --no-bundle
cd src-tauri && cargo build --release --bin adhd_helper_console
```

---

## 💬 反馈与交流

如有任何问题、bug 或建议，请通过以下方式反馈：

- GitHub Issues：[https://github.com/WindDevil/ADHDHelper/issues](https://github.com/WindDevil/ADHDHelper/issues)
- 知乎：[@堕天使](https://www.zhihu.com/people/duo-tian-shi-38-10)

感谢大家参与测试！
