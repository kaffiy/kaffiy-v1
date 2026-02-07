require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Email Configuration
// Users should create a .env file in this directory with:
// EMAIL_USER=your-email@gmail.com
// EMAIL_PASS=your-app-password
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    },
    logger: true,
    debug: true
});

app.post('/api/lead', async (req, res) => {
    const { name, cafeName, city, email, contact } = req.body;

    if (!name || !contact) {
        return res.status(400).json({ error: 'Name and Contact are required' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address (must be the same as auth user for Gmail)
        to: 'team.kaffiy@gmail.com', // Receiver address
        subject: `🚀 Yeni Kaffiy Başvurusu: ${cafeName}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Yeni Pilot Başvurusu</h2>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p><strong>Ad Soyad:</strong> ${name}</p>
          <p><strong>Kafe Adı:</strong> ${cafeName}</p>
          <p><strong>Şehir:</strong> ${city}</p>
          <p><strong>E-posta:</strong> ${email}</p>
          <p><strong>Telefon:</strong> ${contact}</p>
        </div>

        <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
          Bu e-posta kaffiy.com üzerinden gönderilmiştir.
        </p>
      </div>
    `,
    };

    try {
        // If not configured, just log it (for development without credentials)
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('⚠️ Email credentials missing. Logging to console instead:');
            console.log(mailOptions);
            return res.status(200).json({
                message: 'Lead received (Mock mode - Check server console)',
                mock: true
            });
        }

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent for cafe: ${cafeName}`);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('❌ Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.get('/', (req, res) => {
    res.send('Kaffiy Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
