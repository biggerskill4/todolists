// assets/js/login_form.js
// Updated login/signup with Supabase integration

import { signUp, logIn, resetPassword } from './supabase-config.js';

const mainTabs = document.querySelector('.tabsJs');
const tabLoginBtn = document.querySelector('.loginBtn');
const tabSignUpBtn = document.querySelector('.signUpBtn');
const loginHeading = document.querySelector('.loginHeading');
const signUpHeading = document.querySelector('.signUpHeading');
const loginForm = document.querySelector('form[name=loginForm]');
const signUpForm = document.querySelector('form[name=signUpForm]');
const resetPswdForm = document.querySelector('form[name=resetPswd]');

// ============================================================
// TAB SWITCHING
// ============================================================

if (mainTabs) {
    tabLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        tabLoginBtn.classList.add('active');
        tabSignUpBtn.classList.remove('active');
        loginForm.style.display = "flex";
        signUpForm.style.display = "none";
        loginHeading.style.display = "block";
        signUpHeading.style.display = "none";
    });
    
    tabSignUpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        tabLoginBtn.classList.remove('active');
        tabSignUpBtn.classList.add('active');
        loginForm.style.display = "none";
        signUpForm.style.display = "flex";
        signUpHeading.style.display = "block";
        loginHeading.style.display = "none";
    });
}

// ============================================================
// SIGN UP FORM HANDLER
// ============================================================

if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = signUpForm.querySelector('input#username').value.trim();
        const signUpEmailAddress = signUpForm.querySelector('input#signUpEmailAddress').value.trim();
        const signUpPswd = signUpForm.querySelector('input#signUpPswd').value;
        const signUpConfirmPswd = signUpForm.querySelector('input#signUpConfirmPswd').value;

        // Validation
        if (!username || !signUpEmailAddress || !signUpPswd || !signUpConfirmPswd) {
            alert("All fields are required!");
            return;
        }

        if (username.length < 2) {
            alert("Username must be at least 2 characters long!");
            return;
        }

        if (signUpEmailAddress.length < 5 || !signUpEmailAddress.includes('@')) {
            alert("Please enter a valid email!");
            return;
        }

        if (signUpPswd.length < 6) {
            alert("Password must be at least 6 characters long!");
            return;
        }

        if (signUpPswd !== signUpConfirmPswd) {
            alert("Passwords do not match!");
            return;
        }

        try {
            // Show loading state
            const signUpBtn = signUpForm.querySelector('button[type="submit"]');
            const originalText = signUpBtn.textContent;
            signUpBtn.textContent = "Creating account...";
            signUpBtn.disabled = true;

            // Call Supabase signup
            const result = await signUp(signUpEmailAddress, signUpPswd, username);

            if (result.success) {
                alert("Sign Up Successful! Please verify your email and log in.");
                signUpForm.reset();
                // Switch to login tab
                tabLoginBtn.click();
            } else {
                alert(`Sign up failed: ${result.error}`);
            }

            // Restore button
            signUpBtn.textContent = originalText;
            signUpBtn.disabled = false;

        } catch (error) {
            console.error('Sign up error:', error);
            alert(`An error occurred: ${error.message}`);
        }
    });
}

// ============================================================
// LOGIN FORM HANDLER
// ============================================================

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const loginEmailAddress = loginForm.querySelector('input#loginEmailAddress').value.trim();
        const loginPswd = loginForm.querySelector('input#loginPswd').value;

        // Validation
        if (!loginEmailAddress || !loginPswd) {
            alert("Email and password are required!");
            return;
        }

        try {
            // Show loading state
            const loginBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = loginBtn.textContent;
            loginBtn.textContent = "Logging in...";
            loginBtn.disabled = true;

            // Call Supabase login
            const result = await logIn(loginEmailAddress, loginPswd);

            if (result.success) {
                // Store user info in localStorage
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                // Redirect to main app
                window.location.href = "./index.html";
            } else {
                alert(`Login failed: ${result.error}`);
            }

            // Restore button
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;

        } catch (error) {
            console.error('Login error:', error);
            alert(`An error occurred: ${error.message}`);
        }
    });
}

// ============================================================
// PASSWORD TOGGLE
// ============================================================

const passwordFields = document.querySelectorAll(".password input");
const toggleIcons = document.querySelectorAll(".password a ion-icon");

toggleIcons.forEach((icon, index) => {
    icon.addEventListener('click', (e) => {
        e.preventDefault();

        let passwordInput = passwordFields[index];

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            icon.setAttribute("name", "eye-outline");
        } else {
            passwordInput.type = "password";
            icon.setAttribute("name", "eye-off-outline");
        }
    });
});

// ============================================================
// PASSWORD RESET HANDLER
// ============================================================

if (resetPswdForm) {
    resetPswdForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const resetEmail = resetPswdForm.querySelector('input[type="email"]')?.value.trim();

        if (!resetEmail) {
            alert("Please enter your email address!");
            return;
        }

        try {
            const resetBtn = resetPswdForm.querySelector('button[type="submit"]');
            const originalText = resetBtn.textContent;
            resetBtn.textContent = "Sending...";
            resetBtn.disabled = true;

            const result = await resetPassword(resetEmail);

            if (result.success) {
                alert("Password reset email sent! Check your inbox.");
                resetPswdForm.reset();
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = "./login-signup.html";
                }, 2000);
            } else {
                alert(`Error: ${result.error}`);
            }

            resetBtn.textContent = originalText;
            resetBtn.disabled = false;

        } catch (error) {
            console.error('Password reset error:', error);
            alert(`An error occurred: ${error.message}`);
        }
    });
}

// ============================================================
// CHECK IF ALREADY LOGGED IN
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            // Redirect to main app if already logged in
            window.location.href = "./index.html";
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
});

// ============================================================
// CUSTOM CURSOR
// ============================================================

const cursor = document.createElement("div");
cursor.classList.add("custom-cursor");
document.body.appendChild(cursor);

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
const speed = 0.1;

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    requestAnimationFrame(animateCursor);
}

animateCursor();