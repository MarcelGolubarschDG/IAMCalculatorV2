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





app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
