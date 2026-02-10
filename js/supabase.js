// ========================================
// Supabase Configuration
// ========================================

// IMPORTANT: Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://ouuhctoyzelocaornysq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dWhjdG95emVsb2Nhb3JueXNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTU3NDUsImV4cCI6MjA4NTk3MTc0NX0.9ObNiIEJDx1B7S9YsbR-fuKfP38RTmu0uTLT_k5FymY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// Database Operations
// ========================================

/**
 * Insert a new submission into the database
 * @param {Object} data - Submission data
 * @returns {Promise<Object>} - Inserted record or error
 */
async function insertSubmission(data) {
    const { data: result, error } = await supabase
        .from('submissions')
        .insert([data])
        .select()
        .single();

    if (error) {
        console.error('Error inserting submission:', error);
        throw error;
    }

    return result;
}

/**
 * Fetch a submission by NDN
 * @param {string} ndn - NERD Document Number
 * @returns {Promise<Object|null>} - Submission record or null
 */
async function getSubmissionByNDN(ndn) {
    const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('ndn', ndn)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No rows returned
            return null;
        }
        console.error('Error fetching submission:', error);
        throw error;
    }

    return data;
}

/**
 * Check if an NDN already exists
 * @param {string} ndn - NERD Document Number
 * @returns {Promise<boolean>}
 */
async function ndnExists(ndn) {
    const { count, error } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('ndn', ndn);

    if (error) {
        console.error('Error checking NDN:', error);
        throw error;
    }

    return count > 0;
}

/**
 * Update a submission with the certificate image
 * @param {string} ndn - NERD Document Number
 * @param {string} certificateImage - Base64 image data URL
 * @returns {Promise<Object>} - Updated record or error
 */
async function updateSubmissionCertificate(ndn, certificateImage) {
    const { data, error } = await supabase
        .from('submissions')
        .update({ certificate_image: certificateImage })
        .eq('ndn', ndn)
        .select()
        .single();

    if (error) {
        console.error('Error updating certificate image:', error);
        throw error;
    }

    console.log('Certificate image saved to database for NDN:', ndn);
    return data;
}

// Expose functions globally
window.insertSubmission = insertSubmission;
window.getSubmissionByNDN = getSubmissionByNDN;
window.ndnExists = ndnExists;
window.updateSubmissionCertificate = updateSubmissionCertificate;
