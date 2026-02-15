const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileElem');
const uploadBtn = document.getElementById('uploadBtn');
const statusArea = document.getElementById('status-area');
const loader = document.getElementById('loader');
const successMsg = document.getElementById('success-msg');
const errorMsg = document.getElementById('error-msg');
const errorText = document.getElementById('error-text');
const downloadLink = document.getElementById('download-link');
const editFormContainer = document.getElementById('edit-form-container');
const editForm = document.getElementById('edit-form');
const cancelBtn = document.getElementById('cancelBtn');

// Store extracted data
let extractedData = null;

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.classList.add('drag-over');
}

function unhighlight(e) {
    dropArea.classList.remove('drag-over');
}

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle selected files via button
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

// Step 1: Upload file and extract data
async function uploadFile(file) {
    if (file.type !== 'application/pdf') {
        showError("Please upload a PDF file.");
        return;
    }

    // Reset UI
    statusArea.classList.remove('hidden');
    loader.classList.remove('hidden');
    successMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');
    editFormContainer.classList.add('hidden');

    const formData = new FormData();
    formData.append('sanctionLetter', file);

    try {
        const response = await fetch('/extract', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            extractedData = await response.json();
            console.log("Extracted data:", extractedData);

            // Hide loader and upload area
            loader.classList.add('hidden');
            statusArea.classList.add('hidden');
            dropArea.classList.add('hidden');

            // Show edit form with extracted data
            populateForm(extractedData);
            editFormContainer.classList.remove('hidden');
        } else {
            const text = await response.text();
            throw new Error(text || "Extraction failed");
        }
    } catch (error) {
        console.error("Error:", error);
        showError("Failed to extract data. Please try again.");
    }
}

// Populate form with extracted data
function populateForm(data) {
    document.getElementById('sanctionNo').value = data['Sanction No'] || '';
    document.getElementById('applicationNo').value = data['Application No'] || '';
    document.getElementById('consumerName').value = data['Consumer Name'] || '';
    document.getElementById('address').value = data['Address'] || '';
    document.getElementById('pincode').value = data['Pincode'] || '';
    document.getElementById('mobile').value = data['Mobile'] || '';
    document.getElementById('email').value = data['Email'] || '';
    document.getElementById('consumerNumber').value = data['Consumer Number'] || '';
    document.getElementById('sanctionLoad').value = data['Sanction Load'] || '';
}

// Step 2: Generate DOCX with edited data
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = {
        'Sanction No': document.getElementById('sanctionNo').value,
        'Application No': document.getElementById('applicationNo').value,
        'Consumer Name': document.getElementById('consumerName').value,
        'Address': document.getElementById('address').value,
        'Pincode': document.getElementById('pincode').value,
        'Mobile': document.getElementById('mobile').value,
        'Email': document.getElementById('email').value,
        'Consumer Number': document.getElementById('consumerNumber').value,
        'Sanction Load': document.getElementById('sanctionLoad').value
    };

    // Show loader
    editFormContainer.classList.add('hidden');
    statusArea.classList.remove('hidden');
    loader.classList.remove('hidden');
    loader.querySelector('p').textContent = 'Generating document...';

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Setup download link
            downloadLink.href = url;
            downloadLink.download = "SanctionDetails.docx";

            // Show success
            loader.classList.add('hidden');
            successMsg.classList.remove('hidden');
        } else {
            const text = await response.text();
            throw new Error(text || "Generation failed");
        }
    } catch (error) {
        console.error("Error:", error);
        showError("Failed to generate document. Please try again.");
        editFormContainer.classList.remove('hidden');
    }
});

// Cancel button - reset to upload state
cancelBtn.addEventListener('click', () => {
    editFormContainer.classList.add('hidden');
    statusArea.classList.add('hidden');
    dropArea.classList.remove('hidden');
    fileInput.value = '';
    loader.querySelector('p').textContent = 'Extracting data...';
});

function showError(msg) {
    loader.classList.add('hidden');
    errorMsg.classList.remove('hidden');
    errorText.textContent = msg;
    statusArea.classList.remove('hidden');
}
