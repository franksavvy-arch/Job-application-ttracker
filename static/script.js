class JobApplicationTracker {
    constructor() {
        this.applications = JSON.parse(localStorage.getItem('jobApplications')) || [];
        this.initEventListeners();
        this.renderApplications();
        this.updateStatusChart();
    }

    initEventListeners() {
        document.getElementById('jobApplicationForm').addEventListener('submit', this.addApplication.bind(this));
        document.getElementById('searchInput').addEventListener('input', this.filterApplications.bind(this));
        document.getElementById('statusFilter').addEventListener('change', this.filterApplications.bind(this));
    }

    addApplication(event) {
        event.preventDefault();
        const application = {
            id: Date.now(),
            companyName: document.getElementById('companyName').value,
            jobTitle: document.getElementById('jobTitle').value,
            status: document.getElementById('applicationStatus').value,
            date: document.getElementById('applicationDate').value,
            jobLink: document.getElementById('jobLink').value,
            notes: document.getElementById('notes').value
        };

        this.applications.push(application);
        this.saveApplications();
        this.renderApplications();
        this.updateStatusChart();
        this.resetForm();
    }

    renderApplications() {
        const tableBody = document.getElementById('applicationsTableBody');
        tableBody.innerHTML = '';

        this.applications.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${app.companyName}</td>
                <td>${app.jobTitle}</td>
                <td>${app.status}</td>
                <td>${app.date}</td>
                <td>
                    <button onclick="jobTracker.editApplication(${app.id})">Edit</button>
                    <button onclick="jobTracker.deleteApplication(${app.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    editApplication(id) {
        const application = this.applications.find(app => app.id === id);
        if (application) {
            document.getElementById('companyName').value = application.companyName;
            document.getElementById('jobTitle').value = application.jobTitle;
            document.getElementById('applicationStatus').value = application.status;
            document.getElementById('applicationDate').value = application.date;
            document.getElementById('jobLink').value = application.jobLink;
            document.getElementById('notes').value = application.notes;

            this.deleteApplication(id);
        }
    }

    deleteApplication(id) {
        this.applications = this.applications.filter(app => app.id !== id);
        this.saveApplications();
        this.renderApplications();
        this.updateStatusChart();
    }

    saveApplications() {
        localStorage.setItem('jobApplications', JSON.stringify(this.applications));
    }

    filterApplications() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;

        const filteredApplications = this.applications.filter(app => {
            const matchesSearch = 
                app.companyName.toLowerCase().includes(searchTerm) || 
                app.jobTitle.toLowerCase().includes(searchTerm);
            
            const matchesStatus = statusFilter === '' || app.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        this.renderFilteredApplications(filteredApplications);
    }

    renderFilteredApplications(filteredApplications) {
        const tableBody = document.getElementById('applicationsTableBody');
        tableBody.innerHTML = '';

        filteredApplications.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${app.companyName}</td>
                <td>${app.jobTitle}</td>
                <td>${app.status}</td>
                <td>${app.date}</td>
                <td>
                    <button onclick="jobTracker.editApplication(${app.id})">Edit</button>
                    <button onclick="jobTracker.deleteApplication(${app.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    updateStatusChart() {
        const ctx = document.getElementById('statusChart').getContext('2d');
        const statusCounts = this.calculateStatusCounts();

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', 
                        '#4BC0C0', '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Job Application Status Distribution'
                }
            }
        });
    }

    calculateStatusCounts() {
        return this.applications.reduce((counts, app) => {
            counts[app.status] = (counts[app.status] || 0) + 1;
            return counts;
        }, {});
    }

    resetForm() {
        document.getElementById('jobApplicationForm').reset();
    }
}

const jobTracker = new JobApplicationTracker();