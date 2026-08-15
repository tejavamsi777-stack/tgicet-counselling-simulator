import nodemailer from "nodemailer";

export const emailService = {
  async sendPasswordResetEmail(to, resetUrl) {
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #312e81; margin-top: 0;">Reset your password</h2>
        <p style="color: #334155; line-height: 1.5;">We received a request to reset the password for your TG Counselling account.</p>
        <div style="margin: 28px 0;">
          <a href="${resetUrl}"
             style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #312e81, #7c3aed, #0e7490); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.4;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `;

    // 1. Check for Resend API Key first (HTTP API is fastest and reliable on cloud hosting)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey !== "re_your_key_here") {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || "TG Counselling <onboarding@resend.dev>";
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject: "Reset your TG Counselling password",
            html,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error("=== Resend API error ===", data);
          throw new Error(data.message || "Failed to send via Resend");
        }

        console.log("Password reset email sent successfully via Resend to:", to, "ID:", data.id);
        return { success: true, provider: "resend", id: data.id };
      } catch (err) {
        console.error("Resend delivery failed:", err.message);
        // If Resend failed, try Gmail SMTP as fallback if configured
      }
    }

    // 2. Fallback to Gmail SMTP via Nodemailer
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        await transporter.sendMail({
          from: `"TG Counselling" <${gmailUser}>`,
          to,
          subject: "Reset your TG Counselling password",
          html,
        });

        console.log("Password reset email sent successfully via Gmail SMTP to:", to);
        return { success: true, provider: "gmail" };
      } catch (err) {
        console.error("=== Gmail SMTP failure ===");
        console.error("message:", err.message);
        console.error("code:", err.code);
        console.error("response:", err.response);
        console.error("===========================");
        throw err;
      }
    }

    console.warn("⚠️ No email provider configured! Please set RESEND_API_KEY or GMAIL_USER + GMAIL_APP_PASSWORD in environment variables.");
    return { success: false, reason: "NO_PROVIDER_CONFIGURED" };
  },
};