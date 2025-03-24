const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const mustacheExpress = require('mustache-express');
const execSync = require('child_process');

const app = express();
const PORT = process.env.PORT || 8080;
const STORAGE_PATH = process.env.STORAGE_PATH || '.';
const DOWNLOAD_PASSWORD = process.env.DOWNLOAD_PASSWORD || 'defaultpass';

if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(express.static('public'));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', 'views');

// Home page con la lista dei file
app.get('/', (req, res) => {
    const IP = getIP();
    fs.readdir(STORAGE_PATH, (err, files) => {
        if (err) {
            return res.status(500).send('Errore nel recupero dei file');
        }
        res.render('index', { title: 'NAS Demo', files, IP: IP });
    });
});

app.get('/upload', (req, res) => {
    const IP = getIP();
    res.render('upload',{IP: IP});
});

app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('Nessun file incluso!');
    }
    
    let uploadedFile = req.files.file;
    let filePath = path.join(STORAGE_PATH, uploadedFile.name);
    
    uploadedFile.mv(filePath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.redirect('/');
    });
});

app.post('/download', (req, res) => {
    const { filename, password } = req.body;
    
    if (!filename || !password) {
        return res.status(400).send('Parametro mancante!');
    }
    
    if (password !== DOWNLOAD_PASSWORD) {
        return res.status(403).send('Password errata!');
    }
    
    let filePath = path.join(STORAGE_PATH, filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File non trovato!');
    }
});

app.listen(PORT, () => {
    console.log(`NAS Demo in esecuzione su porta ${PORT}`);
});

function getIP() {
    try {
        // Esegui il comando shell per ottenere l'IP
        const ip = execSync.execSync("ip route get 1.1.1.1 | awk '{print $7}'").toString().trim();
        return ip;
    } catch (error) {
        console.error("Errore nel recupero dell'IP:", error);
        return "Errore nel recupero dell'IP";
    }
 }