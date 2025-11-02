// Reset Password Page JavaScript
// Handles password reset form with real-time validation and form submission

document.addEventListener('DOMContentLoaded', function() {
    // ===========================================
    // DOM ELEMENTS
    // ===========================================
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');

    // ===========================================
    // FORM INITIALIZATION
    // ===========================================
    // Clear fields on page load to prevent autocomplete
    passwordField.value = '';
    confirmPasswordField.value = '';

    // Reset form on browser back/forward navigation and page refresh
    window.addEventListener('pageshow', function(event) {
        // Clear all fields when user uses browser back/forward buttons or refreshes
        passwordField.value = '';
        confirmPasswordField.value = '';
        
        // Clear any validation states
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error', 'success');
        });
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.remove();
        });
        
        // Remove focus effects
        document.querySelectorAll('.input-container').forEach(container => {
            container.classList.remove('focused');
        });
    });

    // ===========================================
    // PASSWORD TOGGLE FUNCTIONALITY
    // ===========================================
    passwordToggle.addEventListener('click', function() {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    confirmPasswordToggle.addEventListener('click', function() {
        const type = confirmPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordField.setAttribute('type', type);
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    // ===========================================
    // VALIDATION FUNCTIONS
    // ===========================================
    function validateForm() {
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;

        let isValid = true;

        // Clear previous error states
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.remove();
        });

        // Password validation
        if (password.length < 6) {
            showError('password', 'Password must be at least 6 characters long');
            isValid = false;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        return isValid;
    }

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    // ===========================================
    // REAL-TIME VALIDATION
    // ===========================================
    // Password field validation
    passwordField.addEventListener('input', function() {
        const value = this.value;
        
        // Clear previous error
        clearFieldError(this);
        
        // Validate password length
        if (value.length > 0 && value.length < 6) {
            showFieldError(this, 'Password must be at least 6 characters long');
        }
    });

    // Real-time password confirmation validation
    confirmPasswordField.addEventListener('input', function() {
        const password = passwordField.value;
        const confirmPassword = this.value;

        // Clear previous error
        clearFieldError(this);

        if (confirmPassword && password !== confirmPassword) {
            showFieldError(this, 'Passwords do not match');
        }
    });

    // ===========================================
    // HELPER FUNCTIONS
    // ===========================================
    function clearFieldError(field) {
        field.classList.remove('error');
        const errorMsg = field.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    function showFieldError(field, message) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    // ===========================================
    // LOADER FUNCTIONS
    // ===========================================
  // Replace these functions in reset-password.js
function showLoader() {
    showSweetLoader('Resetting Password...', 'Please wait while we update your password');
}

function hideLoader() {
    hideSweetLoader();
}

    // ===========================================
    // POPUP FUNCTIONS
    // ===========================================
    // function showPopup(type, title, message) {
    //     const overlay = document.getElementById('popupOverlay');
    //     const icon = document.getElementById('popupIcon');
    //     const titleEl = document.getElementById('popupTitle');
    //     const messageEl = document.getElementById('popupMessage');
        
    //     // Set Font Awesome icon and colors based on type
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
    document.getElementById('popupButton').addEventListener('click', closePopup);

    // ===========================================
    // FORM SUBMISSION
    // ===========================================
    resetPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        showLoader();
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        const formData = {
            password: passwordField.value,
            confirmPassword: confirmPasswordField.value,
            token: token
        };

        try {
            const response = await fetch('/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData
                })
            });
            
            const result = await response.json();
            
            if (result.success === true) {
                hideLoader();
                showPopup('success', 'Password Reset Successful!', 'Your password has been reset successfully! Click OK to continue.');
             
            } else if (result.success === false) {
                hideLoader();
                showPopup('error', 'Password Reset Failed', result.message || 'Please check your information and try again.');
            }
            
        } catch (error) {
            console.error('Error:', error);
            hideLoader();
            showPopup('error', 'Password Reset Error', 'An error occurred during password reset. Please try again.');
        }
    });
});