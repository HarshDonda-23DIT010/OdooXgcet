import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create reusable transporter
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Email templates 
export const emailTemplates = {
  verification: (otp, userName) => ({
    subject: "Email Verification OTP - Employee Management System",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #097087 0%, #23CED9 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .otp-box { background: linear-gradient(135deg, #FCA47C 0%, #F9D779 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 42px; font-weight: bold; letter-spacing: 8px; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); margin: 10px 0; }
            .warning { background-color: #FCA47C; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; background-color: #f8f9fa; font-size: 12px; color: #666; }
            .highlight { color: #097087; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Email Verification</h1>
            </div>
            <div class="content">
              <h2 style="color: #097087;">Hello ${userName || 'User'}!</h2>
              <p>Thank you for registering with our Employee Management System.</p>
              <p>Your One-Time Password (OTP) for email verification is:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: white; font-size: 14px;">Your OTP Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: white; font-size: 12px;">Valid for 10 minutes</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This OTP will expire in <strong>10 minutes</strong></li>
                  <li>Do not share this OTP with anyone</li>
                  <li>We will never ask for your OTP via phone or email</li>
                </ul>
              </div>
              
              <p>If you didn't request this verification, please ignore this email or contact support if you have concerns.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><span class="highlight">Employee Management Team</span></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Employee Management System. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
        </body>
      </html>
    `,
  }),

  welcome: (userName) => ({
    subject: "Welcome to Employee Management System",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome Aboard!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Your email has been successfully verified.</p>
              <p>You can now log in to your account and start using our Employee Management System.</p>
              <p>Features available to you:</p>
              <ul>
                <li>Profile Management</li>
                <li>Attendance Tracking</li>
                <li>Leave Management</li>
                <li>Salary Information</li>
              </ul>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Employee Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

// Send email function
export const sendEmail = async (to, template) => {
  try {
    // Verify connection before sending
    await transporter.verify();
    console.log("📧 SMTP connection verified");

    const info = await transporter.sendMail({
      from: `"Employee Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });

    console.log("✅ Email sent successfully: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error("Email authentication failed. Please check EMAIL_USER and EMAIL_PASSWORD in .env");
    } else if (error.code === 'ESOCKET') {
      throw new Error("Network error. Please check your internet connection");
    } else if (error.code === 'EENVELOPE') {
      throw new Error("Invalid email address");
    } else {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
};
