const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const fs = require("fs"); // reading system files
const multer = require("multer"); // uploading files
const T = require('tesseract.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploadedImages")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }

});
const upload = multer({ storage: storage }).single('image');

app.set('view engine', 'ejs'); // create folder of html views
app.get("/", (req, res) => {
    res.render("index");
})
app.post('/upload', (req, res) => {
    upload(req, res, err => {
        fs.readFile(`./uploadedImages/${req.file.originalname}`, (err, data) => {
            if (err) return console.log('error', err);
            T.recognize(data, "fra+ara").then(result => {
                res.send(result.data.text)
            }).catch(err => {
                console.log(err.message)
            })

        })
    })
})

app.get("/download", (req, res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file)
})

const www = process.env.WWW || './';
app.use(express.static(www));
console.log(`serving ${www}`);
app.get('*', (req, res) => {
    res.sendFile(`index.html`, { root: www });
});

app.listen(port, () => console.log(`listening on http://localhost:${port}`));