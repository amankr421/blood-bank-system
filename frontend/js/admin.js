// Admin Panel JavaScript
let currentAdminSection = 'dashboard';
let currentRequestId = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    initializeAdminPanel();
    loadAdminData();
});

function checkAdminAccess() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.user_type !== 'admin') {
        showNotification('Admin access required', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Update admin welcome message
    const adminWelcome = document.getElementById('admin-welcome');
    if (adminWelcome) {
        adminWelcome.textContent = `Welcome, ${user.full_name}`;
    }
}

function initializeAdminPanel() {
    // Navigation
    const navLinks = document.querySelectorAll('.admin-nav');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            switchSection(section);
        });
    });
    
    // Modal handling
    const modal = document.getElementById('request-modal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Table controls
    initializeTableControls();
}

function switchSection(section) {
    // Update navigation
    document.querySelectorAll('.admin-nav').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
    
    currentAdminSection = section;
    
    // Load section-specific data
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'donors':
            loadDonorsData();
            break;
        case 'requests':
            loadRequestsData();
            break;
        case 'stock':
            loadStockData();
            break;
    }
}

function initializeTableControls() {
    // Search functionality
    const donorSearch = document.getElementById('donor-search');
    if (donorSearch) {
        donorSearch.addEventListener('input', debounce(filterDonors, 300));
    }
    
    // Filter functionality
    const statusFilter = document.getElementById('status-filter');
    const urgencyFilter = document.getElementById('urgency-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterRequests);
    }
    if (urgencyFilter) {
        urgencyFilter.addEventListener('change', filterRequests);
    }
}

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

async function loadAdminData() {
    await loadDashboardData();
}

async function loadDashboardData() {
    try {
        const [donorsResponse, requestsResponse, stockResponse] = await Promise.all([
            fetch(`${API_BASE}/admin/donors`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }),
            fetch(`${API_BASE}/admin/blood-requests`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }),
            fetch(`${API_BASE}/blood-stock`)
        ]);
        
        const donorsData = await donorsResponse.json();
        const requestsData = await requestsResponse.json();
        const stockData = await stockResponse.json();
        
        updateDashboardStats(donorsData, requestsData, stockData);
        updateRecentRequests(requestsData);
        updateStockOverview(stockData);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

function updateDashboardStats(donorsData, requestsData, stockData) {
    // Update donor count
    const totalDonors = donorsData.donors ? donorsData.donors.length : 0;
    document.getElementById('total-donors-count').textContent = totalDonors;
    
    // Update request counts
    const requests = requestsData.requests || [];
    const pendingRequests = requests.filter(req => req.status === 'Pending').length;
    const completedRequests = requests.filter(req => req.status === 'Completed').length;
    
    document.getElementById('pending-requests-count').textContent = pendingRequests;
    document.getElementById('completed-requests-count').textContent = completedRequests;
    
    // Update total blood units
    const stock = stockData.stock || {};
    const totalUnits = Object.values(stock).reduce((sum, count) => sum + count, 0);
    document.getElementById('total-blood-units').textContent = totalUnits;
}

function updateRecentRequests(requestsData) {
    const requests = requestsData.requests || [];
    const recentRequests = requests.slice(0, 5); // Get first 5 requests
    
    const container = document.getElementById('recent-requests');
    if (!container) return;
    
    if (recentRequests.length === 0) {
        container.innerHTML = '<p class="no-data">No recent requests</p>';
        return;
    }
    
    container.innerHTML = recentRequests.map(request => `
        <div class="request-item">
            <div class="request-info">
                <h4>${request.patient_name}</h4>
                <p>${request.blood_group} • ${request.units_required} units • ${request.hospital_name}</p>
            </div>
            <div class="request-status status-${request.status.toLowerCase()}">
                ${request.status}
            </div>
        </div>
    `).join('');
}

function updateStockOverview(stockData) {
    const stock = stockData.stock || {};
    const container = document.getElementById('stock-overview');
    if (!container) return;
    
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    
    container.innerHTML = bloodGroups.map(group => {
        const count = stock[group] || 0;
        return `
            <div class="stock-item">
                <div class="stock-type">${group}</div>
                <div class="stock-count">${count}</div>
            </div>
        `;
    }).join('');
}

