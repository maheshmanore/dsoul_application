const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } = require('docx');
const fs = require('fs');

// Create a clean template with proper placeholders
const doc = new Document({
    sections: [{
        properties: {},
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Sanction Letter Details",
                        bold: true,
                        size: 32,
                    }),
                ],
                spacing: { after: 400 },
            }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "Consumer Name", bold: true })],
                                width: { size: 30, type: WidthType.PERCENTAGE },
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "{Consumer Name}" })],
                                width: { size: 70, type: WidthType.PERCENTAGE },
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "Consumer Number", bold: true })],
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "{Consumer Number}" })],
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "Address", bold: true })],
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "{Address}" })],
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "Pincode", bold: true })],
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "{Pincode}" })],
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "Sanction No", bold: true })],
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "{Sanction No}" })],
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "Sanction Load", bold: true })],
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "{Sanction Load}" })],
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "Application No", bold: true })],
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "{Application No}" })],
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "Mobile", bold: true })],
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "{Mobile}" })],
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "Email", bold: true })],
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "{Email}" })],
                            }),
                        ],
                    }),
                ],
            }),
        ],
    }],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("wcr_template_clean.docx", buffer);
    console.log("Clean template created: wcr_template_clean.docx");
    console.log("This template uses single braces {} instead of double {{}} to avoid Word splitting issues");
});
