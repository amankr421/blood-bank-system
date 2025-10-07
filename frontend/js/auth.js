// Authentication specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthPage();
});

function initializeAuthPage() {
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
    
    // Confirm password validation
    const confirmPasswordInput = document.getElementById('confirm_password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
    
    /*// Account type selection
    const accountOptions = document.querySelectorAll('.registration-option');
    accountOptions.forEach(option => {
        option.addEventListener('click', function() {
            accountOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('user_type').value = this.dataset.type;
        });
    });*/
}

function checkPasswordStrength() {
    const password = this.value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let feedback = '';
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Lowercase check
    if (/[a-z]/.test(password)) strength += 25;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Number/Special char check
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    
    // Update UI
    strengthBar.style.width = strength + '%';
    
    if (strength < 50) {
        strengthBar.style.background = '#e74c3c';
        feedback = 'Weak';
    } else if (strength < 75) {
        strengthBar.style.background = '#f39c12';
        feedback = 'Medium';
    } else {
        strengthBar.style.background = '#27ae60';
        feedback = 'Strong';
    }
    
    strengthText.textContent = feedback;
}

function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    const confirmInput = this;
    
    if (confirmPassword && password !== confirmPassword) {
        confirmInput.style.borderColor = '#e74c3c';
        confirmInput.setCustomValidity('Passwords do not match');
    } else {
        confirmInput.style.borderColor = '#27ae60';
        confirmInput.setCustomValidity('');
    }
}

// Enhanced form validation for registration
function validateRegistrationForm(form) {
    const password = form.password.value;
    const confirmPassword = form.confirm_password.value;
    const terms = form.terms.checked;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return false;
    }
    
    if (!terms) {
        showNotification('Please accept the Terms of Service', 'error');
        return false;
    }
    
    return true;
}

// Update the registration handler in index.js
function handleRegister(form) {
    if (!validateRegistrationForm(form)) {
        return;
    }
    
    const formData = new FormData(form);
    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
        full_name: formData.get('full_name'),
        user_type: formData.get('user_type') || 'user'
    };
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;
    
    fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.token) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            showNotification('Account created successfully!', 'success');
            
            // Redirect based on user type
            setTimeout(() => {
                if (result.user.user_type === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1500);
        } else {
            showNotification(result.message, 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}