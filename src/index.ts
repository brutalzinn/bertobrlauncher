import { app, BrowserWindow, ipcMain, ipcRenderer } from "electron";
import { initIPCHandlers } from "./core/js/ipcHandlers.js";
import { join } from "path";
import dotenv from "dotenv";
import { autoUpdater } from 'electron-updater';

// Load environment variables from a .env file into process.env
dotenv.config();

const pages = join(__dirname, "pages");

async function createWindow() {
  // Create the main browser window
  const win = new BrowserWindow({
    minWidth: 1200,
    minHeight: 700,
    titleBarStyle: "hidden",
    icon: join(__dirname, 'core', 'imgs', 'icons', 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: join(__dirname, 'core', "app.js"),
    },
  });
  win.loadFile(join(pages, "index.html"));
  win.removeMenu();
  initIPCHandlers();
  
  autoUpdater.autoDownload = false;
  autoUpdater.checkForUpdates();
  autoUpdater.on('update-available', () => {
    win.webContents.send('update-found');
    console.log('Update found');
  });

  autoUpdater.on('update-not-available', () => {
    win.webContents.send('update-notavailable');
    console.log('Update not available');
  });

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('download-completed');
    autoUpdater.quitAndInstall();
    console.log('Update downloaded completed');
  });

  autoUpdater.on('error', (error) => {
    win.webContents.send('update-error', error.message);
    console.log('Error during update:', error.message);
  });

  autoUpdater.on('download-progress', (progress) => {
    win.webContents.send('download-progress', progress);
  });

  ipcMain.handle('download-update', () => {
    autoUpdater.downloadUpdate()
  });


  // win.webContents.openDevTools();
  try {
    require('electron-reloader')(module);
  } catch (_) {
    console.error('Failed to set up electron-reloader');
  }


}

app.whenReady().then(() => {
  if (process.platform === "win32") {
    app.setAppUserModelId("BRLauncher");
    console.log(`App version: ${app.getVersion()}`);
  }
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
