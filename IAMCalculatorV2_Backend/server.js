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

// Pricing (Singleton-Dokument)
const pricingSchema = new mongoose.Schema({}, { strict: false });
const PricingModel = mongoose.model('Pricing', pricingSchema, 'Pricing');

const DEFAULT_PRICING = {
  serverRoles: {
    jobservice:          { XS: 200, S: 350, M: 600,  L: 1000, XL: 1800 },
    dbagent:             { XS: 300, S: 500, M: 800,  L: 1200, XL: 2000 },
    webserver:           { XS: 200, S: 350, M: 600,  L: 1000, XL: 1800 },
    appserver:           { XS: 250, S: 400, M: 700,  L: 1100, XL: 1900 },
    webserver_appserver: { XS: 400, S: 650, M: 1100, L: 1800, XL: 3000 },
    jobservice_dbagent:  { XS: 450, S: 700, M: 1200, L: 1900, XL: 3200 },
    mssql:               { XS: 350, S: 550, M: 900,  L: 1400, XL: 2400 }
  },
  sizingDefs: [
    { key: 'XS', cpu: 2,  ram: 4,   storage: 50,   backupStorage: 25,  slaBs: '99.0%', slaBc: '99.5%'  },
    { key: 'S',  cpu: 4,  ram: 8,   storage: 100,  backupStorage: 50,  slaBs: '99.5%', slaBc: '99.9%'  },
    { key: 'M',  cpu: 8,  ram: 16,  storage: 200,  backupStorage: 100, slaBs: '99.5%', slaBc: '99.9%'  },
    { key: 'L',  cpu: 16, ram: 32,  storage: 500,  backupStorage: 250, slaBs: '99.9%', slaBc: '99.99%' },
    { key: 'XL', cpu: 32, ram: 64,  storage: 1000, backupStorage: 500, slaBs: '99.9%', slaBc: '99.99%' }
  ],
  roleDefs: [
    { key: 'jobservice',          label: 'Jobservice',             singleton: false, minSize: 'XS', cpuPer1000: 0.5, ramPer1000: 0.5  },
    { key: 'dbagent',             label: 'DB-Agent',               singleton: true,  minSize: 'S',  cpuPer1000: 1.0, ramPer1000: 2.0  },
    { key: 'webserver',           label: 'Webserver',              singleton: false, minSize: 'XS', cpuPer1000: 0.5, ramPer1000: 1.0  },
    { key: 'appserver',           label: 'Appserver',              singleton: false, minSize: 'S',  cpuPer1000: 1.0, ramPer1000: 1.5  },
    { key: 'webserver_appserver', label: 'Webserver + Appserver',  singleton: false, minSize: 'S',  cpuPer1000: 1.5, ramPer1000: 2.0  },
    { key: 'jobservice_dbagent',  label: 'Jobservice + DB-Agent',  singleton: false, minSize: 'S',  cpuPer1000: 1.5, ramPer1000: 2.5  },
    { key: 'mssql',               label: 'MSSQL Server',           singleton: false, minSize: 'M',  cpuPer1000: 0.5, ramPer1000: 1.0  }
  ],
  consulting: {
    iamConsultantRate: 150,
    ptPerStage: 5,
    ptPerServerPerMonth: 0.5,
    ptPer1000IdentitiesPerMonth: 0.1,
    jobServerThreshold: 5
  },
  currency: 'EUR'
};

app.get('/api/pricing', async (req, res) => {
  try {
    const doc = await PricingModel.findOne({}).lean();
    res.json(doc || DEFAULT_PRICING);
  } catch {
    res.json(DEFAULT_PRICING);
  }
});

app.put('/api/pricing', async (req, res) => {
  try {
    const result = await PricingModel.findOneAndUpdate(
      {},
      { $set: req.body },
      { upsert: true, new: true }
    ).lean();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Speichern der Preiskonfiguration' });
  }
});

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
