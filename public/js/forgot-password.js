// Forgot Password Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');
    const sendResetBtn = document.getElementById('sendResetBtn');
    const registerBtn = document.getElementById('registerBtn');
    const homeLink = document.getElementById('homeLink');

    // Clear email field on page load
    emailInput.value = '';

    // Email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(input, message) {
        input.classList.add('error');
        input.classList.remove('success');
        
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }

    function clearValidation(input) {
        input.classList.remove('error', 'success');
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    function showSuccess(input) {
        input.classList.add('success');
        input.classList.remove('error');
        
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    // Real-time email validation
    emailInput.addEventListener('blur', function() {
        const email = emailInput.value.trim();
        if (email === '') {
            clearValidation(emailInput);
        } else if (!validateEmail(email)) {
            showError(emailInput, 'Please enter a valid email address');
        } else {
            showSuccess(emailInput);
        }
    });

    // Loader functions
    function showLoader() {
    showSweetLoader('Sending Reset Link...');
}

function hideLoader() {
    hideSweetLoader();
}


    //Normal PopUp

    // function showPopup(type, title, message) {
    //     const overlay = document.getElementById('popupOverlay');
    //     const icon = document.getElementById('popupIcon');
    //     const titleEl = document.getElementById('popupTitle');
    //     const messageEl = document.getElementById('popupMessage');
         
        
    //     if (type === 'success') {
    //         icon.className = 'popup-icon success fas fa-check-circle';
    //         titleEl.textContent = title;
    //         messageEl.textContent = message;
    //     } else {
    //         icon.className = 'popup-icon error fas fa-times-circle';
    //         titleEl.textContent = title;
    //         messageEl.textContent = message;
    //     }
        
    //     overlay.style.display = 'flex';
    // }

    // function closePopup() {
    //     document.getElementById('popupOverlay').style.display = 'none';
    //     window.location.href = '/auth/login';
    // }

    // ===========================================
// POPUP FUNCTIONS - Using SweetAlert2
// ===========================================
function showPopup(type, title, message) {
    if (type === 'success') {
        Swal.fire({
            icon: 'success',
            title: title,
            text: message,
            confirmButtonText: 'OK',
            confirmButtonColor: '#60a5fa',
            customClass: {
                confirmButton: 'swal-confirm-btn'
            }
        }).then(() => {
            window.location.href = '/auth/login';
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            confirmButtonText: 'OK',
            confirmButtonColor: '#60a5fa',
            customClass: {
                confirmButton: 'swal-confirm-btn'
            }
        });
    }
}

function closePopup() {
    // SweetAlert2 handles closing automatically
}

    // Popup close handlers
    document.addEventListener('click', function(e) {
        if (e.target.id === 'popupOverlay') {
            closePopup();
        }
    });

    document.getElementById('popupButton').addEventListener('click', closePopup);

    // Form submission - Step 1: Send reset email
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        // Clear previous validation
        clearValidation(emailInput);
        
        // Validate email
        if (email === '') {
            showError(emailInput, 'Please enter your email address');
            return;
        } else if (!validateEmail(email)) {
            showError(emailInput, 'Please enter a valid email address');
            return;
        }

        showLoader();

        try {
            const response = await fetch('/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            

            if (result.success === true) {
                hideLoader();
                showPopup('success', 'Reset Link Sent!', 'Please check your email for password reset instructions.');
            } else {
                hideLoader();
                showPopup('error', 'Email Not Found', result.message || 'This email address is not registered with us.');
            }

        } catch (error) {
            console.error('Error:', error);
            hideLoader();
            showPopup('error', 'Error', "This email address is not registered with us.");
        }
    });

    // Register Button - Step 2: Navigate to register
    registerBtn.addEventListener('click', function() {
        window.location.href = '/auth/register';
    });

    // Input focus effects
    emailInput.addEventListener('focus', function() {
        this.parentNode.classList.add('focused');
    });
    
    emailInput.addEventListener('blur', function() {
        if (this.value === '') {
            this.parentNode.classList.remove('focused');
        }
    });
});