// ========================================
// Admin Authentication Gate
// ========================================

const ADMIN_PASSWORD = 'NERD-ADMIN-2026';
const ADMIN_SESSION_KEY = 'nerd_admin_session';

/**
 * Check if the current session is authenticated as admin
 * @returns {boolean}
 */
function isAdminAuthenticated() {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

/**
 * Set admin session
 */
function setAdminSession() {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
}

/**
 * Initialize admin gate on the page
 * Shows password overlay if not authenticated
 */
function initAdminGate() {
    const overlay = document.getElementById('adminOverlay');
    const formContainer = document.querySelector('.form-container');
    const passwordInput = document.getElementById('adminPassword');
    const loginBtn = document.getElementById('adminLoginBtn');
    const errorMsg = document.getElementById('adminError');

    if (!overlay) return;

    // Already authenticated — show form, hide overlay
    if (isAdminAuthenticated()) {
        overlay.style.display = 'none';
        if (formContainer) formContainer.style.display = 'block';
        return;
    }

    // Not authenticated — show overlay, hide form
    overlay.style.display = 'flex';
    if (formContainer) formContainer.style.display = 'none';

    // Handle login
    loginBtn.addEventListener('click', () => attemptLogin());
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });

    function attemptLogin() {
        const password = passwordInput.value.trim();

        if (password === ADMIN_PASSWORD) {
            setAdminSession();
            overlay.style.display = 'none';
            if (formContainer) formContainer.style.display = 'block';
            errorMsg.style.display = 'none';
        } else {
            errorMsg.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
            // Shake animation
            overlay.querySelector('.admin-modal').classList.add('shake');
            setTimeout(() => {
                overlay.querySelector('.admin-modal').classList.remove('shake');
            }, 500);
        }
    }
}

// Expose globally
window.isAdminAuthenticated = isAdminAuthenticated;

document.addEventListener('DOMContentLoaded', initAdminGate);
