const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      sandbox: true
    },
  });

  // Load the React app:
  // - In development, load from localhost:3000 and keep retrying
  // - In production, load the built index.html
  const loadApp = () => {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      const reactUrl = 'http://localhost:3000';
      const tryLoad = () => {
        mainWindow.loadURL(reactUrl)
          .catch(() => {
            console.log('Failed to load React dev server, retrying in 1 second...');
            setTimeout(tryLoad, 1000);
          });
      };
      tryLoad();
    } else {
      const indexPath = path.join(__dirname, '../renderer/build/index.html');
      mainWindow.loadFile(indexPath);
    }
  };
  
  loadApp();

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// Set a clean user agent (useful for sites blocking Electron)
app.userAgentFallback = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

// IPC handlers
ipcMain.on('toMain', (event, message) => {
  console.log('Message from renderer:', message);
  // You can send a response back
  mainWindow.webContents.send('fromMain', 'Message received!');
});

// Handle external links
ipcMain.on('openExternal', (event, url) => {
  shell.openExternal(url);
});

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

