export const aiChatController = {
  async handleChat(req, res) {
    try {
      const { message, examSlug, rank, category } = req.body || {};
      const query = (message || "").toLowerCase().trim();

      if (!query) {
        return res.status(400).json({ error: "Message content is required." });
      }

      // Check if external LLM API key is set
      const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (geminiApiKey) {
        try {
          const systemPrompt = `You are Vuela AI Counselor, the official AI admission assistant for AP & TG counselling (EAPCET, ICET, ECET, POLYCET, PGECET). Provide concise, accurate, encouraging, and clear markdown responses. User details if provided: Exam: ${examSlug || "All AP/TG"}, Rank: ${rank || "N/A"}, Category: ${category || "N/A"}.`;
          
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\nStudent Query: ${query}` }] }]
            })
          });

          const data = await response.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return res.json({ success: true, reply: replyText, source: "gemini-ai" });
          }
        } catch (llmErr) {
          console.warn("[Local AI Chatbot] Gemini fallback:", llmErr.message);
        }
      }

      // Local Knowledge Engine (0ms, 100% offline local resolution)
      let reply = "";

      if (query.includes("rank") || query.includes("predict") || query.includes("chance") || query.includes("cutoff")) {
        reply = `🎯 **College Prediction & Cutoff Guidance**\n\n` +
          `To get exact college matches based on your rank:\n` +
          `1. Go to our **[College Predictor Tool](/exams/${examSlug || "tg-eapcet"}/predictor)**.\n` +
          `2. Enter your rank, caste category, and gender.\n` +
          `3. Select your preferred branches & districts.\n\n` +
          `✨ *Tip:* Our predictor uses verified 2024–2026 seat allotment data to calculate your **Safe**, **Moderate**, and **Risky** college matches!`;
      } else if (query.includes("document") || query.includes("certificate") || query.includes("verification") || query.includes("hlc")) {
        reply = `📑 **Mandatory Document Checklist for HLC Verification**\n\n` +
          `Please bring originals + 2 sets of xerox copies to the Help Line Centre (HLC):\n\n` +
          `- 📄 **Entrance Rank Card & Hall Ticket**\n` +
          `- 🎓 **Qualifying Exam Marks Memo** (Inter / Degree / Diploma / SSC)\n` +
          `- 📜 **Study / Bonafide Certificates** (Classes 4th to 10th / Inter for local status)\n` +
          `- 🏷️ **MeeSeva Caste Certificate** (for BC, SC, ST reservation)\n` +
          `- 💰 **MeeSeva Income Certificate** (issued **on or after Jan 01, 2026** for ePASS Tuition Fee Reimbursement)\n` +
          `- 🏢 **EWS Certificate** (for 10% OC supernumerary quota)\n` +
          `- ♿ **Special Quota Certs** (PH SADAREM, CAP, NCC, Sports — *Masab Tank HLC only*)\n\n` +
          `👉 Check your status on our **[Document Checklist Tool](/tg-eapcet/documents)**!`;
      } else if (query.includes("fee") || query.includes("reimbursement") || query.includes("epass") || query.includes("rtf")) {
        reply = `💰 **Tuition Fee Reimbursement (RTF / ePASS) Rules**\n\n` +
          `- **Eligibility:** Parental annual income must be **≤ ₹2.00 Lakh** (Rural) or **≤ ₹1.50 Lakh** (Urban).\n` +
          `- **Income Certificate:** Must be issued by Tahsildar/MeeSeva **on or after January 01, 2026**.\n` +
          `- **Coverage:** 100% full tuition fee reimbursement for SC/ST students & eligible BC/EWS students in Convener quota seats.\n` +
          `- **Management Quota:** Spot admission & B-category management seats are **NOT** eligible for fee reimbursement.`;
      } else if (query.includes("web option") || query.includes("option") || query.includes("freeze") || query.includes("sliding")) {
        reply = `💡 **Web Options & Sliding Rules**\n\n` +
          `- **Exercising Options:** Give as many college preferences as possible in order of your priority.\n` +
          `- **Seat Supersession Rule:** If you get allotted a higher preference college in Final Phase, your Phase-1 seat is automatically cancelled.\n` +
          `- **Voluntary Cancellation Bar:** Do **NOT** voluntarily cancel your seat unless you are sure, as cancelled candidates are barred from Phase 2.\n\n` +
          `🎮 Practice setting up your options in our **[Mock Counselling Web Options Simulator](/exams/${examSlug || "tg-eapcet"}/mock-counselling)**!`;
      } else if (query.includes("date") || query.includes("schedule") || query.includes("phase") || query.includes("when")) {
        reply = `📅 **Counselling Phase Schedule**\n\n` +
          `- **First Phase:** Registration, HLC Verification & Web Options Entry.\n` +
          `- **Final Phase:** Re-verification for unverified candidates & fresh option entry.\n` +
          `- **Spot Admissions:** Institutional admissions for leftover vacant seats.\n\n` +
          `🔍 Visit the **[Notifications & Schedule Tracker](/exams/${examSlug || "tg-eapcet"})** for live updates!`;
      } else {
        reply = `👋 **Hello! I am Vuela AI Counselor.**\n\n` +
          `I can help you with admission guidance for AP & TG Entrance Exams (**EAPCET, ICET, ECET, POLYCET, PGECET**).\n\n` +
          `You can ask me about:\n` +
          `- 🎯 *Colleges eligible for your rank*\n` +
          `- 📑 *Required documents for HLC verification*\n` +
          `- 💰 *Tuition Fee Reimbursement (RTF/ePASS) rules*\n` +
          `- 💡 *Web Options filing strategies*\n` +
          `- 🏛️ *Top colleges comparison & cutoffs*\n\n` +
          `*Try asking:* "What documents are needed for verification?" or "Predict colleges for rank 15000"`;
      }

      return res.json({ success: true, reply, source: "local-knowledge-engine" });
    } catch (err) {
      console.error("[AI Chatbot Error]:", err);
      return res.status(500).json({ error: "Failed to process chat message." });
    }
  },
};
