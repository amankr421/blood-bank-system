// Global variables
let currentUser = null;
const API_BASE = 'http://localhost:5000/api';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadBloodStock();
    
    // Add event listeners for forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
});

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        updateAuthUI();
    }
}

// Update UI based on authentication
function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    if (currentUser) {
        authButtons.innerHTML = `
            <span>Welcome, ${currentUser.full_name}</span>
            ${currentUser.user_type === 'admin' ? '<a href="admin.html" class="btn btn-admin">Admin Panel</a>' : ''}
            <button onclick="logout()" class="btn btn-secondary">Logout</button>
        `;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    window.location.href = 'index.html';
}

// Load blood stock
async function loadBloodStock() {
    try {
        const response = await fetch(`${API_BASE}/blood-stock`);
        const data = await response.json();
        
        if (data.stock) {
            updateBloodStockUI(data.stock);
        }
    } catch (error) {
        console.error('Error loading blood stock:', error);
    }
}

// Update blood stock UI
function updateBloodStockUI(stock) {
    const bloodGrid = document.querySelector('.blood-grid');
    if (!bloodGrid) return;
    
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    
    bloodGrid.innerHTML = bloodGroups.map(bloodGroup => {
        const count = stock[bloodGroup] || 0;
        let status = 'status-critical';
        let statusText = 'Critical';
        
        if (count > 5) {
            status = 'status-available';
            statusText = 'Available';
        } else if (count > 2) {
            status = 'status-low';
            statusText = 'Low';
        }
        
        return `
            <div class="blood-card">
                <div class="blood-type">${bloodGroup}</div>
                <div class="blood-count">${count} donors</div>
                <div class="blood-status ${status}">${statusText}</div>
            </div>
        `;
    }).join('');
}

// Generic form submission handler
function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formId = form.id;
    
    switch(formId) {
        case 'login-form':
            handleLogin(form);
            break;
        case 'register-form':
            handleRegister(form);
            break;
        case 'donor-form':
            handleDonorRegistration(form);
            break;
        case 'request-form':
            handleBloodRequest(form);
            break;
        case 'search-form':
            handleDonorSearch(form);
            break;
        default:
            // Handle contact form or other forms
            showNotification('Form submitted successfully!', 'success');
            form.reset();
    }
}

// Handle login
async function handleLogin(form) {
    const formData = new FormData(form);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            showNotification('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
    }
}

// Handle registration
async function handleRegister(form) {
    const formData = new FormData(form);
    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
        full_name: formData.get('full_name'),
        user_type: formData.get('user_type') || 'user'
    };
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Registration successful! Please login.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        showNotification('Registration failed. Please try again.', 'error');
    }
}

// Handle donor registration
async function handleDonorRegistration(form) {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please login first', 'error');
        return;
    }
    
    const formData = new FormData(form);
    const data = {
        user_id: JSON.parse(localStorage.getItem('user')).id,
        full_name: formData.get('full_name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        mobile: formData.get('mobile'),
        email: formData.get('email'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        blood_group: formData.get('blood_group')
    };
    
    try {
        const response = await fetch(`${API_BASE}/donors/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Donor registration successful!', 'success');
            form.reset();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        showNotification('Registration failed. Please try again.', 'error');
    }
}

// Handle blood request
async function handleBloodRequest(form) {
    const formData = new FormData(form);
    const data = {
        patient_name: formData.get('patient_name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        blood_group: formData.get('blood_group'),
        units_required: parseInt(formData.get('units_required')),
        hospital_name: formData.get('hospital_name'),
        hospital_address: formData.get('hospital_address'),
        city: formData.get('city'),
        state: formData.get('state'),
        contact_person: formData.get('contact_person'),
        contact_mobile: formData.get('contact_mobile'),
        contact_email: formData.get('contact_email'),
        urgency: formData.get('urgency')
    };
    
    try {
        const response = await fetch(`${API_BASE}/blood-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Blood request submitted successfully!', 'success');
            form.reset();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        showNotification('Submission failed. Please try again.', 'error');
    }
}

// Handle donor search
async function handleDonorSearch(form) {
    const formData = new FormData(form);
    const bloodGroup = formData.get('blood_group');
    const city = formData.get('city');
    
    try {
        const response = await fetch(`${API_BASE}/donors/search?blood_group=${bloodGroup}&city=${city}`);
        const result = await response.json();
        
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            if (response.ok && result.donors.length > 0) {
                resultsContainer.innerHTML = result.donors.map(donor => `
                    <div class="donor-card">
                        <h3>${donor.full_name}</h3>
                        <p><strong>Blood Group:</strong> ${donor.blood_group}</p>
                        <p><strong>Age:</strong> ${donor.age}</p>
                        <p><strong>Gender:</strong> ${donor.gender}</p>
                        <p><strong>Contact:</strong> ${donor.mobile}</p>
                        <p><strong>Email:</strong> ${donor.email}</p>
                        <p><strong>Address:</strong> ${donor.address}, ${donor.city}, ${donor.state}</p>
                    </div>
                `).join('');
            } else {
                resultsContainer.innerHTML = '<p class="no-results">No donors found. Please try a different search or submit a blood request.</p>';
            }
        }
    } catch (error) {
        showNotification('Search failed. Please try again.', 'error');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.background = '#27ae60';
    } else if (type === 'error') {
        notification.style.background = '#e74c3c';
    } else {
        notification.style.background = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Add CSS for animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .donor-card {
        background: white;
        padding: 1.5rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border-left: 4px solid #e74c3c;
    }
    
    .no-results {
        text-align: center;
        padding: 2rem;
        color: #7f8c8d;
        font-style: italic;
    }
`;
document.head.appendChild(style);