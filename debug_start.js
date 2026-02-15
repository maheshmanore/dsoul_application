console.log("Starting debug script...");

try {
    console.log("Requiring fs...");
    const fs = require('fs');
    console.log("Requiring path...");
    const path = require('path');

    console.log("Requiring extraction_logic...");
    const { extractDetails } = require('./extraction_logic');
    console.log("extraction_logic loaded.");

    console.log("Requiring express...");
    const express = require('express');
    console.log("express loaded.");

    const app = express();
    const port = 3000;

    app.get('/', (req, res) => res.send('Hello World'));

    console.log("Attempting to listen on port " + port + "...");
    const server = app.listen(port, () => {
        console.log(`Debug Server running at http://localhost:${port}`);
    });

    server.on('error', (e) => {
        console.error("Server Error:", e);
    });

} catch (error) {
    console.error("Top level error:", error);
}
