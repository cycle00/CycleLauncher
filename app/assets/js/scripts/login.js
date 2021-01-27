const validUsername = /^[a-zA-Z0-9_]{1,16}$/;
const basicEmail = /^\S+@\S+\.\S+$/;

const loginCancelContainer = document.getElementById('loginCancelContainer');
const loginCancelButton  = document.getElementById('loginCancelButton');
const loginEmailError = document.getElementById('loginEmailError');
const loginUsername = document.getElementById('loginUsername');
const loginPasswordError = document.getElementById('loginPasswordError');
const loginPassword = document.getElementById('loginPassword');
const checkmarkContainer = document.getElementById('checkmarkContainer');
const loginRememberOption = document.getElementById('loginRememberOption');
const loginButton = document.getElementById('loginButton');
const loginForm = document.getElementById('loginForm');

let lu = false, lp = false;

const loggerLogin = logger('%c[Login]', 'color: #000668; font-weight: bold');

function showError(element, value) {
    element.innerHTML = value;
    element.style.opacity = 1;
}

function shakeError(element) {
    if (element.style.opacity == 1) {
        element.classList.remove('shake');
        void element.offsetWidth;
        element.classList.add('shake');
    }
}

function validateEmail(value) {
    if (value) {
        if (!basicEmail.test(value) && !validUsername.test(value)) {
            showError(loginEmailError)
        }
    }
}