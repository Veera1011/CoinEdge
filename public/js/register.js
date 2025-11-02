// Register Page JavaScript
// Handles user registration form with real-time validation and form submission

document.addEventListener('DOMContentLoaded', function() {
    // ===========================================
    // DOM ELEMENTS
    // ===========================================
    const registerForm = document.getElementById('registerForm');
    const signinBtn = document.getElementById('signinBtn');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');

    // ===========================================
    // FORM INITIALIZATION
    // ===========================================
    // Clear fields on page load to prevent autocomplete
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    passwordField.value = '';
    confirmPasswordField.value = '';

    // Reset form on browser back/forward navigation and page refresh
    window.addEventListener('pageshow', function(event) {
        // Clear all fields when user uses browser back/forward buttons or refreshes
        document.getElementById('username').value = '';
        document.getElementById('email').value = '';
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
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        let isValid = true;

        // Clear previous error states
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.remove();
        });

        // Username validation
        if (username.length < 3) {
            showError('username', 'Username must be at least 3 characters long');
            isValid = false;
        }

        // Email validation
        if (!isValidEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }

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
    const fields = [
        {
            id: 'username',
            minLength: 3,
            message: 'Username must be at least 3 characters long'
        },
        {
            id: 'email',
            type: 'email',
            message: 'Please enter a valid email address'
        },
        {
            id: 'password',
            minLength: 6,
            message: 'Password must be at least 6 characters long'
        }
    ];

    // Add real-time validation to each field
    fields.forEach(field => {
        const element = document.getElementById(field.id);
        
        element.addEventListener('input', function() {
            const value = this.value.trim();
            
            // Clear previous error
            clearFieldError(this);
            
            // Validate based on field type
            if (value.length > 0) {
                if (field.minLength && value.length < field.minLength) {
                    showFieldError(this, field.message);
                } else if (field.type === 'email' && !isValidEmail(value)) {
                    showFieldError(this, field.message);
                }
            }
        });
    });

    // Real-time password confirmation validation
    confirmPasswordField.addEventListener('input', function() {
        const password = passwordField.value;
        const confirmPassword = this.value;

        if (confirmPassword && password !== confirmPassword) {
            this.classList.add('error');
            if (!this.parentNode.querySelector('.error-message')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'Passwords do not match';
                this.parentNode.appendChild(errorDiv);
            }
        } else {
            this.classList.remove('error');
            const errorMsg = this.parentNode.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
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

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ===========================================
    // LOADER FUNCTIONS
    // ===========================================
    function showLoader() {
    showSweetLoader('Creating Account...', 'Please wait while we create your account');
}

function hideLoader() {
    hideSweetLoader();
}

    // ===========================================
    // POPUP FUNCTIONS
    // ===========================================

    // Normal Popup
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
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        showLoader();
        const formData = {
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        try {
            const response = await fetch('/auth/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success === true) {
                hideLoader();
                showPopup('success', 'Registration Successful!', 'Account created successfully! Click OK to continue.');
            } else if (result.success === false) {
                hideLoader();
                showPopup('error', 'Registration Failed', result.message || 'Please check your information and try again.');
            }
            
        } catch (error) {
            console.error('Error:', error);
            hideLoader();
            showPopup('error', 'Registration Error', 'An error occurred during registration. Please try again.');
        }
    });

    // ===========================================
    // NAVIGATION
    // ===========================================
    // Navigation to sign in page
    signinBtn.addEventListener('click', function() {
        window.location.href = '/auth/login';
    });
});
