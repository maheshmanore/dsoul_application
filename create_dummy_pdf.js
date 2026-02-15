const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test_sanction_letter.pdf'));

doc.fontSize(20).text('Sanction Letter', { align: 'center' });
doc.moveDown();

doc.fontSize(12);
doc.text('Sanction No: SANC-2024-001');
doc.text('Application Date: 2024-10-25');
doc.moveDown();

doc.text('To,');
doc.text('Name of Consumer: John Doe');
doc.text('Consumer Address: 123, Green Park, Civil Lines, New Delhi - 110001');
doc.moveDown();

doc.text('Dear Sir/Madam,');
doc.text('Subject: Connectivity of Load');
doc.moveDown();

doc.text('With reference to your application, we are pleased to sanction the load as per details below:');
doc.moveDown();

doc.text('Application No: APP-987654321');
doc.text('Consumer No: CA-123456789');
doc.text('Sanctioned Load: 5 KW');
doc.text('Supply Voltage: 230V');
doc.moveDown();

doc.text('Contact Details:');
doc.text('Mobile No: 9876543210');
doc.text('Email ID: johndoe@example.com');
doc.moveDown();

doc.text('Regards,');
doc.text('Assistant Engineer');
doc.text('Electricity Department');

doc.end();

console.log('Dummy PDF created: test_sanction_letter.pdf');
