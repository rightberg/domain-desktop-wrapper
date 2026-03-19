// modules
const { getLangTemplate } = require('./localization.js');
const { app, BrowserWindow, Menu, session, ipcMain, nativeTheme } = require('electron');
const fs = require('fs');
const path = require('path');

let currentUsername = null;

async function logoutUser() {
    app.relaunch();
    app.exit(0);
}

// config
function getConfig() {
    const config_path = path.join(__dirname, 'config', 'settings.json');
    let config = JSON.parse(fs.readFileSync(config_path, 'utf-8'));
    const user_config_path = path.join(app.getPath('userData'), 'settings.override.json');
    if (fs.existsSync(user_config_path)) {
        try {
            let user_config = JSON.parse(fs.readFileSync(user_config_path, 'utf-8'));
            config = { ...config, ...user_config };
        } catch (err) {
            console.error('Error parse settings.override.json: ', err);
        }
    }
    return config;
}

function createWindow(config, ses) {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        icon: path.join(__dirname, 'icons', 'app-main-icon.ico'),
        backgroundColor: '#353535',
        webPreferences: {
            session: ses,
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.webContents.on('did-navigate', (event, url) => {
        if (pendingUsername && url.startsWith(config.mainPage)) {
            currentUsername = pendingUsername;
            pendingUsername = null;
        }
    });

    win.loadURL(config.mainPage);
    nativeTheme.themeSource = config.appTheme ?? 'system';

    win.webContents.on('will-navigate', (event, url) => {
        if (config.urlWhiteList.every(pattern => !url.startsWith(pattern)))
            event.preventDefault();
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith(config.mainPage))
            return { action: 'allow' };
        return { action: 'deny' };
    });

    win.on('closed', () => {
        app.quit();
    });

    return win;
}

app.commandLine.appendSwitch('disable-features', 'WinHttpAuth');

let authSession;
let pendingUsername = null;

// auth window
async function setupAuthSession() {
    const ses = session.fromPartition('persist:auth');
    // disable 400 error to use ru productName
    ses.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
    
    authSession = ses;

    app.on('login', (event, webContents, request, authInfo, callback) => {
        event.preventDefault();

        const loginWin = new BrowserWindow({
            width: 400,
            height: 300,
            resizable: false,
            icon: path.join(__dirname, 'icons', 'app-main-icon.ico'),
            backgroundColor: '#353535',
            autoHideMenuBar: true,

            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        loginWin.loadFile(path.join(__dirname, 'login.html'));

        let isLoggingIn = false;

        const loginHandler = (event, credentials) => {
            pendingUsername = String(credentials.username);
            isLoggingIn = true;

            ipcMain.removeListener('login-submit', loginHandler);
            callback(credentials.username, credentials.password);

            if (!loginWin.isDestroyed()) loginWin.close();
        };

        ipcMain.on('login-submit', loginHandler);

        loginWin.on('closed', () => {
            ipcMain.removeListener('login-submit', loginHandler);
            if (!isLoggingIn) {
                callback();
                app.quit();
            }
        });
    });

    return ses;
}

app.commandLine.appendSwitch('auth-server-whitelist', 'false');
app.commandLine.appendSwitch('auth-negotiate-delegate-whitelist', 'false');
app.commandLine.appendSwitch('disable-ntlm');

app.whenReady().then(async () => {
    const config = getConfig();

    const lang = 'ru';
    const template = getLangTemplate(lang, logoutUser);
    const menu = Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(menu);

    await setupAuthSession();

    createWindow(config, authSession);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow(config, authSession);
    });
});