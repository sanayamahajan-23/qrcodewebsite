// app.js
require('dotenv').config();
const express = require('express');
const app = express();
const qr = require('qrcode');
const path = require('path');
const mailjet = require('node-mailjet').connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// const mg = mailgun({
//     apiKey: '',
//     domain: 'YOUR_MAILGUN_DOMAIN'
//   });
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
app.post('/send', async (req, res) => {  //calls sendEmailWithQR
    try {
        const email = req.body.email;
        const qrCodeUrl = req.body.qrCodeUrl;

        await sendEmailWithQR(email, qrCodeUrl);

        res.send('QR Code sent to your email!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error sending email');
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
async function sendEmailWithQR(email, qrCodeUrl) {
   //make changes here 

   const request = mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "monagupta9086287092@gmail.com",
                        "Name": "sanaya"
                    },
                    "To": [
                        {
                            "Email": email,
                            "Name": "User"
                        }
                    ],
                    "Subject": "Your QR Code",
                    "TextPart": "Here is your QR code",
                    "HTMLPart": `<h3>Dear user, here is your QR code:</h3><br /><img src="${qrCodeUrl}" alt="QR Code"/>`,
                    "CustomID": "QRCodeEmail"
                }
            ]
        });

    return request
        .then((result) => {
            console.log(result.body);
        })
        .catch((err) => {
            console.log(err.statusCode);
            throw err;
        });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
