#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

// use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent, SystemTrayMenuItem };
use tauri::Manager;

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
  // Close splashscreen
  if let Some(splashscreen) = window.get_window("splashscreen") {
    splashscreen.close().unwrap();
  }
  // Show main window
  window.get_window("main").unwrap().show().unwrap();
  window.get_window("main").unwrap().set_focus().unwrap();
}


fn main() {
  // let tray_menu = SystemTrayMenu::new(); // insert the menu items here
  // let system_tray = SystemTray::new()
  //   .with_menu(tray_menu);

  // let quit = CustomMenuItem::new("quit".to_string(), "退出");
  // let hide = CustomMenuItem::new("hide".to_string(), "隐藏");
  // let show = CustomMenuItem::new("show".to_string(), "显示");
  // let tray_menu = SystemTrayMenu::new()
  //   .add_item(quit)
  //   .add_native_item(SystemTrayMenuItem::Separator)
  //   .add_item(hide)
  //   .add_native_item(SystemTrayMenuItem::Separator)
  //   .add_item(show);
    // let system_tray = SystemTray::new()
    // .with_menu(tray_menu);

  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![close_splashscreen])
    // .system_tray(system_tray)
    .on_window_event(|event| match event.event() {
      // tauri::WindowEvent::Focused(focused) => {        
      //   // hide window whenever it loses focus
      //   // if !focused {
      //   //   event.window().hide().unwrap();
      //   // }
      // }
      tauri::WindowEvent::CloseRequested { api, .. } => {
        api.prevent_close();
        event.window().hide().unwrap();
      }
      _ => {}
    })
    // .on_system_tray_event(|app, event| match event {
    //   SystemTrayEvent::LeftClick {
    //     position: _,
    //     size: _,
    //     ..
    //   } => {
    //     // println!("system tray received a left click");
    //   }
    //   SystemTrayEvent::RightClick {
    //     position: _,
    //     size: _,
    //     ..
    //   } => {
    //     // println!("system tray received a right click");
    //   }
    //   SystemTrayEvent::DoubleClick {
    //     position: _,
    //     size: _,
    //     ..
    //   } => {
    //     // println!("system tray received a double click");
    //     let window = app.get_window("main").unwrap();
    //     window.show().unwrap();
    //     window.unminimize().unwrap();
    //     window.set_focus().unwrap();
    //   }
    //   SystemTrayEvent::MenuItemClick { id, .. } => {
    //     match id.as_str() {
    //       "quit" => {
    //         std::process::exit(0);
    //       }
    //       "hide" => {
    //         let window = app.get_window("main").unwrap();
    //         window.hide().unwrap();
    //       }
    //       "show" => {
    //         let window = app.get_window("main").unwrap();
    //         window.show().unwrap();
    //         window.unminimize().unwrap();
    //         window.set_focus().unwrap();
    //       }
    //       _ => {}
    //     }
    //   }
    //   _ => {}
    // })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
