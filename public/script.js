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
const dynamicFieldsContainer = document.getElementById('dynamic-fields');

// Store extracted data
let extractedData = null;

// Icon mapping for different field types
const fieldIcons = {
    'Sanction No': 'fa-file-contract',
    'Application No': 'fa-hashtag',
    'Consumer Name': 'fa-user',
    'Address': 'fa-location-dot',
    'Pincode': 'fa-map-pin',
    'Mobile': 'fa-phone',
    'Email': 'fa-envelope',
    'Consumer Number': 'fa-id-card',
    'Sanction Load': 'fa-bolt',
    'Date': 'fa-calendar',
    'default': 'fa-pen'
};

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

            // Show edit form with dynamically generated fields
            generateFormFields(extractedData);
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

// Generate form fields dynamically based on extracted data
function generateFormFields(data) {
    dynamicFieldsContainer.innerHTML = ''; // Clear existing fields

    const fieldNames = Object.keys(data);

    fieldNames.forEach(fieldName => {
        const fieldId = fieldName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const icon = fieldIcons[fieldName] || fieldIcons['default'];

        // Determine if field should be full-width (Address or long text fields)
        const isFullWidth = fieldName.toLowerCase().includes('address');
        const isTextarea = fieldName.toLowerCase().includes('address');

        // Create form group
        const formGroup = document.createElement('div');
        formGroup.className = isFullWidth ? 'form-group full-width' : 'form-group';

        // Create label
        const label = document.createElement('label');
        label.setAttribute('for', fieldId);
        label.innerHTML = `<i class="fa-solid ${icon}"></i> ${fieldName}`;

        // Create input or textarea
        let input;
        if (isTextarea) {
            input = document.createElement('textarea');
            input.rows = 2;
        } else {
            input = document.createElement('input');
            input.type = fieldName.toLowerCase().includes('email') ? 'email' : 'text';
        }

        input.id = fieldId;
        input.name = fieldName;
        input.value = data[fieldName] || '';
        input.placeholder = `Enter ${fieldName.toLowerCase()}`;

        // Append to form group
        formGroup.appendChild(label);
        formGroup.appendChild(input);

        // Append to container
        dynamicFieldsContainer.appendChild(formGroup);
    });
}

// Collect form data from dynamically generated fields
function collectFormData() {
    const formData = {};
    const inputs = dynamicFieldsContainer.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        formData[input.name] = input.value;
    });

    return formData;
}

// Step 2: Generate multiple DOCX files with edited data
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = collectFormData();
    console.log("Submitting data:", formData);

    // Show loader
    editFormContainer.classList.add('hidden');
    statusArea.classList.remove('hidden');
    loader.classList.remove('hidden');
    loader.querySelector('p').textContent = 'Generating documents...';

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

            // Setup download link for ZIP file
            downloadLink.href = url;
            downloadLink.download = "GeneratedDocuments.zip";

            // Show success
            loader.classList.add('hidden');
            successMsg.classList.remove('hidden');
            successMsg.querySelector('p').textContent = 'Documents Generated Successfully!';
            downloadLink.textContent = 'Download ZIP File';
        } else {
            const text = await response.text();
            throw new Error(text || "Generation failed");
        }
    } catch (error) {
        console.error("Error:", error);
        showError("Failed to generate documents. Please try again.");
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
    dynamicFieldsContainer.innerHTML = '';
});

function showError(msg) {
    loader.classList.add('hidden');
    errorMsg.classList.remove('hidden');
    errorText.textContent = msg;
    statusArea.classList.remove('hidden');
}
