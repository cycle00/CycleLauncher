const $ = require('jquery');
const { ipcRenderer, remote, shell, webFrame } = require('electron');
const isDev = require('./assets/js/isdev');
const logger = require('./assets/js/logger');

const loggerUICore = logger('%c[UICore]', 'color: #000668; font-weight: bold');
const loggerAutoUpdater = logger('%c[AutoUpdater]', 'color: #000668; font-weight: bold');
const loggerAutoUpdaterSuccess = logger('%c[AutoUpdater]', 'color: #209b07; font-weight: bold');

process.traceProcessWarnings = true;
process.traceDeprecation = true;

window.eval = global.eval = function () {
    throw new Error("Sorry, this app does not support window.eval().");
}

remote.getCurrentWebContents().on('devtools-opened', () => {
    console.log("%cThe console is dark and full of terrors.", 'color: white; -webkit-text-stroke: 4px #a02d2a; font-size: 60px; font-weight: bold');
    console.log("%cIf you\'ve been told to paste something here, you\'re being scammed.", 'font-size: 16px');
    console.log("%cUnless you know exactly what you\'re doing, close this window.", 'font-size: 16px');
});

webFrame.setZoomLevel(0);
webFrame.setVisualZoomLevelLimits(1, 1);

let updateCheckListener;
if (!isDev) {
    ipcRenderer.on('autoUpdateNotification', (_event, arg, info) => {
        switch (arg) {
            case 'checking-for-update':
                loggerAutoUpdater.log("Checking for update...");
                // settingsUpdateButtonStatus("Checking for Updates...", true);
                break;
            
            case 'update-available':
                loggerAutoUpdaterSuccess.log("New update available", info.version);

                if (process.platform === 'darwin') {
                    // info.darwindownload = `https://github.com/Cycle00/CycleLauncher/releases/download/v${info.version}/cyclelauncher_setup_${info.version}.dmg`;
                    showUpdateUI(info);
                }

                // populateSettingsUpdateInformation(info);
                break;
            
            case 'update-downloaded':
                loggerAutoUpdaterSuccess.log("Update " + info.version + " is ready to be installed.");

                /*
                settingsUpdateButtonStatus('Install Now', false, () => {
                    if (!isDev) {
                        ipcRenderer.send('autoUpdateAction', 'installUpdateNow');
                    }
                });
                */
                showUpdateUI(info);
                break;
            
            case 'update-not-available':
                loggerAutoUpdater.log("No new update found.");
                // settingsUpdateButtonStatus('Check for Updates');
                break;

            case 'ready':
                updateCheckListener = setInterval(() => {
                    ipcRenderer.send('autoUpdateAction', 'checkForUpdate');
                }, 1800000);
                ipcRenderer.send('autoUpdateAction', 'checkForUpdate');
                break;

            case 'realerror':
                if (info != null && info.code != null) {
                    if (info.code === 'ERR_UPDATER_INVALID_RELEASE_FEED') {
                        loggerAutoUpdater.log('No suitable releases found.');
                    } else if (info.code === 'ERR_XML_MISSED_ELEMENT') {
                        loggerAutoUpdater.log('No releases found.');
                    } else {
                        loggerAutoUpdater.error('Error during update check...', info);
                        loggerAutoUpdater.debug('Error Code:', info.code);
                    }
                }
                break;
            
            default:
                loggerAutoUpdater.log('Unknown argument', arg)
                break;
        }
    });
}

function changeAllowPrerelease(val) {
    ipcRenderer.send('autoUpdateAction', 'allowPrereleaseChange', val);
}

function showUpdateUI(info) {
    document.getElementById('minecraft_logo_container').setAttribute('update', true);
    document.getElementById('minecraft_logo_container').onclick = () => {

        switchView(getCurrentView(), VIEWS.settings, 500, 500, () => {
            settingsNavItemListener(document.getElementById('settingsNavUpdate'), false);
        }); 
    };
}

document.addEventListener('readystatechange', function () {
    if (document.readyState === 'interactive') {
        loggerUICore.log('UICore Initializing...');

        Array.from(document.getElementsByClassName('fCb')).map((val) => {
            val.addEventListener('click', e => {
                const window = remote.getCurrentWindow();
                window.close();
            });
        });

        Array.from(document.getElementsByClassName('fRb')).map((val) => {
            val.addEventListener('click', e => {
                const window = remote.getCurrentWindow();
                if(window.isMaximized()){
                    window.unmaximize();
                } else {
                    window.maximize();
                }
                document.activeElement.blur();
            });
        });

        Array.from(document.getElementsByClassName('fMb')).map((val) => {
            val.addEventListener('click', e => {
                const window = remote.getCurrentWindow();
                window.minimize();
                document.activeElement.blur();
            });
        });
    } else if (document.readyState === 'complete') {
        /*
        document.getElementById('launch_details').style.maxWidth = 266.01;
        document.getElementById('launch_progress').style.width = 170.8;
        document.getElementById('launch_details_right').style.maxWidth = 170.8;
        document.getElementById('launch_progress_label').style.width = 53.21;
        */
    }
}, false)

$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});

document.addEventListener('keydown', function (e) {
    if ((e.key === 'I' || e.key === 'i') && e.ctrlKey && e.shiftKey) {
        let window = remote.getCurrentWindow();
        window.toggleDevTools();
    }
});