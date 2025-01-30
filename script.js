document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const loginPage = document.getElementById('login-page');
  const registerPage = document.getElementById('register-page');
  const reportingPage = document.getElementById('reporting-page');
  const adminPage = document.getElementById('admin-page');
  const goToRegister = document.getElementById('go-to-register');
  const goToLogin = document.getElementById('go-to-login');
  const logoutLink = document.getElementById('logout');
  const logoutAdmin = document.getElementById('logout-admin');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const reportForm = document.getElementById('report-form');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');
  const reportError = document.getElementById('report-error');
  const reportsContainer = document.getElementById('reports-container');

  // Chatbot Elements
  const chatbotToggle = document.querySelector('.chatbot-toggle');
  const chatbotFrame = document.querySelector('.chatbot-frame');
  const chatbotClose = document.createElement('button'); // Close button for chatbot

  // Sample user data (for demo purposes, use localStorage for persistence)
  let users = JSON.parse(localStorage.getItem('users')) || [];

  // Switch to Registration Page
  goToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(loginPage, registerPage);
  });

  // Switch to Login Page
  goToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(registerPage, loginPage);
  });

  // Handle Login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // Check if admin credentials are entered
    if (email === 'test@gmail.com' && password === 'admin') {
      loginError.textContent = '';
      switchPage(loginPage, adminPage);
      loadReports(); // Load all reports on the admin page
      return;
    }

    // Check for regular user login
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      loginError.textContent = '';
      switchPage(loginPage, reportingPage);
    } else {
      loginError.textContent = 'Invalid email or password.';
    }
  });

  // Handle Registration
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();

    if (!validateEmail(email)) {
      registerError.textContent = 'Please enter a valid email address.';
      return;
    }

    const userExists = users.some(u => u.email === email);
    if (userExists) {
      registerError.textContent = 'User already exists.';
    } else {
      users.push({ name, email, password });
      localStorage.setItem('users', JSON.stringify(users));
      registerError.textContent = '';
      alert('Registration successful! Please login.');
      switchPage(registerPage, loginPage);
    }
  });

  // Handle Logout
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(reportingPage, loginPage);
  });

  // Handle Admin Logout
  logoutAdmin.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(adminPage, loginPage);
  });

  // Handle Report Submission
  reportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const issueType = document.getElementById('issue-type').value;
    const issueDescription = document.getElementById('issue-description').value.trim();
    const issueImage = document.getElementById('issue-image').files[0];

    if (!issueImage) {
      reportError.textContent = 'Please upload an image of the issue.';
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const imageData = event.target.result;

      // Save the report to localStorage
      const reports = JSON.parse(localStorage.getItem('reports')) || [];
      reports.push({
        type: issueType,
        description: issueDescription,
        image: imageData,
        timestamp: new Date().toLocaleString(),
      });
      localStorage.setItem('reports', JSON.stringify(reports));

      showSuccessMessage(`Issue reported successfully!\nType: ${issueType}\nDescription: ${issueDescription}`);
      reportError.textContent = '';
      reportForm.reset();
    };
    reader.readAsDataURL(issueImage);
  });

  // Helper Functions
  function switchPage(hidePage, showPage) {
    hidePage.style.display = 'none';
    showPage.style.display = 'block';
  }

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Function to load reports
  function loadReports() {
    const reports = JSON.parse(localStorage.getItem('reports')) || [];
    reportsContainer.innerHTML = ''; // Clear previous reports

    if (reports.length === 0) {
      reportsContainer.innerHTML = '<li>No reports available.</li>';
      return;
    }

    reports.forEach((report, index) => {
      const reportItem = document.createElement('li');
      reportItem.innerHTML = `
        <strong>Type:</strong> ${report.type}<br>
        <strong>Description:</strong> ${report.description}<br>
        <strong>Timestamp:</strong> ${report.timestamp}<br>
        <img src="${report.image}" alt="Report Image" style="max-width: 200px; margin-top: 10px;">
      `;
      reportsContainer.appendChild(reportItem);
    });
  }

  // Show success message after report submission
  function showSuccessMessage(message) {
    const successMessage = document.createElement("div");
    successMessage.textContent = message;
    successMessage.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--success-color);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(successMessage);
    setTimeout(() => {
      successMessage.style.opacity = "1";
    }, 10);
    setTimeout(() => {
      successMessage.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 300);
    }, 3000);
  }

  // Chatbot Enhancements
  // Persist Chatbot State
  const isChatbotOpen = localStorage.getItem('chatbotOpen') === 'true';
  if (isChatbotOpen) {
    chatbotFrame.classList.add('open');
  }

  // Toggle Chatbot Visibility
  chatbotToggle.addEventListener('click', () => {
    chatbotFrame.classList.toggle('open');
    localStorage.setItem('chatbotOpen', chatbotFrame.classList.contains('open'));
  });

  // Add Close Button to Chatbot Frame
  chatbotClose.textContent = 'Close';
  chatbotClose.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
  `;
  chatbotClose.addEventListener('click', () => {
    chatbotFrame.classList.remove('open');
    localStorage.setItem('chatbotOpen', false);
  });
  chatbotFrame.appendChild(chatbotClose);

  // Accessibility Enhancements
  chatbotToggle.setAttribute('aria-label', 'Toggle Chat Support');
  chatbotToggle.setAttribute('aria-expanded', isChatbotOpen);
  chatbotToggle.addEventListener('click', () => {
    chatbotToggle.setAttribute('aria-expanded', chatbotFrame.classList.contains('open'));
  });
});
