import Electron, { BrowserWindow, Tray } from 'electron';
import path from 'path';
import Server from './api/server';

let window: Electron.BrowserWindow | null = null;
let tray: Electron.Tray | null = null;

let server: Server;

Electron.app.on('ready', () => {
    console.log('setting up');

    server = new Server(Electron.app);
    server.run(8080);

    window = openWindow(() => window = null);
    if (!tray) tray = createTray(showWindow, () => Electron.app.quit());
});

Electron.app.on('window-all-closed', () => {
    console.log('hiding window to tray');
});

Electron.app.on('will-quit', () => {
    console.log('shutting down');
    server.close();
});

function showWindow() {
    if (window) window.focus();
    else window = openWindow(() => window = null);
}

function openWindow(onClose: () => void): BrowserWindow {
    const window = new BrowserWindow({ width: 800, height: 600 });
    window.loadURL('data:text/html;charset=utf-8,<h1>Hello World!</h1>')
        .then(() => { })
        .catch(error => console.error(error));
    window.on('close', onClose);
    return window;
}

function createTray(showWindow: () => void, quit: () => void): Electron.Tray {
    const icon = Electron.app.isPackaged
        ? path.join(__dirname, './../app.asar/public/assets/icon.ico')
        : path.join(__dirname, './../public/assets/icon.ico');
    const trayIcon = Electron.nativeImage.createFromPath(icon);
    const tray = new Tray(trayIcon.resize({ width: 16 }));
    tray.setContextMenu(Electron.Menu.buildFromTemplate([
        { label: 'Dashboard', click: showWindow },
        { label: 'Quit Phoster', click: quit }
    ]));
    tray.setIgnoreDoubleClickEvents(true);
    tray.on('click', showWindow);
    return tray;
}