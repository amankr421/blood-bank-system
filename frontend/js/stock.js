// Blood Stock Management
document.addEventListener('DOMContentLoaded', function() {
    loadBloodStock();
    setupEventListeners();
});

function setupEventListeners() {
    const refreshBtn = document.getElementById('refresh-stock');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadBloodStock);
    }
}

async function loadBloodStock() {
    try {
        const response = await fetch(`${API_BASE}/blood-stock`);
        const data = await response.json();
        
        if (data.stock) {
            updateStockUI(data.stock);
            updateStatistics(data.stock);
            updateLastUpdated();
        }
    } catch (error) {
        console.error('Error loading blood stock:', error);
        showNotification('Failed to load blood stock', 'error');
    }
}

function updateStockUI(stock) {
    const stockGrid = document.getElementById('stock-grid');
    if (!stockGrid) return;
    
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    
    stockGrid.innerHTML = bloodGroups.map(bloodGroup => {
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
            <div class="stock-card">
                <div class="blood-type">${bloodGroup}</div>
                <div class="blood-count">${count} donors</div>
                <div class="blood-status ${status}">${statusText}</div>
                <div class="stock-actions">
                    <a href="search.html?blood_group=${bloodGroup}" class="btn btn-sm btn-primary">
                        Find Donors
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

function updateStatistics(stock) {
    const bloodGroups = Object.keys(stock);
    let totalDonors = 0;
    let availableDonors = 0;
    
    bloodGroups.forEach(group => {
        const count = stock[group] || 0;
        totalDonors += count;
        if (count > 0) {
            availableDonors += count;
        }
    });
    
    // Find most and least available blood groups
    let mostAvailable = { group: '-', count: 0 };
    let leastAvailable = { group: '-', count: Infinity };
    
    bloodGroups.forEach(group => {
        const count = stock[group] || 0;
        if (count > mostAvailable.count) {
            mostAvailable = { group, count };
        }
        if (count < leastAvailable.count && count > 0) {
            leastAvailable = { group, count };
        }
    });
    
    // Update DOM elements
    const totalDonorsEl = document.getElementById('total-donors');
    const availableDonorsEl = document.getElementById('available-donors');
    const mostAvailableEl = document.getElementById('most-available');
    const leastAvailableEl = document.getElementById('least-available');
    
    if (totalDonorsEl) totalDonorsEl.textContent = totalDonors;
    if (availableDonorsEl) availableDonorsEl.textContent = availableDonors;
    if (mostAvailableEl) mostAvailableEl.textContent = mostAvailable.group;
    if (leastAvailableEl) leastAvailableEl.textContent = leastAvailable.group;
}

function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    
    const lastUpdatedEl = document.getElementById('last-updated-time');
    if (lastUpdatedEl) {
        lastUpdatedEl.textContent = `${dateString} ${timeString}`;
    }
}

// Auto-refresh stock every 5 minutes
setInterval(loadBloodStock, 5 * 60 * 1000);