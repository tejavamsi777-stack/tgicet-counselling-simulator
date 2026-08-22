import fetch from "node-fetch";

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

export const telegramService = {
  async sendReviewNotification({ rating, feedback, examSlug, user, reqIp }) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("[TelegramService]: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing.");
      return false;
    }

    const ratingLabel = EMOJI_MAP[rating] || `⭐ ${rating}/5`;
    const examName = EXAM_TITLE_MAP[examSlug] || examSlug?.toUpperCase() || "TG Counselling";
    const studentInfo = user
      ? `${user.name || "Student"} (${user.email || "Registered"})`
      : "Guest Visitor (Anonymous)";
    const cleanFeedback = feedback && feedback.trim() ? feedback.trim() : "_(No written comment provided)_";
    const dateFormatted = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const text = `🌟 *New Student Review Submitted!*
━━━━━━━━━━━━━━━━━━━━
⭐ *Rating*: ${ratingLabel}
🎓 *Exam*: ${examName}
👤 *Student*: ${studentInfo}
🕒 *Time*: ${dateFormatted}

💬 *Feedback*:
${cleanFeedback}
━━━━━━━━━━━━━━━━━━━━`;

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "Markdown",
        }),
      });

      const data = await res.json();
      return data?.ok === true;
    } catch (err) {
      console.error("[TelegramService]: Failed to send review alert:", err.message);
      return false;
    }
  },
};
