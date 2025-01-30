// DOM Elements
const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const reportingPage = document.getElementById('reporting-page');
const goToRegister = document.getElementById('go-to-register');
const goToLogin = document.getElementById('go-to-login');
const logoutLink = document.getElementById('logout');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const reportForm = document.getElementById('report-form');

// Sample user data (for demo purposes)
let users = [];

// Switch to Registration Page
goToRegister.addEventListener('click', (e) => {
  e.preventDefault();
  loginPage.style.display = 'none';
  registerPage.style.display = 'block';
});

// Switch to Login Page
goToLogin.addEventListener('click', (e) => {
  e.preventDefault();
  registerPage.style.display = 'none';
  loginPage.style.display = 'block';
});

// Handle Login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    alert('Login successful!');
    loginPage.style.display = 'none';
    reportingPage.style.display = 'block';
  } else {
    alert('Invalid email or password.');
  }
});

// Handle Registration
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  const userExists = users.some(u => u.email === email);
  if (userExists) {
    alert('User already exists.');
  } else {
    users.push({ name, email, password });
    alert('Registration successful! Please login.');
    registerPage.style.display = 'none';
    loginPage.style.display = 'block';
  }
});

// Handle Logout
logoutLink.addEventListener('click', (e) => {
  e.preventDefault();
  reportingPage.style.display = 'none';
  loginPage.style.display = 'block';
});

// Handle Report Submission
// Handle Report Submission
reportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const issueType = document.getElementById('issue-type').value;
    const issueDescription = document.getElementById('issue-description').value;
    const issueImage = document.getElementById('issue-image').files[0];
  
    if (issueImage) {
      // Read the image file as a data URL
      const reader = new FileReader();
      reader.onload = function (event) {
        const imageData = event.target.result;
  
        // Display the reported issue details (including the image)
        alert(`Issue reported successfully!\nType: ${issueType}\nDescription: ${issueDescription}`);
        console.log('Image Data:', imageData); // For debugging purposes
  
        // You can now send the issue data (including the image) to a backend server
        // Example: sendReportToServer({ issueType, issueDescription, imageData });
      };
      reader.readAsDataURL(issueImage);
    } else {
      alert('Please upload an image of the issue.');
    }
  
    reportForm.reset();
  });