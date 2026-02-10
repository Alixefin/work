// ========================================
// NERD Result Page Handler (result.html)
// ========================================

// Base URL for verification - UPDATE THIS FOR PRODUCTION
const BASE_URL = window.location.origin + window.location.pathname.replace('result.html', '');

document.addEventListener('DOMContentLoaded', () => {
    loadCertificateData();
    setupPdfExport();

    // Show "Generate New" button only for admins
    const generateNewBtn = document.getElementById('generateNewBtn');
    if (generateNewBtn && typeof isAdminAuthenticated === 'function' && isAdminAuthenticated()) {
        generateNewBtn.style.display = 'inline-flex';
    }
});

/**
 * Load and display certificate data
 */
function loadCertificateData() {
    // Get submission data from sessionStorage
    const submissionJson = sessionStorage.getItem('currentSubmission');

    if (!submissionJson) {
        // No data found, redirect to form
        window.location.href = 'index.html';
        return;
    }

    const submission = JSON.parse(submissionJson);

    // Populate certificate fields
    populateCertificate(submission);

    // Generate QR code and save to storage
    generateQRCode(submission.ndn);
}

/**
 * Populate certificate with submission data
 * @param {Object} data - Submission data
 */
function populateCertificate(data) {
    // NDN - Format as "PRJ-XXXXXXXXX" (remove "NDN-" prefix from value)
    const ndnDisplay = data.ndn.replace('NDN-', '');
    document.getElementById('ndnNumber').textContent = ndnDisplay;

    // Main info
    document.getElementById('certTitle').textContent = data.title;
    document.getElementById('certStudentName').textContent = data.student_name;
    document.getElementById('certInstitution').textContent = data.institution;
    document.getElementById('certFaculty').textContent = data.faculty;
    document.getElementById('certDepartment').textContent = data.department;
    document.getElementById('certSubmissionType').textContent = data.submission_type;

    // Format date
    const date = new Date(data.submission_date);
    const formattedDate = formatDate(date);
    document.getElementById('certSubmissionDate').textContent = formattedDate;

    // Compliance
    document.getElementById('certNcvsCompliance').textContent = data.ncvs_compliance;
    document.getElementById('certAcademicReport').textContent = data.academic_report;

    // Contribution
    document.getElementById('certContribution').textContent = data.contribution_amount;

    // Verification URL
    const verifyUrl = `${BASE_URL}verify.html?ndn=${data.ndn}`;
    document.getElementById('verifyUrl').textContent = verifyUrl;
}

/**
 * Generate QR code for verification and save to sessionStorage
 * @param {string} ndn - NERD Document Number
 */
function generateQRCode(ndn) {
    const verifyUrl = `${BASE_URL}verify.html?ndn=${ndn}`;

    const qrcodeElement = document.getElementById('qrcode');
    qrcodeElement.innerHTML = ''; // Clear any existing content

    // Create QR code
    new QRCode(qrcodeElement, {
        text: verifyUrl,
        width: 100,
        height: 100,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });

    // After QR code is generated, convert canvas to data URL and save to sessionStorage
    setTimeout(() => {
        const canvas = qrcodeElement.querySelector('canvas');
        if (canvas) {
            // Save the QR code as a data URL to sessionStorage
            const qrDataUrl = canvas.toDataURL('image/png');
            sessionStorage.setItem('qrCodeImage', qrDataUrl);
            console.log('QR code saved to sessionStorage');

            // Replace canvas with img element for display AND PDF
            const img = document.createElement('img');
            img.src = qrDataUrl;
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.display = 'block';
            img.id = 'qrImage';

            // Clear and add the image
            qrcodeElement.innerHTML = '';
            qrcodeElement.appendChild(img);
        }
    }, 300);
}

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Setup PDF export functionality
 */
function setupPdfExport() {
    const savePdfBtn = document.getElementById('savePdfBtn');

    savePdfBtn.addEventListener('click', async () => {
        savePdfBtn.disabled = true;
        savePdfBtn.innerHTML = `
            <span class="spinner"></span>
            Generating PDF...
        `;

        try {
            await generatePDF();
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('An error occurred while generating the PDF. Please try again.');
        } finally {
            savePdfBtn.disabled = false;
            savePdfBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Save as PDF
            `;
        }
    });
}

/**
 * Generate and download PDF
 */
async function generatePDF() {
    const certificate = document.getElementById('certificate');
    const submissionJson = sessionStorage.getItem('currentSubmission');
    const submission = JSON.parse(submissionJson);

    // PDF filename based on student name and NDN
    const filename = `NERD_Clearance_${submission.student_name.replace(/\s+/g, '_')}_${submission.ndn}.pdf`;

    // Get QR code from sessionStorage and ensure it's displayed as image
    const qrDataUrl = sessionStorage.getItem('qrCodeImage');
    const qrcodeElement = document.getElementById('qrcode');

    if (qrDataUrl) {
        // Make sure the QR code is displayed as an image
        const existingImg = qrcodeElement.querySelector('img');
        if (existingImg) {
            existingImg.src = qrDataUrl;
        } else {
            // Create new image with stored data URL
            const img = document.createElement('img');
            img.src = qrDataUrl;
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.display = 'block';
            qrcodeElement.innerHTML = '';
            qrcodeElement.appendChild(img);
        }

        // Wait for image to load
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // PDF options
    const options = {
        margin: [15, 15, 15, 15],
        filename: filename,
        image: { type: 'png', quality: 1 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff'
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        }
    };

    // Generate PDF
    await html2pdf().set(options).from(certificate).save();
}
