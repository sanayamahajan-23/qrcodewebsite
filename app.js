import express from "express";
import path from "path";
import qrcode from "qrcode";
import bodyParser from "body-parser";

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index', { qrCodeUrl: null });
});

app.post('/generate', (req, res) => {
    const url = req.body.url;

    qrcode.toDataURL(url, (err, src) => {
        if (err) res.send('Error occurred');

        res.render('index', { qrCodeUrl: src });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
