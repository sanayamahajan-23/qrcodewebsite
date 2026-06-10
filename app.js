// app.js
require("dotenv").config();
const express = require("express");
const app = express();
const qr = require("qrcode");
const path = require("path");
const Mailjet = require("node-mailjet");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

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
  try {
    const email = req.body.email;
    const qrCodeUrl = req.body.qrCodeUrl;
    console.log("Sending email to:", email);
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
    const data = url.split(",")[1];
    return Buffer.from(data, "base64");
  } catch (err) {
    throw err;
  }
}

async function sendEmailWithQR(email, qrCodeUrl) {
  const mailjet = Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
  );

  const qrImage = await fetchImage(qrCodeUrl);

  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.SENDER_EMAIL,
          Name: "QR Code Generator",
        },
        To: [{ Email: email }],
        Subject: "Your QR Code",
        HTMLPart:
          '<h3>Dear user, here is your QR code:</h3><br /><img src="cid:qrcode.png" alt="QR Code">',
        Attachments: [
          {
            ContentType: "image/png",
            Filename: "qrcode.png",
            Base64Content: qrImage.toString("base64"),
            ContentID: "qrcode.png",
          },
        ],
      },
    ],
  });

  const response = await request;
  console.log("Email sent:", response.body);
}

module.exports = app;
