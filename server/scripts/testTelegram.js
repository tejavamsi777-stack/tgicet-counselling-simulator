import fetch from "node-fetch";

const BOT_TOKEN = "8419242155:AAG8BjY3b_F7wjAzOfBksXHjgLieQS7UxVw";
const CHAT_ID = "1653710477";

async function testTelegram() {
  const text = `🎉 *TG Counselling Simulator Alert!*
  
Bot connected successfully! Review alerts will be sent directly here.`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: "Markdown",
      }),
    });
    const data = await res.json();
    console.log("Telegram API Response:", data);
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
  }
}

testTelegram();
