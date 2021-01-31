function isOverlayVisible() {
    return document.getElementById('main').hasAttribute('overlay');
}

let overlayHandleContent;

function overlayKeyHandler(e) {
    if (e.key === 'Enter' || e.key === 'Escape') {
        document.getElementById(overlayHandleContent).getElementsByClassName('overlayKeybindEnter')[0].click();
    }
}

function overlayKeyDismissableHandler (e){
    if(e.key === 'Enter'){
        document.getElementById(overlayHandlerContent).getElementsByClassName('overlayKeybindEnter')[0].click()
    } else if(e.key === 'Escape'){
        document.getElementById(overlayHandlerContent).getElementsByClassName('overlayKeybindEsc')[0].click()
    }
}

function bindOverlayKeys(state, content, dismissable) {
    overlayHandleContent = content;
    document.removeEventListener('keydown', overlayKeyHandler);
    document.removeEventListener('keydown', overlayKeyDismissableHandler);
    if (state) {
        if (dismissable) {
            document.addEventListener('keydown', overlayKeyDismissableHandler);
        } else {
            document.addEventListener('keydown', overlayKeyHandler);
        }
    }
}

function toggleOverlay(toggleState, dismissable = false, content = 'overlayContent') {
    if (toggleState == null) {
        toggleState = !document.getElementById('main').hasAttribute('overlay');
    }
    if (typeof dismissable == 'string') {
        content = dismissable;
        dismissable = false;
    }
    bindOverlayKeys(toggleState, content, dismissable);
    if (toggleState) {
        document.getElementById('main').setAttribute('overlay', true);
        $('#main *').attr('tabindex', '-1');
        $('#' + content).parent().children().hide();
        $('#' + content).show();
        if (dismissable) {
            $('#overlayDismiss').show();
        } else {
            $('#overlayDismiss').hide();
        }
        $('#overlayContainer').fadeIn({
            duration: 250,
            start: () => {
                if (getCurrentView() === VIEWS.settings) {
                    document.getElementById('settingsContainer').style.backgroundColor = 'transparent';
                }
            }
        });
    } else {
        document.getElementById('main').removeAttribute('overlay');
        $('#main *').removeAttr('tabindex');
        $('#overlayContainer').fadeOut({
            duration: 250,
            start: () => {
                if (getCurrentView() === VIEWS.settings) {
                    document.getElementById('settingsContainer').style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                }
            },
            complete: () => {
                $('#' + content).parent().children().hide();
                $('#' + content).show();
                if (dismissable) {
                    $('#overlayDismiss').show();
                } else {
                    $('#overlayDismiss').hide();
                }
            }
        });
    }
}

function setOverlayContent(title, description, acknowledge, dismiss = 'Dismiss'){
    document.getElementById('overlayTitle').innerHTML = title;
    document.getElementById('overlayDesc').innerHTML = description;
    document.getElementById('overlayAcknowledge').innerHTML = acknowledge;
    document.getElementById('overlayDismiss').innerHTML = dismiss;
}

function setOverlayHandler(handler){
    if(handler == null){
        document.getElementById('overlayAcknowledge').onclick = () => {
            toggleOverlay(false);
        }
    } else {
        document.getElementById('overlayAcknowledge').onclick = handler;
    }
}

function setDismissHandler(handler){
    if(handler == null){
        document.getElementById('overlayDismiss').onclick = () => {
            toggleOverlay(false);
        }
    } else {
        document.getElementById('overlayDismiss').onclick = handler;
    }
}

document.getElementById('accountSelectConfirm').addEventListener('click', () => {
    const listings = document.getElementsByClassName('accountListing');
    for(let i=0; i<listings.length; i++){
        if(listings[i].hasAttribute('selected')){
            const authAcc = ConfigManager.setSelectedAccount(listings[i].getAttribute('uuid'));
            ConfigManager.save();
            updateSelectedAccount(authAcc);
            toggleOverlay(false);
            validateSelectedAccount();
            return;
        }
    }
    // None are selected? Not possible right? Meh, handle it.
    if(listings.length > 0){
        const authAcc = ConfigManager.setSelectedAccount(listings[0].getAttribute('uuid'));
        ConfigManager.save();
        updateSelectedAccount(authAcc);
        toggleOverlay(false);
        validateSelectedAccount();
    }
});

document.getElementById('accountSelectCancel').addEventListener('click', () => {
    $('#accountSelectContent').fadeOut(250, () => {
        $('#overlayContent').fadeIn(250)
    })
})

function setAccountListingHandlers(){
    const listings = Array.from(document.getElementsByClassName('accountListing'));
    listings.map((val) => {
        val.onclick = e => {
            if(val.hasAttribute('selected')){
                return;
            }
            const cListings = document.getElementsByClassName('accountListing');
            for(let i=0; i<cListings.length; i++){
                if(cListings[i].hasAttribute('selected')){
                    cListings[i].removeAttribute('selected');
                }
            }
            val.setAttribute('selected', '');
            document.activeElement.blur();
        }
    })
}

function populateAccountListings(){
    const accountsObj = ConfigManager.getAuthAccounts();
    const accounts = Array.from(Object.keys(accountsObj), v=>accountsObj[v]);
    let htmlString = '';
    for(let i=0; i<accounts.length; i++){
        htmlString += `<button class="accountListing" uuid="${accounts[i].uuid}" ${i===0 ? 'selected' : ''}>
            <img src="https://crafatar.com/renders/head/${accounts[i].uuid}?scale=2&default=MHF_Steve&overlay">
            <div class="accountListingName">${accounts[i].displayName}</div>
        </button>`;
    }
    document.getElementById('accountSelectListScrollable').innerHTML = htmlString;

}

function prepareAccountSelectionList(){
    populateAccountListings();
    setAccountListingHandlers();
}