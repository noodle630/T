#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::command;
use serde::{Deserialize, Serialize};
use serde_json::json;
use dotenv::dotenv;
use std::env;

#[derive(Debug, Deserialize)]
struct PromptInput {
    prompt: String,
}

#[command]
async fn ask_gpt(input: PromptInput) -> Result<String, String> {
    let client = reqwest::Client::new();
    let api_key = env::var("OPENAI_API_KEY").map_err(|e| e.to_string())?;

    let res = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&json!({
            "model": "gpt-3.5-turbo",
            "messages": [{ "role": "user", "content": input.prompt }]
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let body: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    println!("🔍 GPT response: {}", body);
    let content = body["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("No response")
        .to_string();

    Ok(content)
}

fn main() {
    dotenv().ok(); // ⬅️ THIS is what reads your `.env` file

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![ask_gpt])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}