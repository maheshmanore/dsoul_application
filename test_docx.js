try {
    const { Document, Packer, Paragraph } = require('docx');
    console.log("docx import successful");
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "Hello World",
                }),
            ],
        }],
    });
    console.log("Document creation successful");
} catch (error) {
    console.error("Error with docx:", error);
}
