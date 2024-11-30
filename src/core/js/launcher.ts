import { GameData } from './../../interfaces/launcher';
const { Mojang, Launch } = require('minecraft-java-core');
import LauncherSettings from "../../db/launcher.js"
import Account from "../../db/account.js"
import path from "path"
class Launcher extends Launch {
    constructor() {
        super()
        console.log("[CLIENT SIDE] CLASSE LAUNCHER CARREGADA")
    }
    async init(gameData: GameData) {
        const accounts = await Account.accounts()
        if (!accounts.length) {
            // alert("Você não pode jogar sem criar uma conta, vá para o menu 'Contas' para criar uma.")
            // this.emit('close')
            return
        }

        const settings = await LauncherSettings.config()
        if (!settings) return

        const auth = await Account.getAtual()

        await this.Launch({
            authenticator: auth ? this.convert(auth) : null,
            timeout: 10000,
            path: path.join(settings.path, "versions", gameData.name),
            version: gameData.gameVersion,
            detached: false,
            downloadFileMultiple: 100,
            loader: {
                type: gameData.loader,
                build: gameData.loaderVersion,// "latest",
                enable: !(gameData.loader == 'vanilla')
            },
            url: gameData.files,
            verify: false,
            ignored: ['loader', 'options.txt'],
            java: {
                path: null,
                version: null,
                type: 'jre',
            },
            screen: {
                width: settings.width,
                height: settings.height,
            },

            memory: {
                min: `${settings.min}M`,
                max: `${settings.max}M`
            },
            JVM_ARGS: [],
            GAME_ARGS: []
        })
    }

    convert(account_connect: any) {
        return {
            access_token: account_connect.access_token,
            client_token: account_connect.client_token,
            uuid: account_connect.uuid,
            name: account_connect.name,
            user_properties: JSON.parse(account_connect.user_properties),
            meta: JSON.parse(account_connect.meta)
        }
    }

}

export {
    Launcher
}