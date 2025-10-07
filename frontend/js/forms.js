// Forms specific JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeForms();
    setupFormValidations();
});

function initializeForms() {
    // Initialize date inputs with current date
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = new Date().toISOString().split('T')[0];
        }
    });

    // Initialize phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', formatPhoneNumber);
    });

    // Initialize character counters for textareas
    const textareas = document.querySelectorAll('textarea[maxlength]');
    textareas.forEach(textarea => {
        setupCharacterCounter(textarea);
    });

    // Initialize address auto-completion
    const addressInputs = document.querySelectorAll('input[name="city"], input[name="state"]');
    addressInputs.forEach(input => {
        input.addEventListener('input', debounce(suggestAddress, 500));
    });

    // Initialize blood group compatibility info
    const bloodGroupSelects = document.querySelectorAll('select[name="blood_group"]');
    bloodGroupSelects.forEach(select => {
        select.addEventListener('change', showBloodGroupInfo);
    });
}

function setupFormValidations() {
    // Custom validation for age fields
    const ageInputs = document.querySelectorAll('input[name="age"]');
    ageInputs.forEach(input => {
        input.addEventListener('blur', validateAge);
    });

    // Custom validation for mobile numbers
    const mobileInputs = document.querySelectorAll('input[name="mobile"], input[name="contact_mobile"]');
    mobileInputs.forEach(input => {
        input.addEventListener('blur', validateMobileNumber);
    });

    // Custom validation for email fields
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', validateEmail);
    });

    // Custom validation for required fields
    const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', validateRequiredField);
    });

    // Form submission validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', validateFormBeforeSubmit);
    });
}

// Phone number formatting
function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    
    // Format as Indian mobile number
    if (value.length >= 6) {
        value = value.replace(/(\d{5})(\d{5})/, '$1 $2');
    } else if (value.length >= 5) {
        value = value.replace(/(\d{5})/, '$1');
    }
    
    e.target.value = value;
}

// Character counter for textareas
function setupCharacterCounter(textarea) {
    const maxLength = textarea.getAttribute('maxlength');
    const counter = document.createElement('div');
    counter.className = 'character-counter';
    counter.style.cssText = `
        font-size: 0.8rem;
        color: #6c757d;
        text-align: right;
        margin-top: 0.25rem;
    `;
    
    textarea.parentNode.appendChild(counter);
    
    function updateCounter() {
        const currentLength = textarea.value.length;
        counter.textContent = `${currentLength}/${maxLength} characters`;
        
        if (currentLength > maxLength * 0.9) {
            counter.style.color = '#e74c3c';
        } else if (currentLength > maxLength * 0.75) {
            counter.style.color = '#f39c12';
        } else {
            counter.style.color = '#6c757d';
        }
    }
    
    textarea.addEventListener('input', updateCounter);
    updateCounter(); // Initialize counter
}

// Address suggestions (simplified version)
function suggestAddress(e) {
    const input = e.target;
    const fieldName = input.name;
    
    // Simple city/state suggestions for India
    const suggestions = {
        'city': {
            'del': ['Delhi', 'New Delhi'],
            'mum': ['Mumbai', 'Thane', 'Navi Mumbai'],
            'che': ['Chennai', 'Coimbatore'],
            'kol': ['Kolkata', 'Howrah'],
            'ben': ['Bengaluru', 'Bangalore'],
            'hyd': ['Hyderabad', 'Secunderabad'],
            'ahm': ['Ahmedabad', 'Gandhinagar'],
            'pun': ['Pune', 'Pimpri-Chinchwad'],
            'gay': ['Gaya', 'Gaya Town']
        },
        'state': {
            'del': 'Delhi',
            'maha': 'Maharashtra',
            'tamil': 'Tamil Nadu',
            'west': 'West Bengal',
            'karna': 'Karnataka',
            'telan': 'Telangana',
            'guja': 'Gujarat',
            'bih': 'Bihar',
            'up': 'Uttar Pradesh'
        }
    };
    
    const value = input.value.toLowerCase();
    
    // Clear previous suggestions
    clearSuggestions(input);
    
    if (value.length < 3) return;
    
    let matches = [];
    
    if (fieldName === 'city') {
        for (const [key, cities] of Object.entries(suggestions.city)) {
            if (key.includes(value)) {
                matches = matches.concat(cities);
            }
        }
        
        // Also check direct matches
        Object.values(suggestions.city).flat().forEach(city => {
            if (city.toLowerCase().includes(value) && !matches.includes(city)) {
                matches.push(city);
            }
        });
    } else if (fieldName === 'state') {
        for (const [key, state] of Object.entries(suggestions.state)) {
            if (key.includes(value) || state.toLowerCase().includes(value)) {
                matches.push(state);
            }
        }
    }
    
    // Remove duplicates and show suggestions
    matches = [...new Set(matches)];
    showSuggestions(input, matches.slice(0, 5));
}

