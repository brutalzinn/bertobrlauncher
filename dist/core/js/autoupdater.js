"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoUpdater = void 0;
const events_1 = __importDefault(require("events"));
const electron_updater_1 = require("electron-updater");
class AutoUpdater extends events_1.default {
    constructor() {
        super();
        console.log("[CLIENT SIDE] O AUTOUPDATER FOI INICIALIZADO");
    }
    checkForUpdates() {
        electron_updater_1.autoUpdater.autoDownload = false;
        electron_updater_1.autoUpdater.checkForUpdates();
        electron_updater_1.autoUpdater.on('checking-for-update', () => {
            console.log('Checking for update...');
        });
        electron_updater_1.autoUpdater.on('update-available', (info) => {
            console.log('Update available.');
            this.emit('update-found');
        });
        electron_updater_1.autoUpdater.on('update-not-available', (info) => {
            console.log('Update not available.');
            this.emit('update-notavaliable');
        });
        electron_updater_1.autoUpdater.on('error', (err) => {
            console.error('Error in auto-updater. ', err);
            this.emit('error', err);
        });
        electron_updater_1.autoUpdater.on('download-progress', (progressObj) => {
            console.log(`Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`);
            this.emit('download-progress', progressObj);
        });
        electron_updater_1.autoUpdater.on('update-downloaded', (info) => {
            console.log('Update downloaded');
            this.emit('download-completed');
            this.emit('finished');
            electron_updater_1.autoUpdater.quitAndInstall();
        });
    }
    downloadNewVersion() {
        this.emit('downloading-zip');
        electron_updater_1.autoUpdater.downloadUpdate();
    }
}
exports.AutoUpdater = AutoUpdater;
// sim eu fiz isso kkkk, eu não achei nenhum pacote que funcionase 
