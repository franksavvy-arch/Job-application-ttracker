// Sample data for demonstration
const sampleApplications = [
    { id: 1, company: "Tech Solutions Inc.", title: "Frontend Developer", status: "Applied", date: "2024-02-15", link: "https://example.com/job1", notes: "Applied through company website" },
    { id: 2, company: "Digital Innovations", title: "UX Designer", status: "Interview", date: "2024-02-10", link: "https://example.com/job2", notes: "First interview scheduled for next week" },
    { id: 3, company: "Software Corp", title: "Full Stack Developer", status: "Rejected", date: "2024-01-28", link: "https://example.com/job3", notes: "Received rejection email" },
    { id: 4, company: "Web Systems", title: "JavaScript Developer", status: "In Review", date: "2024-02-05", link: "https://example.com/job4", notes: "HR confirmed application is under review" },
    { id: 5, company: "Creative Tech", title: "UI Developer", status: "Offer", date: "2024-01-15", link: "https://example.com/job5", notes: "Received offer letter, considering terms" }
];

// DOM elements
const jobForm = document.getElementById('jobApplicationForm');
const applicationsTableBody = document.getElementById('applicationsTableBody');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const statusChart = document.getElementById('statusChart');

// Application state
let applications = JSON.parse(localStorage.getItem('jobApplications')) || sampleApplications;
let myChart = null;

// Initialize the application
function init() {
    renderApplications();
    updateChart();
    
    // Event listeners
    jobForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', handleSearch);
    statusFilter.addEventListener('change', handleSearch);
}

// Render applications table
function renderApplications(apps = applications) {
    applicationsTableBody.innerHTML = '';
    
    if (apps.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5" style="text-align: center; padding: 2rem;">No applications found. Add your first job application above!</td>`;
        applicationsTableBody.appendChild(emptyRow);
        return;
    }
    
    apps.forEach(app => {
        const row = document.createElement('tr');
        
        // Format date
        const appDate = new Date(app.date);
        const formattedDate = appDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        row.innerHTML = `
            <td>
                <strong>${app.company}</strong>
                ${app.link ? `<br><a href="${app.link}" target="_blank" style="font-size: 0.8rem; color: var(--primary);">View Listing</a>` : ''}
            </td>
            <td>${app.title}</td>
            <td><span class="status" data-status="${app.status}">${app.status}</span></td>
            <td>${formattedDate}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${app.id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${app.id}">Delete</button>
            </td>
        `;
        
        // Add event listeners to buttons
        row.querySelector('.edit-btn').addEventListener('click', () => editApplication(app.id));
        row.querySelector('.delete-btn').addEventListener('click', () => deleteApplication(app.id));
        
        applicationsTableBody.appendChild(row);
    });
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const newApp = {
        id: Date.now(),
        company: document.getElementById('companyName').value,
        title: document.getElementById('jobTitle').value,
        status: document.getElementById('applicationStatus').value,
        date: document.getElementById('applicationDate').value,
        link: document.getElementById('jobLink').value,
        notes: document.getElementById('notes').value
    };
    
    applications.unshift(newApp);
    saveApplications();
    renderApplications();
    updateChart();
    
    // Reset form
    jobForm.reset();
    
    // Show success message
    showNotification(`Application to ${newApp.company} added successfully!`);
}

// Edit application
function editApplication(id) {
    const app = applications.find(a => a.id === id);
    if (!app) return;
    
    // Fill form with application data
    document.getElementById('companyName').value = app.company;
    document.getElementById('jobTitle').value = app.title;
    document.getElementById('applicationStatus').value = app.status;
    document.getElementById('applicationDate').value = app.date;
    document.getElementById('jobLink').value = app.link || '';
    document.getElementById('notes').value = app.notes || '';
    
    // Scroll to form
    document.querySelector('.application-form').scrollIntoView({ behavior: 'smooth' });
    
    // Update form button
    const submitBtn = jobForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Update Application';
    
    // Add data attribute to form
    jobForm.dataset.editId = id;
    
    // Change form submission handler
    jobForm.removeEventListener('submit', handleFormSubmit);
    jobForm.addEventListener('submit', handleFormUpdate);
}

// Handle form update
function handleFormUpdate(e) {
    e.preventDefault();
    
    const id = parseInt(jobForm.dataset.editId);
    const index = applications.findIndex(a => a.id === id);
    
    if (index !== -1) {
        applications[index] = {
            id,
            company: document.getElementById('companyName').value,
            title: document.getElementById('jobTitle').value,
            status: document.getElementById('applicationStatus').value,
            date: document.getElementById('applicationDate').value,
            link: document.getElementById('jobLink').value,
            notes: document.getElementById('notes').value
        };
        
        saveApplications();
        renderApplications();
        updateChart();
        
        // Reset form
        jobForm.reset();
        delete jobForm.dataset.editId;
        
        // Restore original form submission
        jobForm.removeEventListener('submit', handleFormUpdate);
        jobForm.addEventListener('submit', handleFormSubmit);
        
        // Restore button text
        const submitBtn = jobForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Add Application';
        
        showNotification('Application updated successfully!');
    }
}

// Delete application
function deleteApplication(id) {
    if (confirm('Are you sure you want to delete this application?')) {
        applications = applications.filter(a => a.id !== id);
        saveApplications();
        renderApplications();
        updateChart();
        showNotification('Application deleted!');
    }
}

// Handle search and filtering
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    
    const filteredApps = applications.filter(app => {
        const matchesSearch = app.company.toLowerCase().includes(searchTerm) || 
                             app.title.toLowerCase().includes(searchTerm) ||
                             (app.notes && app.notes.toLowerCase().includes(searchTerm));
        
        const matchesStatus = statusValue === '' || app.status === statusValue;
        
        return matchesSearch && matchesStatus;
    });
    
    renderApplications(filteredApps);
}

// Update chart
function updateChart() {
    // Count applications by status
    const statusCounts = {
        'Applied': 0,
        'In Review': 0,
        'Interview': 0,
        'Offer': 0,
        'Rejected': 0
    };
    
    applications.forEach(app => {
        if (statusCounts.hasOwnProperty(app.status)) {
            statusCounts[app.status]++;
        }
    });
    
    // Define colors for each status
    const statusColors = {
        'Applied': '#6c757d',
        'In Review': '#4cc9f0',
        'Interview': '#ffbe0b',
        'Offer': '#4bb543',
        'Rejected': '#e63946'
    };
    
    // Prepare chart data
    const data = {
        labels: Object.keys(statusCounts),
        datasets: [{
            label: 'Number of Applications',
            data: Object.values(statusCounts),
            backgroundColor: Object.keys(statusCounts).map(status => statusColors[status]),
            borderWidth: 1
        }]
    };
    
    // Destroy existing chart if it exists
    if (myChart) {
        myChart.destroy();
    }
    
    // Create new chart
    myChart = new Chart(statusChart, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            const total = applications.length;
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Save applications to local storage
function saveApplications() {
    localStorage.setItem('jobApplications', JSON.stringify(applications));
}

// Show notification
function showNotification(message) {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        // Create notification container
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        background-color: var(--primary);
        color: white;
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transform: translateX(120%);
        transition: transform 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 280px;
        max-width: 350px;
    `;
    
    // Add message
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 1.2rem; padding: 0;">&times;</button>
    `;
    
    // Add notification to container
    notificationContainer.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Add close button functionality
    notification.querySelector('.close-btn').addEventListener('click', () => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Initialize application
document.addEventListener('DOMContentLoaded', init);