// app.js
require('dotenv').config();
const express = require('express');
const app = express();
const qr = require('qrcode');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Route to render index.ejs
app.get('/', (req, res) => {
    res.render('index', { qrCodeUrl: null });
});

app.post('/generate', async (req, res) => {
    try {
        const url = req.body.url;
        const qrCodeUrl = await generateQRCode(url);
        res.render('index', { qrCodeUrl });
    } catch (err) {
        res.status(500).send('Error generating QR code');
    }
});
app.post('/send', async (req, res) => {
    try {
        const email = req.body.email;
        const qrCodeUrl = req.body.qrCodeUrl;

        // Save the QR code to a file
        const base64Data = qrCodeUrl.replace(/^data:image\/png;base64,/, '');
        const qrCodePath = path.join(__dirname, 'qrcode.png');
        fs.writeFileSync(qrCodePath, base64Data, 'base64');

        // Send the email with the QR code attached
        await sendEmailWithQR(email, qrCodePath);

        // Clean up the QR code file
        fs.unlinkSync(qrCodePath);

        res.send('QR Code sent to your email!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error sending email');
    }
});
// Function to generate QR code
async function generateQRCode(url) {
    try {
        const qrCodeUrl = await qr.toDataURL(url);
        return qrCodeUrl;
    } catch (err) {
        throw err;
    }
}
async function sendEmailWithQR(toEmail, qrCodePath) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from:process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Your QR Code',
        text: 'Please find the attached QR Code.',
        attachments: [
            {
                filename: 'qrcode.png',
                path: qrCodePath
            }
        ]
    };

    await transporter.sendMail(mailOptions);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
