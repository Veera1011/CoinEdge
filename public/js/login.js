
document.addEventListener('DOMContentLoaded', function() {
    // ===========================================
    // DOM ELEMENTS INITIALIZATION
    // ===========================================
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const signinBtn = document.getElementById('signinBtn');
    const registerBtn = document.getElementById('registerBtn');

    // ===========================================
    // FORM INITIALIZATION & RESET
    // ===========================================
    function initializeForm() {
        emailInput.value = '';
        passwordInput.value = '';
        clearValidation(emailInput);
        clearValidation(passwordInput);
        emailInput.parentNode.classList.remove('focused');
        passwordInput.parentNode.classList.remove('focused');
    }

    // Initialize form on page load
    initializeForm();

    // Reset form on browser navigation
    window.addEventListener('pageshow', initializeForm);

    // ===========================================
    // VALIDATION FUNCTIONS
    // ===========================================
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    function showError(input, message) {
        input.classList.add('error');
        input.classList.remove('success');
        
        // Remove existing error message
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
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
        
        // Remove error message
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    function validateField(input, value) {
        const trimmedValue = value.trim();
        
        if (trimmedValue === '') {
            clearValidation(input);
            return true; // Empty is valid for real-time validation
        }
        
        if (input === emailInput) {
            if (!validateEmail(trimmedValue)) {
                showError(input, 'Please enter a valid email address');
                return false;
            }
        } else if (input === passwordInput) {
            if (!validatePassword(trimmedValue)) {
                showError(input, 'Password must be at least 6 characters long');
                return false;
            }
        }
        
        showSuccess(input);
        return true;
    }

    // ===========================================
    // PASSWORD TOGGLE FUNCTIONALITY
    // ===========================================
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = passwordToggle.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    // ===========================================
    // REAL-TIME VALIDATION
    // ===========================================
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', function() {
            validateField(this, this.value);
        });

        input.addEventListener('blur', function() {
            validateField(this, this.value);
        });
    });

    // ===========================================
    // LOADER FUNCTIONS
    // ===========================================
    function showLoader() {
    showSweetLoader('Signing In...', 'Please wait while we authenticate your credentials');
}

function hideLoader() {
    hideSweetLoader();
}

    // ===========================================
    // FORM SUBMISSION
    // ===========================================
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Clear previous validation
        clearValidation(emailInput);
        clearValidation(passwordInput);
        
        // Validate form
        let isValid = true;
        
        if (email === '') {
            showError(emailInput, 'Please enter your email address');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }
        
        if (password === '') {
            showError(passwordInput, 'Please enter your password');
            isValid = false;
        } else if (!validatePassword(password)) {
            showError(passwordInput, 'Password must be at least 6 characters long');
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }

        const formData = {
            email: email,
            password: password
        };

        showLoader();
        
        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            if (result.success === true && result.data.token) {        
                hideLoader();
            
                const userData = {
                isLoggedIn: true,
                token:result.data.token,
                userId: result.data.id,
                email: result.data.email,
                userName: result.data.name,
                loginTime: new Date().toISOString() };
              
                localStorage.setItem("activeUser", JSON.stringify(userData));
                window.location.href = '/user/dashboard';
            } else {
                hideLoader();
              showPopup('error', 'Login Failed', 'Invalid credentials');
            }
            
        } catch (error) {
            console.error('Error:', error);
            hideLoader();
           showPopup('error', 'Login Error', 'An error occurred during login. Please try again.');
        }
    });

    // ===========================================
    // POPUP FUNCTIONS
    // ===========================================
    // function showPopup(type, title, message) {
    //     const overlay = document.getElementById('popupOverlay');
    //     const icon = document.getElementById('popupIcon');
    //     const titleEl = document.getElementById('popupTitle');
    //     const messageEl = document.getElementById('popupMessage');
        
    //     if (type === 'success') {
    //         icon.className = 'popup-icon success fas fa-check-circle';
    //     } else {
    //         icon.className = 'popup-icon error fas fa-times-circle';
    //     }
        
    //     titleEl.textContent = title;
    //     messageEl.textContent = message;
    //     overlay.style.display = 'flex';
    // }

    // function closePopup() {
    //     document.getElementById('popupOverlay').style.display = 'none';
    // }

    // POPUP FUNCTIONS - Using SweetAlert2
// ===========================================
function showPopup(title, message, type = 'error') {
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
            // Redirect to login page after successful action
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
    // This function is kept for compatibility but not needed
}

    // Popup close handlers
    document.addEventListener('click', function(e) {
        if (e.target.id === 'popupOverlay') {
            closePopup();
        }
    });

    document.getElementById('popupButton').addEventListener('click', closePopup);

    // ===========================================
    // NAVIGATION HANDLERS
    // ===========================================
    registerBtn.addEventListener('click', function() {
        window.location.href = '/auth/register';
    });

    // ===========================================
    // INPUT FOCUS EFFECTS
    // ===========================================
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentNode.classList.remove('focused');
            }
        });
    });

    // ===========================================
    // KEYBOARD NAVIGATION
    // ===========================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            const inputs = Array.from(document.querySelectorAll('.form-input'));
            const currentIndex = inputs.indexOf(e.target);
            
            if (currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
            } else {
                signinBtn.click();
            }
        }
    });
});
