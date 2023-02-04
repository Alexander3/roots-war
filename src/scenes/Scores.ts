import Phaser from 'phaser'
import {Player} from "../player";

export default class extends Phaser.Scene {
    private players: Player[];

    constructor() {
        super({
            key: "Scores"
        });
    }

    init(data) {
        console.log("Scores init()", data)
        this.players = data.players
        const w = this.game.config.width as number;
        const h = this.game.config.height as number;
        let i = 0

        document.addEventListener('score-ready', (e) => {
            console.log("score ready")
            const totalPoints = this.players.reduce((acc,player)=>acc + player.points,0)
            for (const player of this.players) {
                const points = `Player: ${fPercent(player.points/totalPoints)}`

                this.add.text(w / 2, h / 2 + i * 20, points,
                    {font: '32px severinaregular'}).setColor('#' + player.brushColor.toString(16))
                i += 1
            }
        }, false);
    }

    create() {
        const w = this.game.config.width as number;
        const h = this.game.config.height as number;
        this.add.image(w / 2, h / 2,'rootsBg')
        // this.add.rectangle(w / 2, h / 2 , 148, 148, 0x5c3506,0.8);

    }
}

function fPercent(num){
    return `${Math.round((num + Number.EPSILON) * 100)}%`
}