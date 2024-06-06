// app.js

const express = require('express');
const app = express();
const qr = require('qrcode');
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Route to render index.ejs
app.get('/', (req, res) => {
    res.render('index', { qrCodeUrl: null });
});

// Route to handle form submission and generate QR code
app.post('/generate', async (req, res) => {
    try {
        const url = req.body.url;
        const qrCodeUrl = await generateQRCode(url);
        res.render('index', { qrCodeUrl });
    } catch (err) {
        res.status(500).send('Error generating QR code');
    }
});

// Function to generate QR code
async function generateQRCode(url) {
    try {
        return await qr.toDataURL(url);
    } catch (err) {
        throw err;
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
