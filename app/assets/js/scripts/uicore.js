const $ = require('jquery');
const { ipcRenderer, remote, shell, webFrame } = require('electron');
const isDev = require('../isdev');
const logger = require('../logger'); 

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
    ipcRenderer.on('autoUpdateNotification', (arg, info) => {
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
                // TODO: Do stuff here
                
                break;
        }
    });
}