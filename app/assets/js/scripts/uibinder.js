const path = require('path');

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