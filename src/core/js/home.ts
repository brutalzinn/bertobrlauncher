import axios from "axios"
import { Launcher } from "./launcher.js"
import LauncherDB from "../../db/launcher.js";
import { FabricAPI, MineAPI, QuiltAPI, GameData } from "../../interfaces/launcher.js"
import { AutoUpdater } from "./autoupdater.js"
import { ipcRenderer, ipcMain } from "electron"
import { PageBase } from "../base.js"
import { Storage } from "./storage"
import { readdirSync, readFileSync, existsSync } from "node:fs"
import account from "../../db/account.js";
import { autoUpdater, ProgressInfo } from 'electron-updater';



class HomePage extends PageBase {
    private selectedModpack?: GameData
    private canPlay: boolean = false;
    constructor() {
        super({
            pageName: 'home'
        })
        console.log("[CLIENT SIDE] A HOME FOI CARREGADA")
    }

    async init() {
        await this.manageDropdown()
        this.initUpdater()
        const play = document.getElementById('play') as HTMLButtonElement
        play.addEventListener('click', async () => {
            await this.checkPlay()
            if (!this.selectedModpack) return this.notification("Selecione um modpack para jogar.")
            if (!this.canPlay) return this.notification("Você não pode jogar sem criar uma conta, vá para o menu 'Contas' para criar uma.")
            this.startLauncher(this.selectedModpack)
            play.innerHTML = '<span class="material-icons">play_disabled</span> Instalando...'
            // play.disabled = true
        })
    }

    private async getInstalledVersions() {
        const launcherSettings = await LauncherDB.config()
        if (!launcherSettings) return this.notification("Algo deu errado, tente reiniciar o Launcher com permisões de administrador.")
        let versions = readdirSync(`${launcherSettings?.path}\\versions`)

    }

    private async getNeoForgeVersions() {
        // not implemented
    }

    private async getQuiltVersions() {
        let quilt = (await (await fetch("https://meta.quiltmc.org/v3/versions")).json() as QuiltAPI).game.filter(v => v.stable).map(v => v.version)
        return quilt
    }

    private async getFabricVersions() {
        let fabric = (await (await fetch("https://meta.fabricmc.net/v2/versions/game")).json() as FabricAPI[]).filter(v => v.stable).map(v => v.version)
        return fabric
    }

