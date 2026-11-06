// ============================================
// Contact Form Backend for Portfolio
// ============================================

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// EMAIL SETUP
// ============================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ============================================
// CONTACT FORM ENDPOINT
// ============================================
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validate
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and message are required.'
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address.'
        });
    }

    try {
        // 1. Send notification to YOU
        await transporter.sendMail({
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `Portfolio: ${subject || 'New Message'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #2563eb;">New message from your portfolio</h2>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
                    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                    <p><strong>Subject:</strong> ${escapeHtml(subject || 'N/A')}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-line;">${escapeHtml(message)}</p>
                </div>
            `
        });

        // 2. Send auto-reply to the visitor
        await transporter.sendMail({
            from: `"Jackson Ziwa" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Thanks for reaching out, ${name.split(' ')[0]}!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #2563eb;">Hi ${escapeHtml(name.split(' ')[0])},</h2>
                    <p>Thank you for contacting me through my portfolio. I've received your message and will get back to you as soon as possible.</p>
                    <p>For reference, here's what you sent:</p>
                    <blockquote style="border-left: 4px solid #2563eb; padding-left: 15px; color: #555; margin: 20px 0;">
                        ${escapeHtml(message)}
                    </blockquote>
                    <p>Best regards,<br><strong>Jackson Ziwa</strong></p>
                    <p style="font-size: 0.85rem; color: #888;">University of Zambia | BSc Computer Science (Networking & Cybersecurity)</p>
                </div>
            `
        });

        console.log(`✅ Contact form received from ${email}`);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('❌ Email send error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
});

// ============================================
// HELPER: Prevent HTML injection in emails
// ============================================
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============================================
// EXPORT FOR VERCEL
// ============================================
module.exports = app;