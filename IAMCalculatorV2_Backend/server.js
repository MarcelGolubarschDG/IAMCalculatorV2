require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB-Verbindung
mongoose.connect(process.env.MONGO_URI, {
  user: "admin",
  pass: "secret"
})
.then(() => console.log("MongoDB verbunden"))
.catch(err => console.error(err));

app.use(cors());
app.use(express.json());

// Schema definieren
const calculatorSchema = new mongoose.Schema({}, { strict: false });
const Calculator = mongoose.model('IAMCalculator', calculatorSchema, 'IAMCalculator');

// API-Endpunkt zum Abrufen aller Dokumente
app.get('/api/calculation', async (req, res) => {
  try {
    const results = await Calculator.find({}).lean();
    res.json(results);
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
});

// API-Endpunkt zum Abrufen eines Dokuments nach ObjectId
app.get('/api/calculation/id/:oid', async (req, res) => {
  try {
    const { oid } = req.params;
    const result = await Calculator.findOne({ _id: new mongoose.Types.ObjectId(oid) }).lean();
    if (!result) {
      return res.status(404).json({ message: 'Dokument nicht gefunden' });
    }
    res.json(result);
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
});

// API-Endpunkt zum Abrufen eines Dokuments nach calculationName
app.get('/api/calculation/name/:calculationName', async (req, res) => {
  try {
    const { calculationName } = req.params;
    const result = await Calculator.findOne({ 'basicform.calculationName': calculationName }).lean();
    if (!result) {
      return res.status(404).json({ message: 'Dokument nicht gefunden' });
    }
    res.json(result);
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
});

// API-Endpunkt zum Speichern eines JSON-Dokuments in der MongoDB
app.post('/api/calculation', async (req, res) => {
  try {
    const { body } = req; // Die Daten aus dem Request-Body (JSON)
    
    // Erstelle ein neues Calculator-Dokument
    const newCalculation = new Calculator(body);

    // Speichere das Dokument in der Datenbank
    const savedCalculation = await newCalculation.save();
    
    // Gibt das gespeicherte Dokument als Antwort zurück
    res.status(201).json(savedCalculation);
  } catch (error) {
    console.error('Fehler beim Speichern der Daten:', error);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
});

// API-Endpunkt zum Aktualisieren eines Dokuments nach ObjectId
app.put('/api/calculation/id/:oid', async (req, res) => {
  try {
    const { oid } = req.params; // Die ObjectId aus den URL-Parametern
    const { body } = req; // Die Daten, die im Request-Body zum Aktualisieren enthalten sind
    
    // Versuche, das Dokument mit der gegebenen ObjectId zu finden und zu aktualisieren
    const updatedCalculation = await Calculator.findByIdAndUpdate(
      new mongoose.Types.ObjectId(oid), // Die ObjectId des zu aktualisierenden Dokuments
      body, // Die neuen Daten, die das Dokument ersetzen sollen
      { new: true } // Gibt das aktualisierte Dokument zurück
    ).lean();
    
    if (!updatedCalculation) {
      return res.status(404).json({ message: 'Dokument nicht gefunden' });
    }

    // Antwort mit dem aktualisierten Dokument
    res.json(updatedCalculation);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Daten:', error);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
});

// API-Endpunkt zum Löschen eines Dokuments nach ObjectId
app.delete('/api/calculation/id/:oid', async (req, res) => {
  try {
    const { oid } = req.params; // Die ObjectId aus den URL-Parametern
    console.log('Attempting to delete document with ID:', oid); // Debugging
    
    // Löscht das Dokument mit der gegebenen ObjectId
    const deletedCalculation = await Calculator.findByIdAndDelete(new mongoose.Types.ObjectId(oid));
    
    if (!deletedCalculation) {
      console.log('Document not found for ID:', oid); // Debugging
      return res.status(404).json({ message: 'Dokument nicht gefunden' });
    }

    // Antwort mit einer Bestätigung, dass das Dokument gelöscht wurde
    res.json({ message: 'Dokument erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Daten:', error);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
});






app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
