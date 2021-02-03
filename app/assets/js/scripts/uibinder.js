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

    // prepare settings

    setTimeout(() => {
        document.getElementById('frameBar').style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        document.body.style.backgroundImage = `url('assets/images/backgrounds/${document.body.getAttribute('bkid')}.png')`
        $('#main').show();

        const isLoggedIn = Object.keys(ConfigManager.getAuthAccounts()).length > 0;

        if (!isDev && isLoggedIn) {
            // validate account
        }

        if (ConfigManager.isFirstLaunch()) {
            currentView = VIEWS.welcome;
            $(VIEWS.welcome).fadeIn(1000);
        } else {
            if (isLoggedIn) {
                currentView = VIEWS.landing;
                $(VIEWS.landing).fadeIn(1000);
            } else {
                currentView = VIEWS.login;
                $(VIEWS.login).fadeIn(1000);
            }
        }
        setTimeout(() => {
            $('#loadingContainer').fadeOut(500, () => {
                $('#loadSpinnerImage').removeClass('rotating');
            });
        }, 250);
    }, 750);

    // Disable tabbing to the news container
}

// BURH
async function validateSelectedAccount() {
    const selectedAcc = ConfigManager.getSelectedAccount();
    if (selectedAcc != null) {
        const val = await AuthManager.validateSelected();
        if (!val) {
            ConfigManager.removeAuthAccount(selectedAcc.uuid);
            ConfigManager.save();
            const accLen = Object.keys(ConfigManager.getAuthAccounts()).length;
            setOverlayContent(
                "Failed to Refresh Login",
                `We were unable to refresh the login for <strong>${selectedAcc.displayName}</strong>. Please ${accLen > 0 ? "select another account or " : ""} login again.`,
                "Login",
                "Select Another Account"
            );
            setOverlayHandler(() => {
                document.getElementById('loginUsername').value = selectedAcc.username;
                validateEmail(selectedAcc.username);
                loginViewOnSuccess = getCurrentView();
                loginViewOnCancel = getCurrentView();
                if (accLen > 0) {
                    loginViewCancelHandler = () => {
                        ConfigManager.addAuthAccount(selectedAcc.uuid, selectedAcc.accessToken, selectedAcc.username, selectedAcc.displayName);
                        ConfigManager.save();
                        validateSelectedAccount();
                    }
                    loginCancelEnabled(true);
                }
                toggleOverlay(false);
                switchView(getCurrentView(), VIEWS.login);
            });
            setDismissHandler(() => {
                if (accLen > 1) {
                    prepareAccountSelectionList();
                    $('#overlayContent').fadeOut(250, () => {
                        bindOverlayKeys(true, 'accountSelectContent', true);
                        $('#accountSelectContent').fadeIn(250);
                    });
                } else {
                    const accountsObj = ConfigManager.getAuthAccounts();
                    const accounts = Array.from(Object.keys(accountsObj), v => accountsObj[v]);
                    setSelectedAccount(accounts[0].uuid);
                    toggleOverlay(false);
                }
            });
            toggleOverlay(true, accLen > 0);
        } else {
            return true;
        }
    } else {
        return true;
    }
}

function setSelectedAccount(uuid) {
    const authAcc = ConfigManager.setSelectedAccount(uuid);
    ConfigManager.save();
    // updateSelectedAccount(authAcc);
    validateSelectedAccount();
} 

document.addEventListener('readystatechange', function() {
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        if (!rscShouldLoad) {
            rscShouldLoad = false;
            showMainUI();
        }
    }
}, false);
