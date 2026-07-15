import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const emailService = {
  async sendPasswordResetEmail(to, resetUrl) {
    try {
      await transporter.sendMail({
        from: `"TG Counselling" <${process.env.GMAIL_USER}>`,
        to,
        subject: "Reset your TG Counselling password",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #312e81;">Reset your password</h2>
            <p>We got a request to reset the password for your TG Counselling account.</p>
            <p>
              <a href="${resetUrl}"
                 style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #312e81, #7c3aed, #0e7490); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Reset Password
              </a>
            </p>
            <p style="color: #64748b; font-size: 13px;">
              This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    } catch (err) {
      // Logged in full, one field per line, so it survives compact log
      // viewers (like Render's) that don't expand nested error objects or
      // the `cause` chain. This is what actually tells us WHY Gmail
      // rejected the send (bad app password, account locked, etc.) instead
      // of just "something went wrong."
      console.error("=== Password reset email SMTP failure ===");
      console.error("message:", err.message);
      console.error("code:", err.code);
      console.error("command:", err.command);
      console.error("response:", err.response);
      console.error("responseCode:", err.responseCode);
      console.error("==========================================");

      const wrapped = new Error("Failed to send reset email");
      wrapped.status = 502;
      throw wrapped;
    }
  },
};