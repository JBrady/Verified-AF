// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command(rename_all = "camelCase")]
fn verify_pgp_signature(signature_path: String, file_path: String) -> Result<String, String> {
    let output = std::process::Command::new("gpg")
        .arg("--verify")
        .arg(&signature_path)
        .arg(&file_path)
        .output()
        .map_err(|e| e.to_string())?;
    // Capture both stdout and stderr
    let stdout_str = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr_str = String::from_utf8_lossy(&output.stderr).to_string();
    if output.status.success() {
        // gpg outputs verification details on stderr; prefer stderr if non-empty
        if !stderr_str.is_empty() {
            Ok(stderr_str)
        } else {
            Ok(stdout_str)
        }
    } else {
        Err(stderr_str)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, verify_pgp_signature])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
