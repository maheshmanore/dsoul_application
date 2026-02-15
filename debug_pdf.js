const fs = require('fs');

if (!global.DOMMatrix) {
    global.DOMMatrix = class DOMMatrix {
        constructor() {
            this.a = 1; this.b = 0;
            this.c = 0; this.d = 1;
            this.e = 0; this.f = 0;
        }
    };
}

const pdf = require('pdf-parse');

const output = [
    `Type of pdf export: ${typeof pdf}`,
    `Is Array? ${Array.isArray(pdf)}`,
    `Keys: ${Object.keys(pdf).join(', ')}`,
    `PDF default type: ${typeof pdf.default}`,
    `PDF itself structure: ${JSON.stringify(pdf, null, 2)}`
].join('\n');

fs.writeFileSync('pdf_debug.log', output);
console.log('Debug complete');
