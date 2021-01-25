const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const logger = require('./logger')('%c[ConfigManager]', 'color: #a02d2a; font-weight: bold');

const sysRoot = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME);
const dataPath = path.join(sysRoot, '.cyclelauncher');

const launcherDir = process.env.CONFIG_DIRECT_PATH || require('electron').remote.app.getPath('userData');

exports.getLauncherDirectory = function() {
    return launcherDir;
}

exports.getDataDirectory = function (def = false) {
    return !def ? config.settings.launcher.dataDirectory : DEFAULT_CONFIG.settings.launcher.dataDirectory;
}

exports.setDataDirectory = function(dataDirectory) {
    config.settings.launcher.dataDirectory = dataDirectory;
}

const configPath = path.join(exports.getLauncherDirectory(), 'config.json');
const firstLaunch = !fs.existsSync(configPath);

exports.getAbsoluteMaxRAM = function() {
    const mem = os.totalmem();
    const gT16 = mem - 16000000000;
    return Math.floor((mem - 1000000000 - (gT16 > 0 ? (Number.parseInt(gT16 / 8) + 16000000000 / 4) : mem / 4)) / 1000000000);
}

exports.getAbsoluteMinRam = function() {
    const mem = os.totalmem();
    return mem >= 6000000000 ? 3 : 2;
}

function resolveMaxRAM() {
    const mem = os.totalmem();
    return mem >= 8000000000 ? '4G' : (mem >= 6000000000 ? '3G' : '2G');
}

function resolveMinRAM() {
    return resolveMaxRAM();
}

const DEFAULT_CONFIG = {
    settings: {
        java: {
            minRAM: resolveMinRAM(),
            maxRAM: resolveMaxRAM(),
            executable: null,
            jvmOptions: [
                '-XX:+UseConcMarkSweepGC',
                '-XX:+CMSIncrementalMode',
                '-XX:-UseAdaptiveSizePolicy',
                '-Xmn128M'
            ]
        },
        game: {
            resWidth: 1280,
            resHeight: 720,
            fullscreen: false,
            launchDetached: true
        },
        launcher: {
            allowPrereleases: false,
            dataDirectory: dataPath
        }
    },
    clientToken: null,
    selectedAccount: null,
    authenticationDatabase: {}
}

let config = null;

exports.save = function() {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'UTF-8');
}

exports.load = function() {
    let doLoad = true;

    if (!fs.existsSync(configPath)) {
        fs.ensureDirSync(path.join(configPath, '..'));
        doLoad = false;
        config = DEFAULT_CONFIG;
        exports.save();
    }
    if (doLoad) {
        let doValidate = false;
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
            doValidate = true;
        } catch (err) {
            logger.error(err);
            logger.log('Configuration file contains malformed JSON or is corrupt.');
            logger.log('Generating a new configuration file.');
            fs.ensureDirSync(path.join(configPath, 'UTF-8'));
            config = DEFAULT_CONFIG;
            exports.save();
        }
        if (doValidate) {
            config = validateKeySet(DEFAULT_CONFIG, config)
            exports.save();
        }
    }

    logger.log('Successfully Loaded');
}

exports.isLoaded = function() {
    return config != null;
}

function validateKeySet(srcObj, destObj) {
    if (srcObj == null) {
        srcObj = {};
    }

    const validationBlacklist = ['authenticationDatabase'];
    const keys = Object.keys(srcObj);
    for (let i = 0; i < keys.length; i++) {
        if (typeof destObj[keys[i]] === 'undefined') {
            destObj[keys[i]] = srcObj[keys[i]];
        } else if (typeof srcObj[keys[i]] === 'object' && srcObj[keys[i]] != null && !(srcObj[keys[i]] instanceof Array) && validationBlacklist.indexOf(keys[i]) === -1) {
            destObj[keys[i]] = validateKeySet(srcObj[keys[i]], destObj[keys[i]]);
        }
    }

    return destObj;
}

exports.isFirstLaunch = function() {
    return firstLaunch;
}

exports.getTempNativeFolder = function() {
    return 'MCNatives';
}

/*
exports.getNewsCache = function() {
    return config.newsCache
}

exports.setNewsCache = function(newsCache) {
    config.newsCache = newsCache;
}

exports.setNewsCacheDismissed = function(dismissed) {
    config.newsCache.dismissed = dismissed;
}
*/

exports.getCommonDirectory = function() {
    return path.join(exports.getDataDirectory(), 'common');
}