function showSuggestions(input, suggestions) {
    if (suggestions.length === 0) return;
    
    const suggestionBox = document.createElement('div');
    suggestionBox.className = 'suggestion-box';
    suggestionBox.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        max-height: 150px;
        overflow-y: auto;
        z-index: 1000;
        width: ${input.offsetWidth}px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.textContent = suggestion;
        suggestionItem.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
        `;
        suggestionItem.addEventListener('mouseenter', function() {
            this.style.background = '#f8f9fa';
        });
        suggestionItem.addEventListener('mouseleave', function() {
            this.style.background = 'white';
        });
        suggestionItem.addEventListener('click', function() {
            input.value = suggestion;
            clearSuggestions(input);
        });
        
        suggestionBox.appendChild(suggestionItem);
    });
    
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(suggestionBox);
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function closeSuggestions(e) {
        if (!input.parentNode.contains(e.target)) {
            clearSuggestions(input);
            document.removeEventListener('click', closeSuggestions);
        }
    });
}

function clearSuggestions(input) {
    const existingBox = input.parentNode.querySelector('.suggestion-box');
    if (existingBox) {
        existingBox.remove();
    }
}

// Blood group information
function showBloodGroupInfo(e) {
    const bloodGroup = e.target.value;
    if (!bloodGroup) return;
    
    const compatibility = {
        'A+': 'Can donate to: A+, AB+ | Can receive from: A+, A-, O+, O-',
        'A-': 'Can donate to: A+, A-, AB+, AB- | Can receive from: A-, O-',
        'B+': 'Can donate to: B+, AB+ | Can receive from: B+, B-, O+, O-',
        'B-': 'Can donate to: B+, B-, AB+, AB- | Can receive from: B-, O-',
        'AB+': 'Can donate to: AB+ | Can receive from: All blood types',
        'AB-': 'Can donate to: AB+, AB- | Can receive from: AB-, A-, B-, O-',
        'O+': 'Can donate to: O+, A+, B+, AB+ | Can receive from: O+, O-',
        'O-': 'Can donate to: All blood types | Can receive from: O-'
    };
    
    // Remove existing info
    const existingInfo = e.target.parentNode.querySelector('.blood-group-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'blood-group-info';
    infoDiv.style.cssText = `
        font-size: 0.8rem;
        color: #3498db;
        margin-top: 0.25rem;
        padding: 0.5rem;
        background: #f8f9fa;
        border-radius: 4px;
        border-left: 3px solid #3498db;
    `;
    infoDiv.textContent = compatibility[bloodGroup];
    
    e.target.parentNode.appendChild(infoDiv);
}

// Validation functions
function validateAge(e) {
    const input = e.target;
    const age = parseInt(input.value);
    
    if (isNaN(age)) {
        showFieldError(input, 'Please enter a valid age');
        return false;
    }
    
    if (age < 18) {
        showFieldError(input, 'Donors must be at least 18 years old');
        return false;
    }
    
    if (age > 65) {
        showFieldError(input, 'Donors must be under 65 years old');
        return false;
    }
    
    clearFieldError(input);
    return true;
}

function validateMobileNumber(e) {
    const input = e.target;
    const mobile = input.value.replace(/\D/g, '');
    
    if (mobile.length !== 10) {
        showFieldError(input, 'Please enter a valid 10-digit mobile number');
        return false;
    }
    
    // Basic Indian mobile number validation
    const firstDigit = mobile.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
        showFieldError(input, 'Please enter a valid Indian mobile number');
        return false;
    }
    
    clearFieldError(input);
    return true;
}

function validateEmail(e) {
    const input = e.target;
    const email = input.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        showFieldError(input, 'Please enter a valid email address');
        return false;
    }
    
    clearFieldError(input);
    return true;
}

function validateRequiredField(e) {
    const input = e.target;
    
    if (!input.value.trim()) {
        showFieldError(input, 'This field is required');
        return false;
    }
    
    clearFieldError(input);
    return true;
}

// Field error handling
function showFieldError(input, message) {
    clearFieldError(input);
    
    input.style.borderColor = '#e74c3c';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = `
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 0.25rem;
    `;
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
}

function clearFieldError(input) {
    input.style.borderColor = '';
    
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Form validation before submission
function validateFormBeforeSubmit(e) {
    const form = e.target;
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    // Clear all previous errors
    inputs.forEach(input => {
        clearFieldError(input);
    });
    
    // Validate all required fields
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            showFieldError(input, 'This field is required');
            isValid = false;
        }
    });
    
    // Validate specific field types
    const ageInputs = form.querySelectorAll('input[name="age"]');
    ageInputs.forEach(input => {
        if (input.value && !validateAge({ target: input })) {
            isValid = false;
        }
    });
    
    const mobileInputs = form.querySelectorAll('input[name="mobile"], input[name="contact_mobile"]');
    mobileInputs.forEach(input => {
        if (input.value && !validateMobileNumber({ target: input })) {
            isValid = false;
        }
    });
    
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        if (input.value && !validateEmail({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        e.preventDefault();
        showNotification('Please fix the errors in the form', 'error');
        
        // Scroll to first error
        const firstError = form.querySelector('.field-error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    return isValid;
}

// Auto-fill current location
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by your browser', 'error');
        return;
    }
    
    showNotification('Getting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        async function(position) {
            try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await response.json();
                
                // Auto-fill city and state
                const cityInput = document.querySelector('input[name="city"]');
                const stateInput = document.querySelector('input[name="state"]');
                
                if (cityInput && data.city) {
                    cityInput.value = data.city;
                }
                if (stateInput && data.principalSubdivision) {
                    stateInput.value = data.principalSubdivision;
                }
                
                showNotification('Location detected successfully', 'success');
            } catch (error) {
                console.error('Error getting location:', error);
                showNotification('Could not detect your location', 'error');
            }
        },
        function(error) {
            console.error('Geolocation error:', error);
            showNotification('Could not access your location', 'error');
        }
    );
}

// Add location button to forms
function addLocationButton() {
    const locationButtons = document.querySelectorAll('.location-button');
    locationButtons.forEach(button => {
        button.addEventListener('click', getCurrentLocation);
    });
}

// Form auto-save functionality
function setupAutoSave(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    const storageKey = `form_autosave_${formId}`;
    
    // Load saved data
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
        const data = JSON.parse(savedData);
        inputs.forEach(input => {
            if (data[input.name] && !input.value) {
                input.value = data[input.name];
            }
        });
        
        // Show auto-save indicator
        showAutoSaveIndicator('Loaded auto-saved data');
    }
    
    // Save on input
    inputs.forEach(input => {
        input.addEventListener('input', debounce(saveFormData, 1000));
    });
    
    function saveFormData() {
        const formData = {};
        inputs.forEach(input => {
            if (input.name) {
                formData[input.name] = input.value;
            }
        });
        
        localStorage.setItem(storageKey, JSON.stringify(formData));
        showAutoSaveIndicator('Auto-saved');
    }
    
    // Clear auto-save on successful submission
    form.addEventListener('submit', function() {
        localStorage.removeItem(storageKey);
    });
}

function showAutoSaveIndicator(message) {
    // Remove existing indicator
    const existingIndicator = document.querySelector('.auto-save-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    const indicator = document.createElement('div');
    indicator.className = 'auto-save-indicator';
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 0.8rem;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    indicator.textContent = message;
    
    document.body.appendChild(indicator);
    
    // Show with fade in
    setTimeout(() => {
        indicator.style.opacity = '1';
    }, 10);
    
    // Hide after 2 seconds
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => {
            indicator.remove();
        }, 300);
    }, 2000);
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize forms when added to the page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeForms);
} else {
    initializeForms();
}

// Export functions for use in other files
window.formUtils = {
    validateAge,
    validateMobileNumber,
    validateEmail,
    validateRequiredField,
    getCurrentLocation,
    setupAutoSave,
    showFieldError,
    clearFieldError
};