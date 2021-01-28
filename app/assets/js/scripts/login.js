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
            showError(loginEmailError, Lang.queryJS('login.error.invalidValue'));
            loginDisabled(true);
            lu = false;
        } else {
            loginEmailError.style.opacity = 0;
            lu = true;
            if (lp) {
                loginDisabled(false);
            }
        }
    } else {
        lu = false;
        showError(loginEmailError, Lang.queryJS('login.error.requiredValue'));
    }
}

function validatePassword(value) {
    if (value) {
        loginPasswordError.style.opacity = 0;
        lp = true;
        if (lu) {
            loginDisabled(false);
        }
    } else {
        lp = false;
        showError(loginPasswordError, Lang.queryJS('login.error.requiredValue'));
        loginDisabled(true);
    }
}

loginUsername.addEventListener('focusout', (e) => {
    validateEmail(e.target.value);
    shakeError(loginEmailError);
});

loginPassword.addEventListener('focusout', (e) => {
    validatePassword(e.target.value);
    shakeError(loginPasswordError);
});

loginUsername.addEventListener('input', (e) => {
    validateEmail(e.target.value);
});

loginPassword.addEventListener('input', (e) => {
    validatePassword(e.target.value);
});

function loginDisabled(v) {
    if (loginButton.disabled !== v) {
        loginButton.disabled = v;
    }
}

function loginLoading(v) {
    if (v) {
        loginButton.setAttribute('loading', v);
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.login'), Lang.queryJS('login.loggingIn'));
    } else {
        loginButton.removeAttribute('loading');
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.login'));
    }
}

function formDisabled(v) {
    loginDisabled(v);
    loginCancelButton.disabled = v;
    loginUsername.disabled = v;
    loginPassword.disabled = v;
    if (v) {
        checkmarkContainer.setAttribute('disabled', v);
    } else {
        checkmarkContainer.removeAttribute('disabled');
    }
    loginRememberOption.disabled = v;
}

function resolveError(err) {
    if(err.cause != null && err.cause === 'UserMigratedException') {
        return {
            title: Lang.queryJS('login.error.userMigrated.title'),
            desc: Lang.queryJS('login.error.userMigrated.desc')
        }
    } else {
        if(err.error != null){
            if(err.error === 'ForbiddenOperationException'){
                if(err.errorMessage != null){
                    if(err.errorMessage === 'Invalid credentials. Invalid username or password.'){
                        return {
                            title: Lang.queryJS('login.error.invalidCredentials.title'),
                            desc: Lang.queryJS('login.error.invalidCredentials.desc')
                        }
                    } else if(err.errorMessage === 'Invalid credentials.'){
                        return {
                            title: Lang.queryJS('login.error.rateLimit.title'),
                            desc: Lang.queryJS('login.error.rateLimit.desc')
                        }
                    }
                }
            }
        } else {
            if(err.code != null){
                if(err.code === 'ENOENT'){
                    return {
                        title: Lang.queryJS('login.error.noInternet.title'),
                        desc: Lang.queryJS('login.error.noInternet.desc')
                    }
                } else if(err.code === 'ENOTFOUND'){
                    return {
                        title: Lang.queryJS('login.error.authDown.title'),
                        desc: Lang.queryJS('login.error.authDown.desc')
                    }
                }
            }
        }
    }
    if(err.message != null){
        if(err.message === 'NotPaidAccount'){
            return {
                title: Lang.queryJS('login.error.notPaid.title'),
                desc: Lang.queryJS('login.error.notPaid.desc')
            }
        } else {
            return {
                title: Lang.queryJS('login.error.unknown.title'),
                desc: err.message
            }
        }
    } else {
        return {
            title: err.error,
            desc: err.errorMessage
        }
    }
}

//TODO
let loginViewOnSuccess = VIEWS.landing;
let loginViewOnCancel = VIEWS.settings;
let loginViewCancelHandler;

function loginCancelEnabled(val) {
    if (val) {
        $(loginCancelContainer).show();
    } else {
        $(loginCancelContainer).hide();
    }
}

loginCancelButton.onclick = (e) => {
    switchView(getCurrentView(), loginViewOnCancel, 500, 500, () => {
        loginUsername.value = "";
        loginPassword.value = "";
        loginCancelEnabled(false);
        if (loginViewCancelHandler != null) {
            loginViewCancelHandler();
            loginViewCancelHandler = null;
        }
    });
}

loginForm.onsubmit = () => { return false };

loginButton.addEventListener('click', () => {
    formDisabled(true);
    loginLoading(true);
    AuthManager.addAccount(loginUsername.value, loginPassword.value).then((value) => {
        updateSelectedAccount(value);
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.success'));
        $('.circle-loader').toggleClass('load-complete');
        $('.checkmark').toggle();
        setTimeout(() => {
            switchView(VIEWS.login, loginViewOnSuccess, 500, 500, () => {
                if (loginViewOnSuccess === VIEWS.settings) {
                    prepareSettings();
                }

                loginViewOnSuccess = VIEWS.landing;
                loginCancelEnabled(false);
                loginViewCancelHandler = null;
                loginUsername.value = "";
                loginPassword.value = "";
                $('.circle-loader').toggleClass('load-complete');
                $('.checkmark').toggle();
                loginLoading(false);
                loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.success'), Lang.queryJS('login.login'));
                formDisabled(false);
            });
        }, 1000);
    }).catch((err) => {
        loginLoading(false);
        const errF = resolveError(err);
        setOverlayContent(errF.title, errF.desc, Lang.queryJS('login.tryAgain'));
        setOverlayHandler(() => {
            formDisabled(false);
            toggleOverlay(false);
        });
        toggleOverlay(true);
        loggerLogin.log('Error while logging in.', err);
    });
});