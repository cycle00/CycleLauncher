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
        backgroundColor: '#171614'
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'app', 'app.ejs'),
        protocol: 'file:',
        slashes: true
    }));
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