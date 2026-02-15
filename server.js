const express = require('express');
const multer = require('multer');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const archiver = require('archiver');
const { extractDetails } = require('./extraction_logic');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json()); // Parse JSON request bodies
app.use(express.static('public')); // Serve static files from 'public' directory

// Configure Multer for memory storage (process in RAM)
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to read additional fields from input_fields.txt
function readAdditionalFields() {
    try {
        const filePath = path.join(__dirname, 'input_fields.txt');
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            return content.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
        }
        return [];
    } catch (error) {
        console.error("Error reading input_fields.txt:", error);
        return [];
    }
}

// Helper function to find all *_template.docx files
function findTemplateFiles() {
    try {
        const files = fs.readdirSync(__dirname);
        return files.filter(file => file.endsWith('_template.docx'));
    } catch (error) {
        console.error("Error finding template files:", error);
        return [];
    }
}

// Endpoint 1: Extract data from PDF and return as JSON (with additional manual fields)
app.post('/extract', upload.single('sanctionLetter'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        console.log("Processing file:", req.file.originalname);
        const extractedDetails = await extractDetails(req.file.buffer);
        console.log("Extracted details:", extractedDetails);

        // Read additional fields from input_fields.txt
        const additionalFields = readAdditionalFields();
        console.log("Additional manual fields:", additionalFields);

        // Combine extracted details with empty values for additional fields
        const allFields = { ...extractedDetails };
        additionalFields.forEach(field => {
            if (!(field in allFields)) {
                allFields[field] = ''; // Add empty value for manual entry
            }
        });

        // Return combined data as JSON for user to edit
        res.json(allFields);

    } catch (error) {
        console.error("Error extracting data:", error);
        res.status(500).send("Error extracting data from PDF");
    }
});

// Endpoint 2: Generate multiple DOCX files from all templates
app.post('/generate', async (req, res) => {
    try {
        const details = req.body;
        console.log("Generating DOCX files with data:", details);

        // Find all template files
        const templateFiles = findTemplateFiles();
        console.log("Found template files:", templateFiles);

        if (templateFiles.length === 0) {
            return res.status(404).send("No template files found");
        }

        // Get consumer name for file naming (fallback to "Document" if not found)
        const consumerName = (details['Consumer Name'] || 'Document').replace(/[^a-zA-Z0-9]/g, '_');

        // Create a ZIP archive
        const archive = archiver('zip', { zlib: { level: 9 } });

        // Set response headers for ZIP download
        res.setHeader('Content-Disposition', 'attachment; filename=GeneratedDocuments.zip');
        res.setHeader('Content-Type', 'application/zip');

        // Pipe archive to response
        archive.pipe(res);

        // Generate DOCX for each template
        templateFiles.forEach(templateFile => {
            const templatePath = path.join(__dirname, templateFile);
            const content = fs.readFileSync(templatePath, 'binary');

            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
                delimiters: { start: '{', end: '}' }
            });

            // Render the document with provided details
            doc.render(details);

            // Generate the filled document as a buffer
            const buffer = doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE',
            });

            // Extract template name (remove _template.docx)
            const templateName = templateFile.replace('_template.docx', '');

            // Create filename: ConsumerName_TemplateName.docx
            const outputFileName = `${consumerName}_${templateName}.docx`;

            console.log(`Adding to ZIP: ${outputFileName}`);

            // Add to archive
            archive.append(buffer, { name: outputFileName });
        });

        // Finalize the archive
        archive.finalize();

    } catch (error) {
        console.error("Error generating DOCX:", error);
        res.status(500).send("Error generating documents");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
