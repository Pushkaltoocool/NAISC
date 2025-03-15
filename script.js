
document.addEventListener('DOMContentLoaded', () => {
    // **Define Singapore's Geographical Boundaries**
    const SINGAPORE_BOUNDS = {
        latMin: 1.15,
        latMax: 1.47,
        lonMin: 103.6,
        lonMax: 104.0
    };
    const singaporeLatLngBounds = L.latLngBounds(
        [SINGAPORE_BOUNDS.latMin, SINGAPORE_BOUNDS.lonMin],
        [SINGAPORE_BOUNDS.latMax, SINGAPORE_BOUNDS.lonMax]
    );

    // **Initialize Maps without maxBounds**
    let reportingMap = L.map('map').setView([1.3521, 103.8198], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(reportingMap);

    let adminMap = L.map('admin-map').setView([1.3521, 103.8198], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(adminMap);

    // **Global Variables**
    let tempMarker;
    let reportMarkers = [];
    let imageDataUrl = null; // For image preview and storage

    let currentUser = null;
    let users = [];
    let reports = [
        {
            id: 1,
            userEmail: 'user@example.com',
            locationName: 'Punggol',
            latitude: 1.3984,
            longitude: 103.9072,
            description: 'Broken Traffic Light',
            category: 'Infrastructure',
            urgency: 'High',
            threat: 'Moderate',
            imageDataUrl: 'broken-traffic-light.jpg',
            status: 'Pending'
        }
    ];
    let forumPosts = [];
    let reportIdCounter = 2;
    let forumPostIdCounter = 1;
    let userIdCounter = 1;

    // **Page Elements**
    const landingPage = document.getElementById('landing-page');
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const adminPage = document.getElementById('admin-page');
    const reportingPage = document.getElementById('reporting-page');
    const myReportsPage = document.getElementById('my-reports-page');
    const communityForumPage = document.getElementById('community-forum-page');
    const aboutPage = document.getElementById('about-page');
    const contactPage = document.getElementById('contact-page');
    const navbar = document.getElementById('navbar');

    // **Helper Functions**
    function hideAllPages() {
        [landingPage, loginPage, registerPage, adminPage, reportingPage, myReportsPage, communityForumPage, aboutPage, contactPage].forEach(page => {
            page.style.display = 'none';
            page.classList.remove('show');
        });
    }

    function showPage(page) {
        hideAllPages();
        page.classList.add('show');
        page.style.display = 'block';
        if (page.id === 'reporting-page') reportingMap.invalidateSize();
        else if (page.id === 'admin-page') {
            adminMap.invalidateSize();
            renderAdminMap();
        }
    }

    function updateNavbar() {
        navbar.style.display = currentUser ? 'block' : 'none';
    }

    function createStatusDropdown(currentStatus) {
        return `
            <select class="status-update">
                <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="In Progress" ${currentStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Resolved" ${currentStatus === 'Resolved' ? 'selected' : ''}>Resolved</option>
            </select>
            <button class="update-status-btn">Update Status</button>
        `;
    }

    // **Rendering Functions**
    function renderAdminReports() {
        const adminReportsContainer = document.getElementById('admin-reports-container');
        adminReportsContainer.innerHTML = '';
        reports.forEach(report => {
            const li = document.createElement('li');
            li.setAttribute('data-report-id', report.id);
            li.innerHTML = `
                <p><strong>Location:</strong> ${report.locationName}</p>
                <p><strong>Category:</strong> ${report.category}</p>
                <p><strong>Description:</strong> ${report.description}</p>
                <p><strong>Urgency:</strong> ${report.urgency}</p>
                <p><strong>Threat:</strong> ${report.threat}</p>
                <p><strong>Status:</strong> <span class="report-status">${report.status}</span></p>
                ${report.imageDataUrl ? `<img src="${report.imageDataUrl}" alt="Report Image">` : ''}
                ${createStatusDropdown(report.status)}
            `;
            adminReportsContainer.appendChild(li);
        });
        renderAdminMap();
    }

    function renderAdminMap() {
        reportMarkers.forEach(marker => adminMap.removeLayer(marker));
        reportMarkers = [];
        reports.forEach(report => {
            if (report.latitude && report.longitude) {
                const marker = L.marker([report.latitude, report.longitude]).addTo(adminMap);
                const popupContent = `
                    <b>${report.locationName}</b><br>
                    Category: ${report.category}<br>
                    Description: ${report.description}<br>
                    Urgency: ${report.urgency}<br>
                    Threat: ${report.threat}<br>
                    Status: <select class="status-update" data-report-id="${report.id}">
                        <option value="Pending" ${report.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${report.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${report.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select><br>
                    ${report.imageDataUrl ? `<img src="${report.imageDataUrl}" alt="Report Image">` : ''}
                `;
                marker.bindPopup(popupContent);
                reportMarkers.push(marker);
            }
        });
    }

    function renderUserReports() {
        const userReportsContainer = document.getElementById('user-reports-container');
        userReportsContainer.innerHTML = '';
        const userReports = reports.filter(report => report.userEmail === currentUser.email);
        if (userReports.length === 0) {
            userReportsContainer.innerHTML = 'No reports submitted yet.';
            return;
        }
        userReports.forEach(report => {
            const li = document.createElement('li');
            li.setAttribute('data-report-id', report.id);
            li.innerHTML = `
                <p><strong>Location:</strong> ${report.locationName}</p>
                <p><strong>Category:</strong> ${report.category}</p>
                <p><strong>Description:</strong> ${report.description}</p>
                <p><strong>Urgency:</strong> ${report.urgency}</p>
                <p><strong>Threat:</strong> ${report.threat}</p>
                <p><strong>Status:</strong> ${report.status}</p>
                ${report.imageDataUrl ? `<img src="${report.imageDataUrl}" alt="Report Image">` : ''}
            `;
            userReportsContainer.appendChild(li);
        });
    }

    function renderForumPosts() {
        const forumPostsContainer = document.getElementById('forum-posts');
        forumPostsContainer.innerHTML = forumPosts.length === 0 ? 'No posts yet. Be the first to post!' : '';
        forumPosts.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.classList.add('forum-post');
            postDiv.setAttribute('data-post-id', post.id);
            postDiv.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <p>Posted by ${post.author} on ${post.date}</p>
            `;
            forumPostsContainer.appendChild(postDiv);
        });
    }

    // **Navigation Event Listeners**
    document.getElementById('nav-home').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
            if (currentUser.role === 'admin') {
                renderAdminReports();
                showPage(adminPage);
            } else showPage(reportingPage);
        } else showPage(landingPage);
    });

    document.getElementById('nav-my-reports').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
            renderUserReports();
            showPage(myReportsPage);
        }
    });

    document.getElementById('nav-community').addEventListener('click', (e) => {
        e.preventDefault();
        renderForumPosts();
        showPage(communityForumPage);
    });

    document.getElementById('nav-about').addEventListener('click', (e) => {
        e.preventDefault();
        showPage(aboutPage);
    });

    document.getElementById('nav-contact').addEventListener('click', (e) => {
        e.preventDefault();
        showPage(contactPage);
    });

    document.getElementById('nav-logout').addEventListener('click', (e) => {
        e.preventDefault();
        currentUser = null;
        updateNavbar();
        showPage(landingPage);
    });

    // **Landing Page Buttons**
    document.getElementById('hero-report-issue').addEventListener('click', (e) => {
        e.preventDefault();
        showPage(loginPage);
    });

    document.getElementById('hero-learn-more').addEventListener('click', (e) => {
        e.preventDefault();
        showPage(aboutPage);
    });

    document.getElementById('cta-register').addEventListener('click', (e) => {
        e.preventDefault();
        showPage(registerPage);
    });

    document.getElementById('cta-login').addEventListener('click', (e) => {
        e.preventDefault();
        showPage(loginPage);
    });

    // **Login & Registration**
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = '';
        if (email.toLowerCase() === 'admin@sgresolve.com' && password === 'admin') {
            let adminUser = users.find(u => u.email.toLowerCase() === 'admin@sgresolve.com');
            if (!adminUser) {
                adminUser = { id: userIdCounter++, name: 'Admin', email: 'admin@sgresolve.com', password: 'admin', role: 'admin' };
                users.push(adminUser);
            }
            currentUser = adminUser;
            updateNavbar();
            document.getElementById('login-form').reset();
            renderAdminReports();
            showPage(adminPage);
            return;
        }
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user && user.password === password) {
            currentUser = user;
            updateNavbar();
            document.getElementById('login-form').reset();
            if (currentUser.role === 'admin') {
                renderAdminReports();
                showPage(adminPage);
            } else showPage(reportingPage);
        } else errorDiv.textContent = 'Invalid email or password.';
    });

    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const errorDiv = document.getElementById('register-error');
        errorDiv.textContent = '';
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            errorDiv.textContent = 'A user with that email already exists.';
            return;
        }
        const role = email.toLowerCase() === 'admin@sgresolve.com' ? 'admin' : 'user';
        const newUser = { id: userIdCounter++, name, email, password, role };
        users.push(newUser);
        currentUser = newUser;
        updateNavbar();
        document.getElementById('register-form').reset();
        if (currentUser.role === 'admin') {
            renderAdminReports();
            showPage(adminPage);
        } else showPage(reportingPage);
    });

    document.getElementById('go-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-error').textContent = '';
        showPage(registerPage);
    });

    document.getElementById('go-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-error').textContent = '';
        showPage(loginPage);
    });

    // **Reporting Map Click Event**
    reportingMap.on('click', function(e) {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        if (lat < SINGAPORE_BOUNDS.latMin || lat > SINGAPORE_BOUNDS.latMax ||
            lon < SINGAPORE_BOUNDS.lonMin || lon > SINGAPORE_BOUNDS.lonMax) {
            alert('Please select a location within Singapore.');
            return;
        }
        if (tempMarker) reportingMap.removeLayer(tempMarker);
        tempMarker = L.marker([lat, lon]).addTo(reportingMap);
        document.getElementById('latitude').value = lat.toFixed(4);
        document.getElementById('longitude').value = lon.toFixed(4);
    });

    // **Detect Location Button**
    document.getElementById('detectLocation').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                if (lat < SINGAPORE_BOUNDS.latMin || lat > SINGAPORE_BOUNDS.latMax ||
                    lon < SINGAPORE_BOUNDS.lonMin || lon > SINGAPORE_BOUNDS.lonMax) {
                    alert('Your current location is not within Singapore. Please select a location within Singapore on the map.');
                    return;
                }
                if (tempMarker) reportingMap.removeLayer(tempMarker);
                tempMarker = L.marker([lat, lon]).addTo(reportingMap);
                document.getElementById('latitude').value = lat.toFixed(4);
                document.getElementById('longitude').value = lon.toFixed(4);
                reportingMap.setView([lat, lon], 14);
            }, function(error) {
                alert('Error retrieving location: ' + error.message);
            });
        } else alert('Geolocation is not supported by your browser.');
    });

    // **Image Upload Preview**
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    imageUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imageDataUrl = e.target.result;
                imagePreview.innerHTML = `<img src="${imageDataUrl}" alt="Image Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            imageDataUrl = null;
            imagePreview.innerHTML = '';
        }
    });

    // **Auto Detect Feature**
    const autoDetectButton = document.getElementById('autoDetect');
    const problemDesc = document.getElementById('problemDesc');
    const categorySelect = document.getElementById('category');
    const urgencySelect = document.getElementById('urgency');
    const threatSelect = document.getElementById('threat');
    const reportError = document.getElementById('report-error');

    problemDesc.addEventListener('input', () => {
        autoDetectButton.disabled = !problemDesc.value.trim();
    });

    function mockPredict(description) {
        const lowerDesc = description.toLowerCase();
        let category = 'Others';
        if (lowerDesc.includes('road') || lowerDesc.includes('pothole') || lowerDesc.includes('traffic')) category = 'Infrastructure';
        else if (lowerDesc.includes('dark') || lowerDesc.includes('light') || lowerDesc.includes('safety')) category = 'Safety';
        else if (lowerDesc.includes('environment') || lowerDesc.includes('pollution')) category = 'Environmental';
        let urgency = 'Medium';
        if (lowerDesc.includes('urgent') || lowerDesc.includes('immediate')) urgency = 'High';
        else if (lowerDesc.includes('not urgent') || lowerDesc.includes('later')) urgency = 'Low';
        let threat = 'Moderate';
        if (lowerDesc.includes('dangerous') || lowerDesc.includes('hazard')) threat = 'Severe';
        else if (lowerDesc.includes('minor') || lowerDesc.includes('small')) threat = 'Minor';
        return { category, urgency, threat };
    }

    autoDetectButton.addEventListener('click', () => {
        const description = problemDesc.value.trim();
        if (!description) {
            reportError.textContent = 'Please enter a description before using auto detect.';
            return;
        }
        reportError.textContent = '';
        autoDetectButton.disabled = true;
        autoDetectButton.textContent = 'Detecting...';
        setTimeout(() => {
            const mockData = mockPredict(description);
            if (mockData.category) categorySelect.value = mockData.category;
            if (mockData.urgency) urgencySelect.value = mockData.urgency;
            if (mockData.threat) threatSelect.value = mockData.threat;
            autoDetectButton.disabled = false;
            autoDetectButton.textContent = 'Auto Detect';
        }, 1000);
    });

    // **Report Submission**
    document.getElementById('report-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) return;
        const locationName = document.getElementById('locationName').value.trim();
        const latitude = parseFloat(document.getElementById('latitude').value);
        const longitude = parseFloat(document.getElementById('longitude').value);
        const description = document.getElementById('problemDesc').value.trim();
        const category = document.getElementById('category').value;
        const urgency = document.getElementById('urgency').value;
        const threat = document.getElementById('threat').value;
        const errorDiv = document.getElementById('report-error');
        errorDiv.textContent = '';
        if (!locationName || isNaN(latitude) || isNaN(longitude) || !description || !category || !urgency || !threat) {
            errorDiv.textContent = 'Please fill in all required fields.';
            return;
        }
        if (latitude < SINGAPORE_BOUNDS.latMin || latitude > SINGAPORE_BOUNDS.latMax ||
            longitude < SINGAPORE_BOUNDS.lonMin || longitude > SINGAPORE_BOUNDS.lonMax) {
            errorDiv.textContent = 'The selected location is not within Singapore.';
            return;
        }
        const report = {
            id: reportIdCounter++,
            userEmail: currentUser.email,
            locationName,
            latitude,
            longitude,
            description,
            category,
            urgency,
            threat,
            imageDataUrl,
            status: 'Pending'
        };
        reports.push(report);
        document.getElementById('report-form').reset();
        imageDataUrl = null;
        imagePreview.innerHTML = '';
        if (tempMarker) {
            reportingMap.removeLayer(tempMarker);
            tempMarker = null;
        }
        alert('Report submitted successfully!');
        renderUserReports();
    });

    // **Admin Status Updates**
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('status-update')) {
            const reportId = parseInt(e.target.getAttribute('data-report-id'));
            const newStatus = e.target.value;
            const report = reports.find(r => r.id === reportId);
            if (report) {
                report.status = newStatus;
                renderAdminReports();
                if (currentUser && currentUser.role !== 'admin') renderUserReports();
            }
        }
    });

    document.getElementById('admin-reports-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('update-status-btn')) {
            const li = e.target.closest('li');
            const reportId = parseInt(li.getAttribute('data-report-id'));
            const select = li.querySelector('.status-update');
            const newStatus = select.value;
            const report = reports.find(r => r.id === reportId);
            if (report) {
                report.status = newStatus;
                li.querySelector('.report-status').textContent = newStatus;
                renderAdminMap();
                if (currentUser && currentUser.role !== 'admin') renderUserReports();
            }
        }
    });

    document.getElementById('refresh-reports').addEventListener('click', (e) => {
        e.preventDefault();
        renderAdminReports();
    });

    // **Forum Post Submission**
    document.getElementById('forum-post-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) return;
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        if (!title || !content) {
            alert('Please provide both a title and content for your post.');
            return;
        }
        const post = {
            id: forumPostIdCounter++,
            title,
            content,
            author: currentUser.name,
            date: new Date().toLocaleDateString()
        };
        forumPosts.push(post);
        document.getElementById('forum-post-form').reset();
        renderForumPosts();
    });

    // **Export Reports as CSV**
    function exportReports() {
        const csvRows = [];
        const headers = ['ID', 'User Email', 'Location Name', 'Latitude', 'Longitude', 'Description', 'Category', 'Urgency', 'Threat', 'Image Data URL', 'Status'];
        csvRows.push(headers.join(','));
        reports.forEach(report => {
            const row = [
                report.id,
                report.userEmail,
                report.locationName,
                report.latitude,
                report.longitude,
                `"${report.description.replace(/"/g, '""')}"`,
                report.category,
                report.urgency,
                report.threat,
                report.imageDataUrl || '',
                report.status
            ];
            csvRows.push(row.join(','));
        });
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sgresolve-reports.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    document.getElementById('export-data').addEventListener('click', (e) => {
        e.preventDefault();
        exportReports();
    });

    // **Initialize the App**
    updateNavbar();
    hideAllPages();
    showPage(landingPage);
});

// **Chatbot Functions**
function toggleChat() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.classList.toggle('active');
}

async function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput) return;
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<div class="message user"><strong>You:</strong> ${userInput}</div>`;
    const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
    });
    const data = await response.json();
    chatBox.innerHTML += `<div class="message bot"><strong>SGResolve Bot:</strong> ${data.response}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    document.getElementById("user-input").value = "";
}
