const path = require('path');

const AuthManager = require('./assets/js/authmanager');
const ConfigManager = require('./assets/js/configmanager');
const Lang = require('./assets/js/langloader');

let rscShouldLoad = false;
let fatalStartupError = false;

const VIEWS = {
    landing: '#landingContainer',
    login: '#loginContainer',
    settings: '#settingsContainer',
    welcome: '#welcomeContainer'
}

let currentView;

function switchView(current, next, currentFadeTime = 500, nextFadeTime = 500, onCurrentFade = () => {}, onNextFade = () => {}) {
    currentView = next;
    $(`${current}`).fadeOut(currentFadeTime, () => {
        onCurrentFade();
        $(`${next}`).fadeIn(nextFadeTime, () => {
            onNextFade();
        });
    });
}

function getCurrentView() {
    return currentView;
}

function showMainUI() {
    if (!isDev) {
        loggerAutoUpdater.log("Initializing...");
        ipcRenderer.send('autoUpdateAction', 'initAutoUpdater', ConfigManager.getAllowPrerelease());
    }



    setTimeout(() => {
        document.getElementById('frameBar').style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        // TODO: Background;
        $('#main').show();

        const isLoggedIn = Object.keys(ConfigManager.getAuthAccounts()).length > 0;

        if (!isDev && isLoggedIn) {

        }

        if (ConfigManager.isFirstLaunch()) {
            currentView = VIEWS.welcome;
            $(VIEWS.welcome).fadeIn(1000);
        } else {
            if (isLoggedIn) {
                // landing
            } else {
                currentView = VIEWS.login;
                $(VIEWS.login).fadeIn(1000);
            }
        }
    });
}

// BURH

document.addEventListener('readystatechange', function() {
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        if (!rscShouldLoad) {
            rscShouldLoad = false;
            // if not fatal error
            showMainUI();
        }
    }
}, false);
