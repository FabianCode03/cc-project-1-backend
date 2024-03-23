const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware für JSON-Parsing
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Willkommen im Bild-Upload-Service!");
});

// Endpunkt zum Hochladen eines Bildes
app.post("/upload", (req, res) => {
  if (!req.body || !req.body.image) {
    return res.status(400).send("Bitte ein Bild im Base64-Format senden.");
  }

  // Bild aus dem Request extrahieren
  const imageData = req.body.image;
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
    const imageDataJSON = { filename, path: imagePath };
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

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