exports.getInstanceDirectory = function() {
    return path.join(exports.getDataDirectory(), 'instances');
}

exports.getClientToken = function() {
    return config.clientToken;
}

exports.setClientToken = function(clientToken) {
    config.clientToken = clientToken;
}

exports.getAuthAccounts = function() {
    return config.authenticationDatabase;
}

exports.getAuthAccount = function(uuid) {
    return config.authenticationDatabase[uuid];
}

exports.updateAuthAccount = function(uuid, accessToken) {
    config.authenticationDatabase[uuid].accessToken = accessToken;
    return config.authenticationDatabase;
}

exports.addAuthAccount = function(uuid, accessToken, username, displayName) {
    config.selectedAccount = uuid;
    config.authenticationDatabase[uuid] = {
        accessToken,
        username: username.trim(),
        uuid: uuid.trim(),
        displayName: displayName.trim()
    }
    return config.authenticationDatabase[uuid];
}

exports.removeAuthAccount = function(uuid) {
    if (config.authenticationDatabase[uuid] != null) {
        delete config.authenticationDatabase[uuid];
        if (config.selectedAccount === uuid) {
            const keys = Object.keys(config.authenticationDatabase);
            if (keys.length > 0) {
                config.selectedAccount = keys[0];
            } else {
                config.selectedAccount = null;
                config.clientToken = null;
            }
        }
        return true;
    }
    return false;
}

exports.getSelectedAccount = function() {
    return config.authenticationDatabase[config.selectedAccount];
}

exports.setSelectedAccount = function(uuid) {
    const authAcc = config.authenticationDatabase[uuid];
    if (authAcc != null) {
        config.selectedAccount = uuid;
    }
    return authAcc;
}

exports.getMinRAM = function(def = false) {
    return !def ? config.settings.java.minRAM : DEFAULT_CONFIG.settings.java.minRAM;
}

exports.setMinRAM = function(minRAM) {
    config.settings.java.minRAM = minRAM;
}

exports.getMaxRAM = function(def = false) {
    return !def ? config.settings.java.maxRAM : DEFAULT_CONFIG.settings.java.maxRAM;
}

exports.setMaxRAM = function(maxRAM) {
    config.settings.java.maxRAM = maxRAM;
}

exports.getJavaExecutable = function() {
    return config.settings.java.executable;
}

exports.setJavaExecutable = function(executable) {
    config.settings.java.executable = executable;
}

exports.getJVMOptions = function(def = false) {
    return !def ? config.settings.java.jvmOptions : DEFAULT_CONFIG.settings.java.jvmOptions;
}

exports.setJVMOptions = function(jvmOptions) {
    config.settings.java.jvmOptions = jvmOptions;
}

exports.getGameWidth = function(def = false){
    return !def ? config.settings.game.resWidth : DEFAULT_CONFIG.settings.game.resWidth
}

exports.setGameWidth = function(resWidth){
    config.settings.game.resWidth = Number.parseInt(resWidth)
}

exports.validateGameWidth = function(resWidth){
    const nVal = Number.parseInt(resWidth)
    return Number.isInteger(nVal) && nVal >= 0
}

exports.getGameHeight = function(def = false){
    return !def ? config.settings.game.resHeight : DEFAULT_CONFIG.settings.game.resHeight
}

exports.setGameHeight = function(resHeight){
    config.settings.game.resHeight = Number.parseInt(resHeight)
}

exports.validateGameHeight = function(resHeight){
    const nVal = Number.parseInt(resHeight)
    return Number.isInteger(nVal) && nVal >= 0
}

exports.getFullscreen = function(def = false) {
    return !def ? config.settings.game.fullscreen : DEFAULT_CONFIG.settings.game.fullscreen;
}

exports.setFullscreen = function(fullscreen) {
    config.settings.game.fullscreen = fullscreen;
}

exports.getLaunchDetached = function(def = false) {
    return !def ? config.settings.game.launchDetached : DEFAULT_CONFIG.settings.game.launchDetached;
}

exports.setLaunchDetached = function(launchDetached) {
    config.settings.game.launchDetached = launchDetached;
}

exports.getAllowPrerelease = function(def = false) {
    return !def ? config.settings.launcher.allowPrereleases : DEFAULT_CONFIG.settings.launcher.allowPrereleases;
}

exports.setAllowPrerelease = function(allowPrerelease) {
    config.settings.launcher.allowPrerelease = allowPrerelease;
}