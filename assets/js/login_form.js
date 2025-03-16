const tabLoginBtn = document.querySelector('.loginBtn');
const tabSignUpBtn = document.querySelector('.signUpBtn');
const loginHeading = document.querySelector('.loginHeading');
const signUpHeading = document.querySelector('.signUpHeading');
const loginForm = document.querySelector('form[name=loginForm]');
const signUpForm = document.querySelector('form[name=signUpForm]');

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

if (signUpForm) {
    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = signUpForm.querySelector('input#username').value.trim();
        const signUpEmailAddress = signUpForm.querySelector('input#signUpEmailAddress').value.trim();
        const signUpPswd = signUpForm.querySelector('input#signUpPswd').value;
        const signUpConfirmPswd = signUpForm.querySelector('input#signUpConfirmPswd').value;

        if (!username || !signUpEmailAddress || !signUpPswd || !signUpConfirmPswd) {
            alert("All fields are required!");
            return;
        }

        if (signUpPswd !== signUpConfirmPswd) {
            alert("Passwords do not match!");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        let isEmailExists = users.some(user => user.signUpEmailAddress === signUpEmailAddress)
        if (isEmailExists) {
            alert("This email is already registered!");
            return;
        }

        let newUsers = { username, signUpEmailAddress, signUpPswd };
        users.push(newUsers);

        localStorage.setItem("users", JSON.stringify(users));

        alert("Sign Up Successful!");
        signUpForm.reset();
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const loginEmailAddress = loginForm.querySelector('input#loginEmailAddress').value;
        const loginPswd = loginForm.querySelector('input#loginPswd').value;

        let users = JSON.parse(localStorage.getItem("users")) || [];

        let loggedInUser = users.find(user => 
            user.signUpEmailAddress === loginEmailAddress && 
            user.signUpPswd === loginPswd && user.username
        );

        if (loggedInUser) {
            localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
            window.location.href = "./index.html";
        } else {
            alert("Invalid email or password. Please try again.");
        }
        
    });
};


const passwordFields = document.querySelectorAll(".password input");
const toggleIcons = document.querySelectorAll(".password a ion-icon");

toggleIcons.forEach((icon, index) => {
    icon.addEventListener('click', (e) => {
        e.preventDefault();

        let passwordInput = passwordFields[index];

        if(passwordInput.type === "password") {
            passwordInput.type = "text";
            icon.setAttribute("name", "eye-outline");
        } else {
            passwordInput.type = "password";
            icon.setAttribute("name", "eye-off-outline");
        }
    })
})
