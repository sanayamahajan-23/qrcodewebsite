// app.js
require("dotenv").config();
const express = require("express");
const app = express();
const qr = require("qrcode");
const path = require("path");
const nodemailer = require("nodemailer");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // false for TLS, true for SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});
// Route to render index.ejs
app.get("/", (req, res) => {
  res.render("index", { qrCodeUrl: null });
});

// Route to handle form submission and generate QR code
app.post("/generate", async (req, res) => {
  try {
    const url = req.body.url;
    const qrCodeUrl = await generateQRCode(url);
    res.render("index", { qrCodeUrl });
  } catch (err) {
    res.status(500).send("Error generating QR code");
  }
});
app.post("/send", async (req, res) => {
  //calls sendEmailWithQR
  try {
    const email = req.body.email;
    const qrCodeUrl = req.body.qrCodeUrl;
    console.log("Sending email to:", email);
    console.log("QR code URL:", qrCodeUrl);
    await sendEmailWithQR(email, qrCodeUrl);

    res.send("QR Code sent to your email!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending email");
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
async function fetchImage(url) {
  try {
    // Assuming url is a base64 encoded image URL, you might need to modify this based on your QR code generation logic
    const data = url.split(",")[1];
    return Buffer.from(data, "base64");
  } catch (err) {
    throw err;
  }
}

async function sendEmailWithQR(email, qrCodeUrl) {
  try {
    const qrImage = await fetchImage(qrCodeUrl);
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your QR Code and Image",
      html: `
                <h3>Dear user, here is your QR code:</h3>
                <br />
                <img src="cid:qrCodeUrl" alt="QR Code">
            `,
      attachments: [
        {
          filename: "qrcode.png",
          content: qrImage,
          encoding: "base64",
          cid: qrCodeUrl, // should match cid value in html img src
        },
      ],
    });
    console.log("Email sent: %s", info.messageId);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
