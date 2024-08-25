import { createWriteStream, readFileSync } from "node:fs";
import { Events } from "../../interfaces/launcher";
import semver from "semver"
import EventEmitter from "events"
import TypedEmitter from "typed-emitter";
import decompress from "decompress";
import { exec } from "node:child_process";
import path from "path"
import { app } from 'electron';
import { autoUpdater } from 'electron-updater';

class AutoUpdater extends (EventEmitter as new () => TypedEmitter<Events>) {
  constructor() {
    super()
    console.log("[CLIENT SIDE] O AUTOUPDATER FOI INICIALIZADO")
  }

  checkForUpdates() {
    autoUpdater.autoDownload = false;

    autoUpdater.checkForUpdates();
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
      console.log('Update available.');
      this.emit('update-found');
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('Update not available.');
      this.emit('update-notavaliable');
    });

    autoUpdater.on('error', (err) => {
      console.error('Error in auto-updater. ', err);
      this.emit('error', err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      console.log(`Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`);
      this.emit('download-progress', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded');
      this.emit('download-completed');
      this.emit('finished');
      autoUpdater.quitAndInstall();
    });
  }

  downloadNewVersion() {
    this.emit('downloading-zip');
    autoUpdater.downloadUpdate();
  }
}


export {
  AutoUpdater
}

// sim eu fiz isso kkkk, eu não achei nenhum pacote que funcionase 