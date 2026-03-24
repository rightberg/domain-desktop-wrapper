// modules
const { getLangTemplate } = require('./localization.js');
const { app, BrowserWindow, Menu, session, ipcMain, nativeTheme } = require('electron');
const path = require('path');

let currentUsername = null;

async function logoutUser() {
    app.relaunch();
    app.exit(0);
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

// clean session (disable SSO)
app.commandLine.appendSwitch('auth-server-whitelist', 'false');
app.commandLine.appendSwitch('auth-negotiate-delegate-whitelist', 'false');
app.commandLine.appendSwitch('disable-ntlm');

// access on net resources
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-sandbox');

// optional
// off http cache
// app.commandLine.appendSwitch('disable-http-cache');

// use hardcode config
app.whenReady().then(async () => {
    const config = {
        appTheme: "system",
        mainPage: "http://domain-address/to",
        urlWhiteList: ["http://", "https://"]
    };

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