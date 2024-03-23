const { log } = require("console");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Cors Middleware
app.use(cors());

// Middleware für JSON-Parsing
app.use(express.json());

// Middleware für Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} to ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Willkommen im Bild-Upload-Service!");
});

// Endpunkt zum Hochladen eines Bildes
app.options("/upload", cors()); // Aktiviert CORS-Präfluganfragen für den /upload-Endpunkt
app.post("/upload", (req, res) => {
  if (!req.body || !req.body.image) {
    console.log("Kein Bild im Request gefunden.");
    return res.status(400).send("Bitte ein Bild im Base64-Format senden.");
  }

  // Bild aus dem Request extrahieren
  const imageData = req.body.image;
  console.log("Bild empfangen.", imageData);
  // Bild in einen Buffer konvertieren
  const imageBuffer = Buffer.from(imageData, "base64");
  // Eindeutigen Dateinamen generieren
  const filename = Date.now() + ".png"; // Hier können Sie die Dateierweiterung entsprechend ändern

  // Pfad zum Speichern des Bildes
  const imagePath = path.join(__dirname, "images", filename);

  // Bild in den Dateispeicher schreiben
  fs.writeFile(imagePath, imageBuffer, err => {
    if (err) {
      console.error("Fehler beim Speichern des Bildes:", err);
      return res.status(500).send("Fehler beim Speichern des Bildes.");
    }

    // Metadaten zum JSON hinzufügen
    const imageDataJSON = {
      filename,
      path: imagePath,
      url: `http://cc-project-1-backend.azurewebsites.net/images/${filename}`,
    };
    const images = JSON.parse(fs.readFileSync("images.json", "utf8"));
    images.push(imageDataJSON);
    fs.writeFileSync("images.json", JSON.stringify(images, null, 2));

    res.send("Bild erfolgreich hochgeladen.");
  });
});

// Endpunkt zum Abrufen aller Bilder
app.get("/images", (req, res) => {
  // Metadaten aus der JSON-Datei lesen
  const images = JSON.parse(fs.readFileSync("images.json", "utf8"));
  res.json(images);
});

// Endpunkt zum herunterladen eines Bildes
app.get("/images/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, "images", filename);

  fs.readFile(imagePath, { encoding: "base64" }, (err, data) => {
    if (err) {
      console.error("Fehler beim Lesen der Datei:", err);
      return res.status(500).send("Fehler beim Lesen der Datei.");
    }

    res.send(data);
  });
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
