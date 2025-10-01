import nodemailer from "nodemailer";

// Create transporter (using Gmail as example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Simple email sending function
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Bookstore" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

// Order confirmation email
export const sendOrderConfirmation = async (order, user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .order-details { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e1e1e1; }
            .item { padding: 10px 0; border-bottom: 1px solid #eee; }
            .total { font-weight: bold; font-size: 1.1em; margin-top: 15px; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📚 Order Confirmation</h1>
            </div>
            
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Thank you for your order! Here are your order details:</p>
            
            <div class="order-details">
                <h3>Order #${order.orderNumber}</h3>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                
                <h4>Items:</h4>
                ${order.items.map(item => `
                    <div class="item">
                        <strong>${item.title}</strong><br>
                        Quantity: ${item.qty} × KES ${item.price.toLocaleString()} = KES ${(item.qty * item.price).toLocaleString()}
                    </div>
                `).join('')}
                
                <div class="total">
                    <p>Subtotal: KES ${order.subtotal?.toLocaleString()}</p>
                    <p>Shipping: KES ${order.shipping?.toLocaleString()}</p>
                    <p>Total: KES ${order.total?.toLocaleString()}</p>
                </div>
            </div>
            
            <p>We'll notify you when your order ships. If you have any questions, please contact our support team.</p>
            
            <div class="footer">
                <p>Best regards,<br><strong>Bookstore Team</strong></p>
                <p>&copy; 2024 Bookstore. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return await sendEmail(
    user.email,
    `Order Confirmation - ${order.orderNumber}`,
    html
  );
};

// Welcome email
export const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Bookstore!</h1>
            </div>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Thank you for registering with Bookstore! We're excited to have you as part of our reading community.</p>
            <p>Start exploring our extensive collection of books and discover your next favorite read.</p>
            <p>Happy reading! 📖</p>
            <br>
            <p>Best regards,<br><strong>The Bookstore Team</strong></p>
        </div>
    </body>
    </html>
  `;

  return await sendEmail(
    user.email,
    "Welcome to Bookstore!",
    html
  );
};

// Password reset email
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px; }
            .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Password Reset</h1>
            </div>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
            <p>This link will expire in 1 hour.</p>
            <br>
            <p>Best regards,<br><strong>The Bookstore Team</strong></p>
        </div>
    </body>
    </html>
  `;

  return await sendEmail(
    user.email,
    "Password Reset Request - Bookstore",
    html
  );
};

// Test email function
export const testEmail = async () => {
  const testHtml = `
    <div>
      <h2>Test Email</h2>
      <p>This is a test email from Bookstore API.</p>
      <p>If you're receiving this, email configuration is working correctly! ✅</p>
    </div>
  `;

  return await sendEmail(
    process.env.SMTP_USER,
    "Bookstore API - Test Email",
    testHtml
  );
};