async function loadDonorsData() {
    try {
        const response = await fetch(`${API_BASE}/admin/donors`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        displayDonorsData(data.donors || []);
        
    } catch (error) {
        console.error('Error loading donors data:', error);
        showNotification('Failed to load donors data', 'error');
    }
}

function displayDonorsData(donors) {
    const tbody = document.getElementById('donors-tbody');
    if (!tbody) return;
    
    if (donors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No donors found</td></tr>';
        return;
    }
    
    tbody.innerHTML = donors.map(donor => `
        <tr>
            <td>${donor.full_name}</td>
            <td><strong>${donor.blood_group}</strong></td>
            <td>${donor.age}</td>
            <td>${donor.gender}</td>
            <td>${donor.city}</td>
            <td>${donor.mobile}</td>
            <td>${donor.email}</td>
            <td>
                <div class="action-buttons-small">
                    <button class="btn-view" onclick="viewDonor(${donor.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-edit" onclick="editDonor(${donor.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteDonor(${donor.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function loadRequestsData() {
    try {
        const response = await fetch(`${API_BASE}/admin/blood-requests`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        displayRequestsData(data.requests || []);
        
    } catch (error) {
        console.error('Error loading requests data:', error);
        showNotification('Failed to load requests data', 'error');
    }
}

function displayRequestsData(requests) {
    const tbody = document.getElementById('requests-tbody');
    if (!tbody) return;
    
    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-data">No requests found</td></tr>';
        return;
    }
    
    tbody.innerHTML = requests.map(request => {
        const date = new Date(request.created_at).toLocaleDateString();
        return `
            <tr>
                <td>${request.patient_name}</td>
                <td><strong>${request.blood_group}</strong></td>
                <td>${request.units_required}</td>
                <td>${request.hospital_name}</td>
                <td>${request.city}</td>
                <td>
                    <span class="urgency-${request.urgency.toLowerCase()}">
                        ${request.urgency}
                    </span>
                </td>
                <td>
                    <span class="request-status status-${request.status.toLowerCase()}">
                        ${request.status}
                    </span>
                </td>
                <td>${date}</td>
                <td>
                    <div class="action-buttons-small">
                        <button class="btn-view" onclick="viewRequest(${request.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-edit" onclick="updateRequestStatus(${request.id}, 'Approved')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-delete" onclick="updateRequestStatus(${request.id}, 'Rejected')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function viewRequest(requestId) {
    try {
        const response = await fetch(`${API_BASE}/admin/blood-requests`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        const request = data.requests.find(req => req.id === requestId);
        
        if (request) {
            showRequestModal(request);
        }
        
    } catch (error) {
        console.error('Error loading request details:', error);
        showNotification('Failed to load request details', 'error');
    }
}

function showRequestModal(request) {
    currentRequestId = request.id;
    
    const modal = document.getElementById('request-modal');
    const detailsContainer = document.getElementById('request-details');
    
    detailsContainer.innerHTML = `
        <div class="request-details-grid">
            <div class="detail-group">
                <div class="detail-label">Patient Information</div>
                <div class="detail-value">${request.patient_name} (${request.age} years, ${request.gender})</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Blood Requirement</div>
                <div class="detail-value">${request.blood_group} - ${request.units_required} units</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Hospital Details</div>
                <div class="detail-value">${request.hospital_name}<br>${request.hospital_address}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Location</div>
                <div class="detail-value">${request.city}, ${request.state}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Contact Person</div>
                <div class="detail-value">${request.contact_person}<br>${request.contact_mobile}<br>${request.contact_email || 'N/A'}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Urgency & Status</div>
                <div class="detail-value">
                    <span class="urgency-${request.urgency.toLowerCase()}">${request.urgency}</span><br>
                    <span class="request-status status-${request.status.toLowerCase()}">${request.status}</span>
                </div>
            </div>
        </div>
    `;
    
    // Update action buttons based on current status
    const approveBtn = document.getElementById('approve-btn');
    const rejectBtn = document.getElementById('reject-btn');
    
    if (request.status === 'Pending') {
        approveBtn.style.display = 'inline-block';
        rejectBtn.style.display = 'inline-block';
    } else {
        approveBtn.style.display = 'none';
        rejectBtn.style.display = 'none';
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('request-modal');
    modal.style.display = 'none';
    currentRequestId = null;
}

async function updateRequestStatus(requestId, status) {
    try {
        const response = await fetch(`${API_BASE}/admin/blood-requests/${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showNotification(`Request ${status.toLowerCase()} successfully`, 'success');
            closeModal();
            loadRequestsData();
            loadDashboardData(); // Refresh dashboard stats
        } else {
            throw new Error('Failed to update request status');
        }
        
    } catch (error) {
        console.error('Error updating request status:', error);
        showNotification('Failed to update request status', 'error');
    }
}

// Admin utility functions
function refreshDonors() {
    loadDonorsData();
    showNotification('Donors list refreshed', 'success');
}

function filterDonors() {
    const searchTerm = document.getElementById('donor-search').value.toLowerCase();
    const rows = document.querySelectorAll('#donors-tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function filterRequests() {
    const statusFilter = document.getElementById('status-filter').value;
    const urgencyFilter = document.getElementById('urgency-filter').value;
    const rows = document.querySelectorAll('#requests-tbody tr');
    
    rows.forEach(row => {
        const status = row.querySelector('.request-status').textContent;
        const urgency = row.querySelector('[class^="urgency-"]').textContent;
        
        const statusMatch = !statusFilter || status === statusFilter;
        const urgencyMatch = !urgencyFilter || urgency === urgencyFilter;
        
        row.style.display = statusMatch && urgencyMatch ? '' : 'none';
    });
}

// Placeholder functions for future implementation
function exportDonors() {
    showNotification('Export feature coming soon', 'info');
}

function sendBulkNotifications() {
    showNotification('Notification feature coming soon', 'info');
}

function generateReport() {
    showNotification('Report generation feature coming soon', 'info');
}

function viewDonor(donorId) {
    showNotification('View donor details feature coming soon', 'info');
}

function editDonor(donorId) {
    showNotification('Edit donor feature coming soon', 'info');
}

function deleteDonor(donorId) {
    if (confirm('Are you sure you want to delete this donor?')) {
        showNotification('Delete donor feature coming soon', 'info');
    }
}

async function loadStockData() {
    try {
        const response = await fetch(`${API_BASE}/blood-stock`);
        const data = await response.json();
        displayStockData(data.stock || {});
        
    } catch (error) {
        console.error('Error loading stock data:', error);
        showNotification('Failed to load stock data', 'error');
    }
}

function displayStockData(stock) {
    const container = document.querySelector('.stock-cards');
    if (!container) return;
    
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    
    container.innerHTML = bloodGroups.map(group => {
        const count = stock[group] || 0;
        let statusClass = 'critical';
        if (count > 5) statusClass = 'available';
        else if (count > 2) statusClass = 'low';
        
        return `
            <div class="stock-card-admin ${statusClass}">
                <div class="blood-type">${group}</div>
                <div class="blood-count">${count}</div>
                <div class="blood-status">${count} donors</div>
            </div>
        `;
    }).join('');
}

function updateStock() {
    showNotification('Stock update feature coming soon', 'info');
}