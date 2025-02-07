// script.js
document.addEventListener('DOMContentLoaded', () => {
  //	
  // Global Variables & In-Memory Data Stores
  //	
  let currentUser = null; // will hold the logged-in user object
  let users = []; // user objects: { id, name, email, password, role }
  let reports = []; // report objects: { id, userEmail, issueType, description, imageName, status }
  let forumPosts = []; // forum post objects: { id, title, content, author, date }
  let reportIdCounter = 1;
  let forumPostIdCounter = 1;
  let userIdCounter = 1;
  //	
  // Page Elements
  //	
  const landingPage = document.getElementById('landing-page'); // New landing page element
  const loginPage = document.getElementById('login-page');
  const registerPage = document.getElementById('register-page');
  const adminPage = document.getElementById('admin-page');
  const reportingPage = document.getElementById('reporting-page');
  const myReportsPage = document.getElementById('my-reports-page');
  const communityForumPage = document.getElementById('community-forum-page');
  const aboutPage = document.getElementById('about-page');
  const contactPage = document.getElementById('contact-page');
  const navbar = document.getElementById('navbar');
  //	
  // Helper Functions
  //	
  // Hide all pages
  function hideAllPages() {
      landingPage.style.display = 'none'; // Hide landing page
      landingPage.classList.remove('show');
      loginPage.style.display = 'none';
      loginPage.classList.remove('show');
      registerPage.style.display = 'none';
      registerPage.classList.remove('show');
      adminPage.style.display = 'none';
      adminPage.classList.remove('show');
      reportingPage.style.display = 'none';
      reportingPage.classList.remove('show');
      myReportsPage.style.display = 'none';
      myReportsPage.classList.remove('show');
      communityForumPage.style.display = 'none';
      communityForumPage.classList.remove('show');
      aboutPage.style.display = 'none';
      aboutPage.classList.remove('show');
      contactPage.style.display = 'none';
      contactPage.classList.remove('show');
  }
  // Show a single page (by passing its element)
  function showPage(page) {
      hideAllPages();
      page.classList.add('show'); // Add 'show' class for transition
      page.style.display = 'block';
  }
  // Toggle the navigation bar based on login status
  function updateNavbar() {
      if (currentUser) {
    navbar.style.display = 'block';
      } else {
    navbar.style.display = 'none';
      }
  }
  // Render the list of reports for Admin
  function renderAdminReports() {
      const adminReportsContainer = document.getElementById('admin-reports-container');
      adminReportsContainer.innerHTML = ''; // Clear existing content
      reports.forEach(report => {
    // Create a list item for each report
    const li = document.createElement('li');
    li.setAttribute('data-report-id', report.id);
    li.innerHTML = `
    Issue: ${report.issueType}
Description: ${report.description}
Submitted By: ${report.userEmail}
Status: ${report.status}
Pending
In Progress
Resolved
Update Status
    `;
    adminReportsContainer.appendChild(li);
      });
  }
  // Render the list of reports submitted by the current (non-admin) user
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
    Issue: ${report.issueType}
Description: ${report.description}
Status: ${report.status}
    `;
    userReportsContainer.appendChild(li);
      });
  }
  // Render forum posts
  function renderForumPosts() {
      const forumPostsContainer = document.getElementById('forum-posts');
      forumPostsContainer.innerHTML = '';
      if (forumPosts.length === 0) {
    forumPostsContainer.innerHTML = 'No posts yet. Be the first to post!';
    return;
      }
      forumPosts.forEach(post => {
    const postDiv = document.createElement('div');
    postDiv.classList.add('forum-post');
    postDiv.setAttribute('data-post-id', post.id);
    postDiv.innerHTML = `
    ${post.title}
${post.content}
Posted by ${post.author} on ${post.date}
    `;
    forumPostsContainer.appendChild(postDiv);
      });
  }
  //	
  // Navigation Event Listeners
  //	
  // "Home" – for logged-out users, ALWAYS go to landing page; for admin, admin dashboard; for users, reporting page
  document.getElementById('nav-home').addEventListener('click', (e) => {
      e.preventDefault();
      if (currentUser) {
    if (currentUser.role === 'admin') {
    renderAdminReports();
    showPage(adminPage);
    } else {
    showPage(reportingPage);
    }
      } else {
    showPage(landingPage); // ALWAYS show landing page if not logged in
      }
  });
  // "My Reports" – user sees the reports they've submitted
  document.getElementById('nav-my-reports').addEventListener('click', (e) => {
      e.preventDefault();
      if (currentUser) {
    renderUserReports();
    showPage(myReportsPage);
      }
  });
  // "Community Forum" – show forum posts
  document.getElementById('nav-community').addEventListener('click', (e) => {
      e.preventDefault();
      renderForumPosts();
      showPage(communityForumPage);
  });
  // "About" page
  document.getElementById('nav-about').addEventListener('click', (e) => {
      e.preventDefault();
      showPage(aboutPage);
  });
  // "Contact" page
  document.getElementById('nav-contact').addEventListener('click', (e) => {
      e.preventDefault();
      showPage(contactPage);
  });
  // "Logout" – clear current user and return to landing page
  document.getElementById('nav-logout').addEventListener('click', (e) => {
      e.preventDefault();
      logout();
  });
  //	
  // Landing Page Buttons Event Listeners
  //	
  document.getElementById('hero-report-issue').addEventListener('click', (e) => {
      e.preventDefault();
      showPage(loginPage); // Redirect to login for reporting
  });
  document.getElementById('hero-learn-more').addEventListener('click', (e) => {
      e.preventDefault();
      showPage(aboutPage); // Redirect to about page for "learn more"
  });
  document.getElementById('cta-register').addEventListener('click', (e) => {
      e.preventDefault();
      showPage(registerPage); // Redirect to register page
  });
  document.getElementById('cta-login').addEventListener('click', (e) => {
      e.preventDefault();
      showPage(loginPage); // Redirect to login page
  });
  //	
  // Login & Registration
  //	
  // Login form submission
  document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();
      const errorDiv = document.getElementById('login-error');
      errorDiv.textContent = '';
      // Special check for admin credentials
      if (email.toLowerCase() === 'admin@sgresolve.com' && password === 'admin') {
    // Create admin user if not already present
    let adminUser = users.find(u => u.email.toLowerCase() === 'admin@sgresolve.com');
    if (!adminUser) {
    adminUser = {
    id: userIdCounter++,
    name: 'Admin',
    email: 'admin@sgresolve.com',
    password: 'admin',
    role: 'admin'
    };
    users.push(adminUser);
    }
    currentUser = adminUser;
    updateNavbar();
    document.getElementById('login-form').reset();
    renderAdminReports();
    showPage(adminPage);
    return;
      }
      // Simulate authentication: check against our in-memory users array.
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user && user.password === password) {
    currentUser = user;
    updateNavbar();
    document.getElementById('login-form').reset();
    // Navigate to the appropriate home page based on user role
    if (currentUser.role === 'admin') {
    renderAdminReports();
    showPage(adminPage);
    } else {
    showPage(reportingPage);
    }
      } else {
    errorDiv.textContent = 'Invalid email or password.';
      }
  });
  // Registration form submission
  document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value.trim();
      const errorDiv = document.getElementById('register-error');
      errorDiv.textContent = '';
      // Check for an existing user with the same email
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    errorDiv.textContent = 'A user with that email already exists.';
    return;
      }
      // For simulation, if the email is admin@sgresolve.com, assign an "admin" role.
      const role = (email.toLowerCase() === 'admin@sgresolve.com') ? 'admin' : 'user';
      const newUser = {
    id: userIdCounter++,
    name,
    email,
    password,
    role
      };
      users.push(newUser);
      currentUser = newUser;
      updateNavbar();
      document.getElementById('register-form').reset();
      if (currentUser.role === 'admin') {
    renderAdminReports();
    showPage(adminPage);
      } else {
    showPage(reportingPage);
      }
  });
  // Link from Login to Registration
  document.getElementById('go-to-register').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-error').textContent = '';
      showPage(registerPage);
  });
  // Link from Registration to Login
  document.getElementById('go-to-login').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('register-error').textContent = '';
      showPage(loginPage);
  });
  // Logout function
  function logout() {
      currentUser = null;
      updateNavbar();
      hideAllPages();
      showPage(landingPage); // Redirect to landing page after logout
  }
  //	
  // Report Submission (User Reporting an Issue)
  //	
  document.getElementById('report-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentUser) return;
      const issueType = document.getElementById('issue-type').value;
      const description = document.getElementById('issue-description').value.trim();
      const imageInput = document.getElementById('issue-image');
      const errorDiv = document.getElementById('report-error');
      errorDiv.textContent = '';
      if (!issueType) {
    errorDiv.textContent = 'Please select an issue type.';
    return;
      }
      if (!description) {
    errorDiv.textContent = 'Please provide a description of the issue.';
    return;
      }
      if (imageInput.files.length === 0) {
    errorDiv.textContent = 'Please choose an image.';
    return;
      }
      // For simulation purposes, we’re not uploading the file but just saving its name.
      const imageFile = imageInput.files[0];
      const report = {
    id: reportIdCounter++,
    userEmail: currentUser.email,
    issueType,
    description,
    imageName: imageFile.name,
    status: 'Pending'
      };
      reports.push(report);
      document.getElementById('report-form').reset();
      alert('Report submitted successfully!');
      renderUserReports();
  });
  //	
  // Admin: Update Report Status
  //	
  // Using event delegation on the admin reports container
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
    alert('Report status updated.');
    // Optionally, update user report view if needed
    if (currentUser && currentUser.role !== 'admin') {
    renderUserReports();
    }
    }
      }
  });
  //	
  // Forum Post Submission
  //	
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
  //	
  // Chatbot Toggle
  //	
  const chatbotToggle = document.querySelector('.chatbot-toggle');
  const chatbotFrame = document.querySelector('.chatbot-frame');
  chatbotToggle.addEventListener('click', () => {
      chatbotFrame.style.display = chatbotFrame.style.display === 'none' ? 'block' : 'none';
  });
  
  // Add this function to handle exporting data
  function exportReports() {
      // Convert the reports array into a CSV format
      const csvRows = [];
      
      // Add the header row
      const headers = ['ID', 'User Email', 'Issue Type', 'Description', 'Image Name', 'Status'];
      csvRows.push(headers.join(','));
      
      // Add each report as a row
      reports.forEach(report => {
          const row = [
              report.id,
              report.userEmail,
              report.issueType,
              `"${report.description.replace(/"/g, '""')}"`, // Escape quotes in description
              report.imageName,
              report.status
          ];
          csvRows.push(row.join(','));
      });
      
      // Combine rows into a single CSV string
      const csvString = csvRows.join('\n');
      
      // Create a Blob with the CSV data
      const blob = new Blob([csvString], { type: 'text/csv' });
      
      // Create a link element to trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sgresolve-reports.csv'; // File name
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  }

  // Add an event listener for the "Export Data" button
  document.getElementById('export-data').addEventListener('click', (e) => {
      e.preventDefault();
      exportReports();
  });

  //	
  // Initialize the App
  //	
  updateNavbar();
  hideAllPages();
  // Start with the landing page for logged out users
  showPage(landingPage);
});
