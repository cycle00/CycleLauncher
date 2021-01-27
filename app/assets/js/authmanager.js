const ConfigManager = require('./configmanager');
const Logger = require('./logger');
const Mojang = require('./mojang');
const logger = Logger('%c[AuthManager]', 'color: #a02d2a; font-weight: bold');
const loggerSuccess = Logger('%c[AuthManager]', 'color: #209b07; font-weight: bold');

exports.addAccount = async function(username, password) {
    try {
        const session = await Mojang.authenticate(username, password, ConfigManager.getClientToken());
        if (session.selectedProfile != null) {
            const ret = ConfigManager.addAuthAccount(session.selectedProfile.id, session.accessToken, username, session.selectedProfile.name);
            if (ConfigManager.getClientToken() == null) {
                ConfigManager.setClientToken(session.clientToken);
            }
            ConfigManager.save();
            return ret;
        } else {
            throw new Error('NotPaidAccount');
        }
    } catch (err) {
        return Promise.reject(err);
    }
}

exports.removeAccount = async function(uuid) {
    try {
        const authAcc = ConfigManager.getAuthAccount(uuid);
        await Mojang.invalidate(authAcc.accessToken, ConfigManager.getClientToken());
        ConfigManager.removeAuthAccount(uuid);
        ConfigManager.save();
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

exports.validateSelected = async function() {
    const current = ConfigManager.getSelectedAccount();
    const isValid = await Mojang.validate(current.accessToken, ConfigManager.getClientToken());
    if (!isValid) {
        try {
            const session = await Mojang.refresh(current.accessToken, ConfigManager.getClientToken());
            ConfigManager.updateAuthAccount(current.uuid, session.accessToken);
            ConfigManager.save();
        } catch (err) {
            logger.debug('Error while validating selected profile:', err);
            logger.log('Account access token is invalid.');
            return false;
        }
        loggerSuccess.log('Account access token validated.');
        return true;
    } else {
        loggerSuccess.log('Account access token validated.');
        return true;
    }
}