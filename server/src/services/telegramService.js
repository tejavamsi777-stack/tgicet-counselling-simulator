// Native Node 18+ global fetch is used
const EMOJI_MAP = {
  1: "😡 1/5 (Disappointing)",
  2: "🙁 2/5 (Could Be Better)",
  3: "😐 3/5 (It Was Okay)",
  4: "😊 4/5 (Great Experience!)",
  5: "🤩 5/5 (Loved It! Super Helpful)",
};

const EXAM_TITLE_MAP = {
  "ap-eapcet": "AP EAPCET",
  "tg-eapcet": "TG EAPCET",
  "tg-ecet": "TG ECET",
  "tg-icet": "TG ICET",
  "tg-polycet": "TG POLYCET",
  "tg-pgecet": "TG PGECET",
  "general": "Vuela Learn",
};

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const VUELA_REVIEWS_BOT_TOKEN = "8905801787:AAHKJI0tPsxn3uSaixUXqnmxER0PbZLyApY";
const DEFAULT_CHAT_ID = "1653710477";

export const telegramService = {
  async sendReviewNotification({ rating, feedback, examSlug, user, reqIp }) {
    let botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || VUELA_REVIEWS_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim() || DEFAULT_CHAT_ID;

    // If environment still has the legacy @tgc_review_bot token, redirect to active @vuela_reviews_bot
    if (botToken.startsWith("8419242155")) {
      botToken = VUELA_REVIEWS_BOT_TOKEN;
    }

    if (!botToken || !chatId) {
      console.warn("[TelegramService]: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing.");
      return false;
    }

    const ratingLabel = EMOJI_MAP[rating] || `⭐ ${rating}/5`;
    const examName = EXAM_TITLE_MAP[examSlug] || examSlug?.toUpperCase() || "Vuela Learn";
    const studentInfo = user
      ? `${user.name || "Student"} (${user.email || "Registered"})`
      : "Guest Visitor (Anonymous)";
    const cleanFeedback = feedback && feedback.trim() ? feedback.trim() : "(No written comment provided)";
    const dateFormatted = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const text = `🌟 <b>New Student Review Submitted!</b>
━━━━━━━━━━━━━━━━━━━━
⭐ <b>Rating</b>: ${escapeHtml(ratingLabel)}
🎓 <b>Exam</b>: ${escapeHtml(examName)}
👤 <b>Student</b>: ${escapeHtml(studentInfo)}
🕒 <b>Time</b>: ${escapeHtml(dateFormatted)}

💬 <b>Feedback</b>:
${escapeHtml(cleanFeedback)}
━━━━━━━━━━━━━━━━━━━━`;

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: String(chatId).trim(),
          text: text,
          parse_mode: "HTML",
        }),
      });

      const data = await res.json();
      if (!data?.ok) {
        console.error("[TelegramService]: Telegram API error response:", data);
      }
      return data?.ok === true;
    } catch (err) {
      console.error("[TelegramService]: Failed to send review alert:", err.message);
      return false;
    }
  },
};
