// Base URL for verification
const BASE_URL = window.location.origin + window.location.pathname.replace('verify.html', '');

document.addEventListener('DOMContentLoaded', () => {
    verifyCertificate();
});

/**
 * Verify certificate from URL parameter
 */
async function verifyCertificate() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const successState = document.getElementById('successState');

    // Get NDN from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const ndn = urlParams.get('ndn');

    if (!ndn) {
        showError();
        return;
    }

    try {
        // Fetch submission from database
        const submission = await getSubmissionByNDN(ndn);

        if (!submission) {
            showError();
            return;
        }

        // Show certificate
        showCertificate(submission);

    } catch (error) {
        console.error('Verification error:', error);
        showError();
    }

    function showError() {
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
        successState.style.display = 'none';
    }

    function showCertificate(data) {
        loadingState.style.display = 'none';
        errorState.style.display = 'none';
        successState.style.display = 'block';

        // If we have a stored certificate image, display it directly
        if (data.certificate_image) {
            showStoredCertificateImage(data.certificate_image);
        } else {
            // Fall back to populating certificate from data fields
            populateCertificate(data);
            generateQRCode(data.ndn);
        }
    }
}

/**
 * Display the stored certificate image from the database
 * @param {string} imageDataUrl - Base64 image data URL
 */
function showStoredCertificateImage(imageDataUrl) {
    const certificate = document.getElementById('certificate');

    // Replace all certificate content with the stored image
    certificate.innerHTML = '';
    certificate.style.padding = '0';
    certificate.style.border = 'none';
    certificate.style.borderTop = 'none';

    const img = document.createElement('img');
    img.src = imageDataUrl;
    img.alt = 'NERD Compliance Clearance Certificate';
    img.style.width = '100%';
    img.style.maxWidth = '800px';
    img.style.display = 'block';
    img.style.borderRadius = '4px';
    img.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';

    certificate.appendChild(img);
}

/**
 * Populate certificate with submission data (fallback)
 * @param {Object} data - Submission data
 */
function populateCertificate(data) {
    // NDN
    document.getElementById('ndnNumber').textContent = data.ndn;

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
 * Generate QR code for verification (fallback)
 * @param {string} ndn - NERD Document Number
 */
function generateQRCode(ndn) {
    const verifyUrl = `${BASE_URL}verify.html?ndn=${ndn}`;

    const qrcodeElement = document.getElementById('qrcode');
    qrcodeElement.innerHTML = ''; // Clear any existing content

    new QRCode(qrcodeElement, {
        text: verifyUrl,
        width: 100,
        height: 100,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });
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
