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
exports.HomePage = void 0;
const launcher_js_1 = require("./launcher.js");
const launcher_js_2 = __importDefault(require("../../db/launcher.js"));
const electron_1 = require("electron");
const base_js_1 = require("../base.js");
const node_fs_1 = require("node:fs");
const account_js_1 = __importDefault(require("../../db/account.js"));
class HomePage extends base_js_1.PageBase {
    constructor() {
        super({
            pageName: 'home'
        });
        this.canPlay = false;
        console.log("[CLIENT SIDE] A HOME FOI CARREGADA");
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.manageDropdown();
            this.initUpdater();
            const play = document.getElementById('play');
            play.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                yield this.checkPlay();
                if (!this.selectedModpack)
                    return this.notification("Selecione um modpack para jogar.");
                if (!this.canPlay)
                    return this.notification("Você não pode jogar sem criar uma conta, vá para o menu 'Contas' para criar uma.");
                this.startLauncher(this.selectedModpack);
                play.innerHTML = '<span class="material-icons">play_disabled</span> Instalando...';
                play.disabled = true;
            }));
        });
    }
    getInstalledVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            const launcherSettings = yield launcher_js_2.default.config();
            if (!launcherSettings)
                return this.notification("Algo deu errado, tente reiniciar o Launcher com permisões de administrador.");
            let versions = (0, node_fs_1.readdirSync)(`${launcherSettings === null || launcherSettings === void 0 ? void 0 : launcherSettings.path}\\versions`);
        });
    }
    getNeoForgeVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            // not implemented
        });
    }
    getQuiltVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            let quilt = (yield (yield fetch("https://meta.quiltmc.org/v3/versions")).json()).game.filter(v => v.stable).map(v => v.version);
            return quilt;
        });
    }
    getFabricVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            let fabric = (yield (yield fetch("https://meta.fabricmc.net/v2/versions/game")).json()).filter(v => v.stable).map(v => v.version);
            return fabric;
        });
    }
    getVanillaVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            let vanilla = (yield (yield fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")).json()).versions.filter(v => v.type === "release").map(v => v.id);
            return vanilla;
        });
    }
    getForgeVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            let forge = yield (yield fetch("https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json")).json();
            return forge;
        });
    }
    fetchGameData() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://minecraft.robertinho.net/?action=list';
            try {
                const response = yield fetch(url);
                const data = yield response.json();
                return data;
            }
            catch (error) {
                console.error('Error fetching game data:', error);
                return [];
            }
        });
    }
    // private returnOptionElement(type: 'forge' | 'fabric' | 'vanilla' | 'quilt', version: string) {
    //     const div = document.createElement('div')
    //     div.classList.add('flex', 'items-center', 'gap-x-3', 'p-2', 'cursor-pointer', 'border-l-0', 'hover:border-l-4', 'border-blue-500', 'duration-150')
    //     div.innerHTML = `<img src="../core/imgs/${type}.png" width="30">${type} ${version}`
    //     div.addEventListener('click', () => this.setDropdownItem(div.innerHTML.split('>')[1]))
    //     return div
    // }
    returnOptionElementCustomModpack(modpack) {
        const div = document.createElement('div');
        div.classList.add('flex', 'items-center', 'gap-x-3', 'p-2', 'cursor-pointer', 'border-l-0', 'hover:border-l-4', 'border-blue-500', 'duration-150');
        div.innerHTML = `<img src="../core/imgs/${modpack.loader}.png" width="30">${modpack.name} ${modpack.loader}`;
        div.addEventListener('click', () => {
            this.selectModPack(modpack);
        });
        return div;
    }
    selectModPack(modpack) {
        const fake = document.getElementById('fake-select');
        fake.innerHTML = `<img src="../core/imgs/${modpack.loader}.png" width="30">${modpack.name} ${modpack.loader}`;
        this.selectedModpack = modpack;
    }
    manageDropdown() {
        return __awaiter(this, void 0, void 0, function* () {
            // const vanilla = await this.getVanillaVersions()
            // const fabric = await this.getFabricVersions()
            // const forge = await this.getForgeVersions()
            // const quilt = await this.getQuiltVersions()
            // const installed = await this.getInstalledVersions()
            let modpacks = yield this.fetchGameData();
            const options = document.getElementById('options');
            for (let modpack of modpacks) {
                console.log(modpack);
                const optionDiv = this.returnOptionElementCustomModpack(modpack);
                options.appendChild(optionDiv);
                this.selectModPack(modpack);
            }
            // console.log(modpacks)
            // for (let version of vanilla) {
            // const installedDiv = this.returnOptionElement('installed', version)
            // const forgeDiv = this.returnOptionElement('forge', version)
            // const fabricDiv = this.returnOptionElement('fabric', version)
            // const vanillaDiv = this.returnOptionElement('vanilla', version)
            // const quiltDiv = this.returnOptionElement('quilt', version)
            // options.appendChild(vanillaDiv)
            // if (fabric.includes(version)) {
            //     options.appendChild(fabricDiv)
            // }
            // if (Object.keys(forge).includes(version)) {
            //     options.appendChild(forgeDiv)
            // }
            // if (quilt.includes(version)) {
            //     options.appendChild(quiltDiv)
            // }
            // }
        });
    }
    startLauncher(gameData) {
        const launcher = new launcher_js_1.Launcher();
        launcher.init(gameData);
        const barra = document.getElementById('barra');
        launcher.on("progress", (progress, size, element) => {
            const porcentagem = Math.round((progress / size) * 100);
            barra.innerHTML = `Baixando ${element} | ${porcentagem}% | ${(progress / 1000000).toPrecision(2)}/${(size / 1000000).toPrecision(2)} MB`;
            barra.style.width = `${porcentagem}%`;
        });
        launcher.on("check", (progress, size, element) => {
            const porcentagem = Math.round((progress / size) * 100);
            barra.innerHTML = `Checando ${element} | ${porcentagem}% | ${(progress / 1000000).toPrecision(2)}/${(size / 1000000).toPrecision(2)} MB`;
            barra.style.width = `${porcentagem}%`;
        });
        launcher.on("error", (err) => {
            barra.innerHTML = `<span class="text-red-700">${JSON.stringify(err)}</span>`;
            // alert(JSON.stringify(err))
        });
        launcher.on('data', (data) => {
            barra.innerHTML = '<span class="text-lime-700">Iniciando JVM e o Minecraft</span>';
            barra.style.width = '100%';
            if (data.includes("Launching")) {
                barra.innerHTML = '<span class="text-lime-700">Jogo rodando...</span>';
            }
        });
        launcher.on('close', (code) => {
            barra.style.width = '0%';
            const play = document.getElementById('play');
            play.disabled = false;
            play.innerHTML = '<span class="material-icons">play_circle</span> Instalar e Jogar';
        });
    }
    checkPlay() {
        return __awaiter(this, void 0, void 0, function* () {
            const accounts = yield account_js_1.default.accounts();
            this.canPlay = accounts.length !== 0;
        });
    }
    initUpdater() {
        const updater = document.getElementById("updater");
        const no_button = document.getElementById("nupdate");
        const no_button_x = document.getElementById("close-updater");
        const yes_button = document.getElementById("yupdate");
        const barra = document.getElementById('barra');
        electron_1.ipcRenderer.on('update-found', () => {
            console.log('Update found! A new version is available.');
            updater.classList.add('flex');
            updater.classList.remove('hidden');
            console.log('Update encontrado');
        });
        electron_1.ipcRenderer.on('update-notavailable', () => {
            console.log('O launcher já está atualizado.');
            // Inform the user that no updates are available
        });
        electron_1.ipcRenderer.on('download-completed', () => {
            console.log('Download completed. Restarting the application...');
            // Optionally prompt user to restart the app
        });
        electron_1.ipcRenderer.on('update-error', (event, errorMessage) => {
            console.error(`Update error: ${errorMessage}`);
            // Show error message to the user
        });
        electron_1.ipcRenderer.on('download-progress', (event, progress) => {
            barra.innerHTML = `Baixando atualização ${progress.percent}%}`;
            barra.style.width = `${progress.percent}%`;
            console.log(`Download progress: ${progress.percent}%`);
            // Update progress bar or indicator
        });
        no_button.addEventListener("click", (event) => {
            updater.classList.add('hidden');
            updater.classList.remove('flex');
        });
        no_button_x.addEventListener("click", (event) => {
            updater.classList.add('hidden');
            updater.classList.remove('flex');
        });
        yes_button.addEventListener("click", (event) => {
            yes_button.setAttribute('disabled', 'true');
            updater.classList.add('hidden');
            updater.classList.remove('flex');
            electron_1.ipcRenderer.invoke('download-update');
        });
    }
}
exports.HomePage = HomePage;
