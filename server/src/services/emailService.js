import nodemailer from "nodemailer";

export const emailService = {
  async sendPasswordResetEmail(to, resetUrl) {
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #312e81; margin-top: 0;">Reset your password</h2>
        <p style="color: #334155; line-height: 1.5;">We received a request to reset the password for your Vuela Learn account.</p>
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

    // 1. Resend API via HTTPS (Port 443 - Bypasses all cloud hosting SMTP firewall blocks)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey.startsWith("re_")) {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || "Vuela Learn <onboarding@resend.dev>";
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject: "Reset your Vuela Learn password",
            html,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          console.log("✅ Password reset email sent successfully via Resend to:", to, "ID:", data.id);
          return { success: true, provider: "resend", id: data.id };
        } else {
          console.warn("⚠️ Resend notice:", data.message || data.name);
        }
      } catch (err) {
        console.error("Resend delivery failed:", err.message);
      }
    }

    // 2. Brevo API via HTTPS (Port 443 - free 300 emails/day to ANY email address)
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      try {
        const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.GMAIL_USER || "tejavamsi777@gmail.com";
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": brevoApiKey.trim(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: { name: "Vuela Learn", email: senderEmail },
            to: [{ email: to }],
            subject: "Reset your Vuela Learn password",
            htmlContent: html,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          console.log("✅ Password reset email sent successfully via Brevo to:", to, "ID:", data.messageId);
          return { success: true, provider: "brevo", id: data.messageId };
        } else {
          console.warn("⚠️ Brevo notice:", data.message);
        }
      } catch (err) {
        console.error("Brevo delivery failed:", err.message);
      }
    }

    // 3. Gmail SMTP via Nodemailer (Port 587 STARTTLS with IPv4)
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false, // Use STARTTLS on port 587
          family: 4,
          auth: {
            user: gmailUser.trim(),
            pass: gmailPass.replace(/\s+/g, ""),
          },
          connectionTimeout: 8000,
        });

        await transporter.sendMail({
          from: `"Vuela Learn" <${gmailUser.trim()}>`,
          to,
          subject: "Reset your Vuela Learn password",
          html,
        });

        console.log("✅ Password reset email sent successfully via Gmail SMTP to:", to);
        return { success: true, provider: "gmail" };
      } catch (err) {
        console.error("=== Gmail SMTP failure ===");
        console.error("message:", err.message);
        console.error("code:", err.code);
        console.error("===========================");
        throw err;
      }
    }

    console.warn("⚠️ No working email provider configured. Please set RESEND_API_KEY, BREVO_API_KEY, or GMAIL_USER + GMAIL_APP_PASSWORD.");
    return { success: false, reason: "NO_PROVIDER_CONFIGURED" };
  },
};