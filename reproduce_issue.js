const text = `
Sanction No:4749/GANGAPUR N.(U) S/DN./73145150 	Date:05-Feb-2026
To,
Office Name : GANGAPUR N.(U) S/DN.
Date:05-Feb-2026
SHRI MAHENDRA TULSIRAM BADGUJAR
P.N.1,GN.31/B/4,VISHVAS NA GAR,SATPUR,NASHIK SATPUR,NASIK NASHIK CIRCLE,
Pin code : 422101
Mobile : 9881949148
Email : Not Found
Consumer Number 049060156840
Application No 73145150
Sanction Load 3.3 KW
`;

const details = {};
const clean = (str) => str ? str.trim() : "Not Found";

console.log("Analyzing text...");

// 1. Sanction No
const sanctionNoMatch = text.match(/(?:Sanction\s*No\.?|Sanction\s*Number)[:\s]*([^\n\r]+)/i);
details['Sanction No'] = clean(sanctionNoMatch ? sanctionNoMatch[1] : null);

// 2. Consumer Name (Strategy: Line after "To,")
const lines = text.split(/\r?\n/);
const toIndex = lines.findIndex(line => line.trim().toLowerCase() === 'to,');
if (toIndex !== -1 && lines[toIndex + 1]) {
    details['Consumer Name'] = clean(lines[toIndex + 1]);
} else {
    details['Consumer Name'] = "Not Found";
}

// 3. Address (Strategy: Lines between Name and "Pin code")
if (toIndex !== -1) {
    let address = "";
    // address starts after name (toIndex + 2)
    // ends line before "Pin code"
    for (let i = toIndex + 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^Pin\s*code/i)) {
            break;
        }
        address += line + " ";
    }
    details['Address'] = clean(address);
} else {
    details['Address'] = "Not Found";
}


// 4. Pincode
const pinMatch = text.match(/Pin\s*code\s*[:\s]*(\d{6})/i);
details['Pincode'] = clean(pinMatch ? pinMatch[1] : null);

// 5. Mobile
const mobileMatch = text.match(/Mobile\s*[:\s]*([0-9]+)/i);
details['Mobile'] = clean(mobileMatch ? mobileMatch[1] : null);

// 6. Email
const emailMatch = text.match(/(?:Email|E-mail|Email\s*ID)[:\s]*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
details['Email'] = clean(emailMatch ? emailMatch[1] : null);

// 7. Consumer Number
// Pattern: "Number <digits>"
const consumerNoMatch = text.match(/Number\s*(\d+)/i);
details['Consumer Number'] = clean(consumerNoMatch ? consumerNoMatch[1] : null);

// 8. Application No
// Pattern: "Application No. <digits>"
const appNoMatch = text.match(/Application\s*No\.?\s*(\d+)/i);
details['Application No'] = clean(appNoMatch ? appNoMatch[1] : null);

// 9. Sanction Load
// Pattern: "Sanction Letter for <value> KW"
const loadMatch = text.match(/Sanction\s*Letter\s*for\s*([0-9.]+\s*(?:KW|KVA|HP)?)/i);
details['Sanction Load'] = clean(loadMatch ? loadMatch[1] : null);

console.log(JSON.stringify(details, null, 2));
