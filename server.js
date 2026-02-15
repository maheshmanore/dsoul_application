const express = require('express');
const multer = require('multer');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { extractDetails } = require('./extraction_logic');

const app = express();
const port = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json()); // Parse JSON request bodies
app.use(express.static('public')); // Serve static files from 'public' directory

// Configure Multer for memory storage (process in RAM)
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint 1: Extract data from PDF and return as JSON
app.post('/extract', upload.single('sanctionLetter'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        console.log("Processing file:", req.file.originalname);
        const details = await extractDetails(req.file.buffer);
        console.log("Extracted details:", details);

        // Return extracted data as JSON for user to edit
        res.json(details);

    } catch (error) {
        console.error("Error extracting data:", error);
        res.status(500).send("Error extracting data from PDF");
    }
});

// Endpoint 2: Generate DOCX from provided data
app.post('/generate', async (req, res) => {
    try {
        const details = req.body;
        console.log("Generating DOCX with data:", details);

        // Read the template file
        const templatePath = path.join(__dirname, 'wcr_template.docx');
        const content = fs.readFileSync(templatePath, 'binary');

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: { start: '{', end: '}' }  // Use single braces to avoid Word splitting issues
        });

        // Set the template variables with provided details
        doc.render(details);

        // Generate the filled document as a buffer
        const buffer = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        // Set headers for download
        res.setHeader('Content-Disposition', 'attachment; filename=SanctionLetterDetails.docx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

        res.send(buffer);

    } catch (error) {
        console.error("Error generating DOCX:", error);
        res.status(500).send("Error generating document");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
