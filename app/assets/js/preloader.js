const { ipcRenderer } = require('electron');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const ConfigManager = require('./configmanager');
const LangLoader = require('./langloader');
const logger = require('./logger')('%c[Preloader]', 'color: #a02d2a; font-weight: bold');

logger.log('Loading...');

ConfigManager.load();
if (ConfigManager.isFirstLaunch) {
    ConfigManager.save();
}

LangLoader.loadLanguage('en_US');

fs.remove(path.join(os.tmpdir(), ConfigManager.getTempNativeFolder()), (err) => {
    if (err) {
        logger.warn('Error while cleaning natives directory', err);
    } else {
        logger.log('Cleaned natives directory.')
    }
});