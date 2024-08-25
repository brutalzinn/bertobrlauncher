"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipcHandlers_js_1 = require("./core/js/ipcHandlers.js");
const path_1 = require("path");
const dotenv_1 = __importDefault(require("dotenv"));
const electron_updater_1 = require("electron-updater");
// Load environment variables from a .env file into process.env
dotenv_1.default.config();
const pages = (0, path_1.join)(__dirname, "pages");
function createWindow() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create the main browser window
        const win = new electron_1.BrowserWindow({
            minWidth: 1200,
            minHeight: 700,
            titleBarStyle: "hidden",
            icon: (0, path_1.join)(__dirname, 'core', 'imgs', 'icons', 'icon.ico'),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: (0, path_1.join)(__dirname, 'core', "app.js"),
            },
        });
        win.loadFile((0, path_1.join)(pages, "index.html"));
        win.removeMenu();
        (0, ipcHandlers_js_1.initIPCHandlers)();
        electron_updater_1.autoUpdater.autoDownload = false;
        electron_updater_1.autoUpdater.checkForUpdates();
        electron_updater_1.autoUpdater.on('update-available', () => {
            win.webContents.send('update-found');
            console.log('Update found');
        });
        electron_updater_1.autoUpdater.on('update-not-available', () => {
            win.webContents.send('update-notavailable');
            console.log('Update not available');
        });
        electron_updater_1.autoUpdater.on('update-downloaded', () => {
            win.webContents.send('download-completed');
            electron_updater_1.autoUpdater.quitAndInstall();
            console.log('Update downloaded completed');
        });
        electron_updater_1.autoUpdater.on('error', (error) => {
            win.webContents.send('update-error', error.message);
            console.log('Error during update:', error.message);
        });
        electron_updater_1.autoUpdater.on('download-progress', (progress) => {
            win.webContents.send('download-progress', progress);
        });
        electron_1.ipcMain.handle('download-update', () => {
            electron_updater_1.autoUpdater.downloadUpdate();
        });
        // win.webContents.openDevTools();
        try {
            require('electron-reloader')(module);
        }
        catch (_) {
            console.error('Failed to set up electron-reloader');
        }
    });
}
electron_1.app.whenReady().then(() => {
    if (process.platform === "win32") {
        electron_1.app.setAppUserModelId("BRLauncher");
        console.log(`App version: ${electron_1.app.getVersion()}`);
    }
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
