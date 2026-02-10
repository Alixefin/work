// ========================================
// NERD Compliance Form Handler (index.html)
// ========================================

// Supabase Configuration
const SUPABASE_URL = 'https://ouuhctoyzelocaornysq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dWhjdG95emVsb2Nhb3JueXNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTU3NDUsImV4cCI6MjA4NTk3MTc0NX0.9ObNiIEJDx1B7S9YsbR-fuKfP38RTmu0uTLT_k5FymY';

// Initialize Supabase client
let supabaseClient = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
    } catch (err) {
        console.error('Failed to initialize Supabase:', err);
        alert('Failed to connect to database. Please check your internet connection.');
        return;
    }

    const form = document.getElementById('clearanceForm');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoading = generateBtn.querySelector('.btn-loading');

    form.addEventListener('submit', handleFormSubmit);

    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    async function handleFormSubmit(e) {
        e.preventDefault();

        // Show loading state
        setLoading(true);

        try {
            // Gather form data
            const formData = gatherFormData();

            // Generate unique NDN
            const ndn = generateNDN();

            // Get current timestamp
            const submissionDate = new Date().toISOString();

            // Prepare submission data
            const submissionData = {
                ndn: ndn,
                title: formData.title,
                student_name: formData.studentName,
                institution: formData.institution,
                faculty: formData.faculty,
                department: formData.department,
                submission_type: formData.submissionType,
                submission_date: submissionDate,
                ncvs_compliance: formData.ncvsCompliance,
                academic_report: formData.academicReport,
                contribution_amount: formData.contribution || 'N/A (via Partner)'
            };

            // Save to Supabase
            const { data: result, error } = await supabaseClient
                .from('submissions')
                .insert([submissionData])
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Submission saved:', result);

            // Store in sessionStorage for result page
            sessionStorage.setItem('currentSubmission', JSON.stringify(submissionData));

            // Redirect to result page
            window.location.href = 'result.html';

        } catch (error) {
            console.error('Submission error:', error);

            // Show more detailed error message
            let errorMessage = 'An error occurred while generating your certificate.';

            if (error.message) {
                errorMessage += '\n\nError details: ' + error.message;
            }

            if (error.code === '42P01') {
                errorMessage = 'Database table not found. Please create the "submissions" table in Supabase first. See README.md for the SQL script.';
            } else if (error.code === '42501') {
                errorMessage = 'Permission denied. Please check the RLS policies in Supabase.';
            }

            alert(errorMessage);
            setLoading(false);
        }
    }

    /**
     * Gather all form data
     * @returns {Object} Form data object
     */
    function gatherFormData() {
        return {
            title: document.getElementById('title').value.trim(),
            studentName: document.getElementById('studentName').value.trim(),
            institution: document.getElementById('institution').value.trim(),
            faculty: document.getElementById('faculty').value.trim(),
            department: document.getElementById('department').value.trim(),
            submissionType: document.getElementById('submissionType').value,
            ncvsCompliance: document.getElementById('ncvsCompliance').value,
            academicReport: document.getElementById('academicReport').value,
            contribution: document.getElementById('contribution').value.trim()
        };
    }

    /**
     * Generate unique NERD Document Number
     * @returns {string} NDN in format: PRJ-XXXXXXXXXXXXXXXXXX (last 3 digits random)
     */
    function generateNDN() {
        const timestamp = Date.now().toString(); // 13 digits
        const mid = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const unique = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PRJ-${timestamp}${mid}${unique}`;
    }

    /**
     * Toggle loading state
     * @param {boolean} loading - Is loading
     */
    function setLoading(loading) {
        generateBtn.disabled = loading;
        btnText.style.display = loading ? 'none' : 'inline';
        btnLoading.style.display = loading ? 'inline-flex' : 'none';
    }
});
