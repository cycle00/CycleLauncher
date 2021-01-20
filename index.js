const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const autoUpdater = require('electron-updater').autoUpdater;
const ejse = require('ejs-electron');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const url = require('url');

// TODO: AUTOUPDATER

// TODO: FINISH AUTOUPDATER

app.disableHardwareAcceleration();
app.allowRendererProcessReuse = true;

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 980,
        height: 550,
        //icon: getPlatformIcon('Logo'),
        frame: false,
        // preloader shit
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            worldSafeExecuteJavaScript: true
        },
        backgroundColor: '#171614'
    });

    // TODO: background image selector with ejse

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'app', 'app.ejs'),
        protocol: 'file:',
        slashes: true
    }));

    win.removeMenu();
    win.resizable = true;
    win.on('closed', () => {
        win = null;
    });
}

function createMenu() {
    if (process.platform === 'darwin') {

        // Extend default included application menu to continue support for quit keyboard shortcut
        let applicationSubMenu = {
            label: 'Application',
            submenu: [{
                label: 'About',
                selector: 'orderFrontStandardAboutPanel:'
            }, {
                type: 'separator'
            }, {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: () => {
                    app.quit();
                }
            }]
        }

        // New edit submenu lets you do text editing shortcuts
        let editSubMenu = {
            label: 'Edit',
            submenu: [{
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                selector: 'undo:'
            }, {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                selector: 'redo:'
            }, {
                type: 'separator'
            }, {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                selector: 'cut:'
            }, {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                selector: 'copy:'
            }, {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                selector: 'Paste:'
            }, {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                selector: 'selectAll:'
            }]
        }

        // 
        let menuTemplate = [applicationSubMenu, editSubMenu];
        let menuObject = Menu.buildFromTemplate(menuTemplate);

        // Assign it to the app
        Menu.setApplicationMenu(menuObject);
    }
}

function getPlatformIcon(filename) {
    let ext;
    switch (process.platform) {
        case 'win32':
            ext = 'ico';
            break;
        case 'darwin':
        case 'linux':
        default:
            ext = 'png';
            break;
    }

    return path.join(__dirname, 'app', 'assets', 'images', `${filename}.${ext}`);
}

app.on('ready', createWindow);
app.on('ready', createMenu);

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})