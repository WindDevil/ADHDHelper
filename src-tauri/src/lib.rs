use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_log::{Target, TargetKind};

const CONFIG_FILE_NAME: &str = "config.json";
const DEFAULT_MESSAGE: &str = "回到当前最重要的事";
const DEFAULT_INTERVAL_SECONDS: u64 = 3;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ReminderConfig {
  message: String,
  interval_seconds: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ReminderConfigPayload {
  config: ReminderConfig,
  config_path: String,
}

impl Default for ReminderConfig {
  fn default() -> Self {
    Self {
      message: DEFAULT_MESSAGE.to_string(),
      interval_seconds: DEFAULT_INTERVAL_SECONDS,
    }
  }
}

fn sanitize_config(config: ReminderConfig) -> ReminderConfig {
  let message = if config.message.trim().is_empty() {
    DEFAULT_MESSAGE.to_string()
  } else {
    config.message.trim().to_string()
  };

  let interval_seconds = config.interval_seconds.max(1);

  ReminderConfig {
    message,
    interval_seconds,
  }
}

fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
  let dir = app
    .path()
    .app_config_dir()
    .map_err(|error| format!("无法获取配置目录: {error}"))?;

  fs::create_dir_all(&dir).map_err(|error| format!("无法创建配置目录: {error}"))?;

  Ok(dir.join(CONFIG_FILE_NAME))
}

fn read_or_create_config(app: &AppHandle) -> Result<ReminderConfigPayload, String> {
  let path = config_path(app)?;

  let config = if path.exists() {
    let content = fs::read_to_string(&path).map_err(|error| format!("无法读取配置文件: {error}"))?;
    let parsed = serde_json::from_str::<ReminderConfig>(&content).unwrap_or_default();
    sanitize_config(parsed)
  } else {
    ReminderConfig::default()
  };

  let serialized =
    serde_json::to_string_pretty(&config).map_err(|error| format!("无法序列化配置: {error}"))?;

  fs::write(&path, serialized).map_err(|error| format!("无法写入配置文件: {error}"))?;

  Ok(ReminderConfigPayload {
    config,
    config_path: path.to_string_lossy().to_string(),
  })
}

#[tauri::command]
fn load_config(app: AppHandle) -> Result<ReminderConfigPayload, String> {
  read_or_create_config(&app)
}

/// 由前端调用：弹出提醒窗口并注册空格全局快捷键
#[tauri::command]
async fn show_reminder(app: AppHandle) -> Result<(), String> {
  let window = app
    .get_webview_window("main")
    .ok_or_else(|| "找不到主窗口".to_string())?;

  window.unminimize().ok();
  window
    .show()
    .map_err(|e| format!("show 失败: {e}"))?;
  window
    .set_always_on_top(true)
    .map_err(|e| format!("set_always_on_top 失败: {e}"))?;
  window
    .set_fullscreen(true)
    .map_err(|e| format!("set_fullscreen 失败: {e}"))?;
  window
    .set_focus()
    .map_err(|e| format!("set_focus 失败: {e}"))?;

  // 注册空格全局快捷键
  let shortcut = Shortcut::new(None, Code::Space);
  app.global_shortcut().register(shortcut).ok();

  log::info!("reminder shown, global shortcut registered");
  Ok(())
}

/// 由前端调用：关闭提醒并注销快捷键
#[tauri::command]
async fn hide_reminder(app: AppHandle) -> Result<(), String> {
  let window = app
    .get_webview_window("main")
    .ok_or_else(|| "找不到主窗口".to_string())?;

  window
    .set_fullscreen(false)
    .map_err(|e| format!("退出全屏失败: {e}"))?;
  window
    .set_always_on_top(false)
    .map_err(|e| format!("取消置顶失败: {e}"))?;
  window.minimize().ok();

  // 注销快捷键
  let space = Shortcut::new(None, Code::Space);
  app.global_shortcut().unregister(space).ok();

  log::info!("reminder hidden, global shortcut unregistered");
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(
      tauri_plugin_log::Builder::new()
        .targets([
          Target::new(TargetKind::Stdout),
          Target::new(TargetKind::LogDir { file_name: None }),
          Target::new(TargetKind::Webview),
        ])
        .level(log::LevelFilter::Info)
        .build(),
    )
    .plugin(
      tauri_plugin_global_shortcut::Builder::new()
        .with_handler(move |app, shortcut, event| {
          if event.state != ShortcutState::Pressed {
            return;
          }
          if shortcut.matches(Modifiers::default(), Code::Space) {
            log::info!("global shortcut: Space pressed");
            // 注意：这里不做任何窗口操作或注销快捷键，
            // 因为 handler 在插件工作线程中运行，且持有内部锁，
            // 调用 unregister 会导致死锁。
            // 仅发射事件通知前端，由前端通过 invoke 在主线程执行窗口操作。
            let _ = app.emit("space-pressed", ());
          }
        })
        .build(),
    )
    .invoke_handler(tauri::generate_handler![load_config, show_reminder, hide_reminder])
    .setup(|app| {
      log::info!("app setup begin");
      match read_or_create_config(&app.handle()) {
        Ok(payload) => {
          log::info!("config ready: {}", payload.config_path);
        }
        Err(error) => {
          log::error!("config init failed: {error}");
        }
      }

      if let Some(window) = app.get_webview_window("main") {
        if let Err(error) = window.show() {
          log::error!("window.show failed: {error}");
        }
        if let Err(error) = window.set_focus() {
          log::error!("window.set_focus failed: {error}");
        }
      } else {
        log::error!("main window not found");
      }

      log::info!("app setup end");
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
