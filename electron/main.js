import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Force Single Instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow;

  const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      backgroundColor: '#0f172a', // Slate-900 matches Valhalla theme
      title: 'VALHALLA',
      icon: path.join(__dirname, '../public/favicon.ico'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
      autoHideMenuBar: true, // Cleaner look
      show: false // Don't show until ready
    });

    // Load logic: Distinguish between Dev (localhost) and Prod (local file)
    if (!app.isPackaged && process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
        console.log('Running in Development Mode');
    } else {
        // In production, load the index.html from the dist folder
        const indexPath = path.join(__dirname, '../dist/index.html');
        mainWindow.loadFile(indexPath).catch(err => {
            console.error('Failed to load index.html:', err);
        });
        
        // Uncomment the line below if you need to debug the built EXE (white screen issues)
        // mainWindow.webContents.openDevTools();
    }

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });

    // Open external links in browser, not Electron
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  };

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}