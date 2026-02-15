const fs = require('fs');

// Polyfill DOMMatrix for pdf-parse (pdfjs-dist dependency issue in Node)
if (!global.DOMMatrix) {
    global.DOMMatrix = class DOMMatrix {
        constructor() {
            this.a = 1; this.b = 0;
            this.c = 0; this.d = 1;
            this.e = 0; this.f = 0;
        }
    };
}

const { PDFParse } = require('pdf-parse');

const extractDetails = async (buffer) => {
    try {
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        const text = data.text;

        console.log("Extracted Text Preview:", text.substring(0, 500)); // Log for debugging

        const details = {};

        // Helper function to clean extracted text
        const clean = (str) => str ? str.trim() : "Not Found";

        // Regex Patterns - Adapted for common Sanction Letter formats

        // 1. Sanction No
        // Stop capturing before Date or tab characters
        const sanctionNoMatch = text.match(/(?:Sanction\s*No\.?|Sanction\s*Number)[:\s]*([^\n\r\t]+?)(?=\s*(?:Date|$))/i);
        details['Sanction No'] = clean(sanctionNoMatch ? sanctionNoMatch[1] : null);

        // 2. Consumer Name & 3. Address
        // Strategy: Capture everything between "To," and "Pin code" using a block capture regex.
        // Filter out lines that start with "Office Name" or "Date"
        const toBlockMatch = text.match(/To,\s*([\s\S]*?)(?=\s*Pin\s*code)/i);

        if (toBlockMatch && toBlockMatch[1]) {
            const block = toBlockMatch[1].trim();
            // Split by newlines and filter out empty lines and metadata lines
            const lines = block.split(/\r?\n/)
                .map(l => l.trim())
                .filter(l => l.length > 0)
                .filter(l => !l.match(/^(?:Office\s*Name|Date)\s*[:]/i)); // Skip Office Name and Date lines

            if (lines.length > 0) {
                details['Consumer Name'] = clean(lines[0]);
                // Address is the rest of the lines joined together
                if (lines.length > 1) {
                    details['Address'] = clean(lines.slice(1).join(" "));
                } else {
                    details['Address'] = "Not Found";
                }
            } else {
                details['Consumer Name'] = "Not Found";
                details['Address'] = "Not Found";
            }
        } else {
            // Fallback to simpler regex if the block isn't found
            const nameMatch = text.match(/(?:Consumer\s*Name|Name\s*of\s*Consumer|Applicant\s*Name)[:\s]*([^\n\r]+)/i);
            details['Consumer Name'] = clean(nameMatch ? nameMatch[1] : null);

            const addressMatch = text.match(/(?:Address|Consumer\s*Address)[:\s]*([\s\S]*?)(?=\n\s*(?:Mobile|Email|Sanction|Load|Tariff|District)|$)/i);
            if (addressMatch) {
                details['Address'] = addressMatch[1].replace(/\r?\n|\r/g, " ").trim();
            } else {
                details['Address'] = "Not Found";
            }
        }

        // 4. Pincode
        const pinMatch = text.match(/Pin\s*code\s*[:\s]*(\d{6})/i);
        details['Pincode'] = clean(pinMatch ? pinMatch[1] : "Not Found");

        // 5. Mobile
        const mobileMatch = text.match(/Mobile\s*[:\s]*([0-9]+)/i) ||
            text.match(/(?:Mobile\s*No\.?|Mobile\s*Number|Contact\s*No\.?)[:\s]*([+\-0-9]+)/i);
        details['Mobile'] = clean(mobileMatch ? mobileMatch[1] : null);

        // 6. Email
        const emailMatch = text.match(/(?:Email|E-mail|Email\s*ID)[:\s]*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
        details['Email'] = clean(emailMatch ? emailMatch[1] : null);

        // 7. Consumer Number / CA Number
        const consumerNoMatch = text.match(/(?:Consumer\s*Number|Consumer\s*No\.?|CA\s*No\.?|Account\s*No\.?)\s*[:\s]*(\d+)/i);
        details['Consumer Number'] = clean(consumerNoMatch ? consumerNoMatch[1] : null);

        // 8. Application No
        const appNoMatch = text.match(/Application\s*No\.?\s*(\d+)/i);
        details['Application No'] = clean(appNoMatch ? appNoMatch[1] : null);

        // 9. Sanction Load
        // Load might have units like KW, KVA. capture number and unit.
        // Try precise match first, then generic
        const loadMatch = text.match(/Sanction\s*Letter\s*for\s*([0-9.]+\s*(?:KW|KVA|HP)?)/i) ||
            text.match(/(?:Sanction(?:ed)?\s*Load|Connected\s*Load)[:\s]*([0-9.]+\s*(?:KW|KVA|HP)?)/i);
        details['Sanction Load'] = clean(loadMatch ? loadMatch[1] : null);

        return details;

    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw error;
    }
};

module.exports = { extractDetails };