    private async getVanillaVersions() {
        let vanilla = (await (await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")).json() as MineAPI).versions.filter(v => v.type === "release").map(v => v.id)
        return vanilla
    }

    private async getForgeVersions() {
        let forge = (await (await fetch("https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json")).json() as Object)
        return forge
    }

    private async fetchGameData(): Promise<GameData[]> {
        const url = 'https://mineparty.localto.net/api/modpacks/list';
        try {
            const response = await fetch(url);
            const data: GameData[] = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching game data:', error);
            return [];
        }
    }

    // private returnOptionElement(type: 'forge' | 'fabric' | 'vanilla' | 'quilt', version: string) {
    //     const div = document.createElement('div')
    //     div.classList.add('flex', 'items-center', 'gap-x-3', 'p-2', 'cursor-pointer', 'border-l-0', 'hover:border-l-4', 'border-blue-500', 'duration-150')
    //     div.innerHTML = `<img src="../core/imgs/${type}.png" width="30">${type} ${version}`
    //     div.addEventListener('click', () => this.setDropdownItem(div.innerHTML.split('>')[1]))
    //     return div
    // }

    private returnOptionElementCustomModpack(modpack: GameData) {
        const div = document.createElement('div')
        div.classList.add('flex', 'items-center', 'gap-x-3', 'p-2', 'cursor-pointer', 'border-l-0', 'hover:border-l-4', 'border-blue-500', 'duration-150')
        div.innerHTML = `<img src="../core/imgs/${modpack.loader}.png" width="30">${modpack.name} ${modpack.loader}`
        div.addEventListener('click', () => {
            this.selectModPack(modpack)
        })
        return div
    }

    private selectModPack(modpack: GameData) {
        const fake = document.getElementById('fake-select') as HTMLElement
        fake.innerHTML = `<img src="../core/imgs/${modpack.loader}.png" width="30">${modpack.name}`
        this.selectedModpack = modpack
    }

    async manageDropdown() {
        // const vanilla = await this.getVanillaVersions()
        // const fabric = await this.getFabricVersions()
        // const forge = await this.getForgeVersions()
        // const quilt = await this.getQuiltVersions()
        // const installed = await this.getInstalledVersions()

        let modpacks = await this.fetchGameData()
        const options = document.getElementById('options') as HTMLElement
        for (let modpack of modpacks) {
            console.log(modpack)
            const optionDiv = this.returnOptionElementCustomModpack(modpack)
            options.appendChild(optionDiv)
            this.selectModPack(modpack)
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
    }

    startLauncher(gameData: GameData) {
        const launcher = new Launcher()
        launcher.init(gameData)
        const barra = document.getElementById('barra') as HTMLElement
        launcher.on("progress", (progress: any, size: any, element: any) => {
            const porcentagem = Math.round((progress / size) * 100)
            barra.innerHTML = `Baixando ${element} | ${porcentagem}% | ${(progress / 1000000).toPrecision(2)}/${(size / 1000000).toPrecision(2)} MB`
            barra.style.width = `${porcentagem}%`
        })

        launcher.on("check", (progress: any, size: any, element: any) => {
            const porcentagem = Math.round((progress / size) * 100)
            barra.innerHTML = `Checando ${element} | ${porcentagem}% | ${(progress / 1000000).toPrecision(2)}/${(size / 1000000).toPrecision(2)} MB`
            barra.style.width = `${porcentagem}%`
        })

        launcher.on("error", (err: any) => {
            barra.innerHTML = `<span class="text-red-700">${JSON.stringify(err)}</span>`
            // alert(JSON.stringify(err))
        })

        launcher.on('data', (data: any) => {
            barra.innerHTML = '<span class="text-lime-700">Iniciando JVM e o Minecraft</span>'
            barra.style.width = '100%'
            if (data.includes("Launching")) {
                barra.innerHTML = '<span class="text-lime-700">Jogo rodando...</span>'
            }
        })

        launcher.on('close', (code: number) => {
            barra.style.width = '0%'
            const play = document.getElementById('play') as HTMLButtonElement
            play.disabled = false
            play.innerHTML = '<span class="material-icons">play_circle</span> Instalar e Jogar'
        })
    }

    async checkPlay() {
        const accounts = await account.accounts()
        this.canPlay = accounts.length !== 0
    }

    initUpdater() {



        const updater = document.getElementById("updater") as HTMLDivElement
        const no_button = document.getElementById("nupdate") as HTMLButtonElement
        const no_button_x = document.getElementById("close-updater") as HTMLButtonElement
        const yes_button = document.getElementById("yupdate") as HTMLButtonElement
        const barra = document.getElementById('barra') as HTMLElement

        ipcRenderer.on('update-found', () => {
            console.log('Update found! A new version is available.');
            updater.classList.add('flex')
            updater.classList.remove('hidden')
            console.log('Update encontrado')
        });

        ipcRenderer.on('update-notavailable', () => {
            console.log('O launcher já está atualizado.')
        });

        ipcRenderer.on('download-completed', () => {
            console.log('Download completed. Restarting the application...');
            barra.innerHTML = '<span class="text-lime-700">Download completo. Reiniciando launcher...</span>'
        });

        ipcRenderer.on('update-error', (event, errorMessage) => {
            console.error(`Update error: ${errorMessage}`);
            // Show error message to the user
        });

        ipcRenderer.on('download-progress', (event, progress: ProgressInfo) => {
            barra.innerHTML = `Baixando atualização ${progress.percent}%}`
            barra.style.width = `${progress.percent}%`
            console.log(`Download progress: ${progress.percent}%`);
        });

        no_button.addEventListener("click", (event) => {
            updater.classList.add('hidden')
            updater.classList.remove('flex')
        })

        no_button_x.addEventListener("click", (event) => {
            updater.classList.add('hidden')
            updater.classList.remove('flex')
        })

        yes_button.addEventListener("click", (event) => {
            yes_button.setAttribute('disabled', 'true')
            updater.classList.add('hidden')
            updater.classList.remove('flex')
            ipcRenderer.invoke('download-update')
        })
    }
}

export {
    HomePage
}