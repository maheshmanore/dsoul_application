// Test script to debug the extraction issue
const fs = require('fs');
const { extractDetails } = require('./extraction_logic');

async function test() {
    try {
        // Create a simple test PDF buffer or use an existing one
        console.log("Testing extraction logic...");
        
        // For now, let's just test if the module loads
        console.log("extractDetails function loaded:", typeof extractDetails);
        
    } catch (error) {
        console.error("Error in test:", error);
        console.error("Stack:", error.stack);
    }
}

test();
