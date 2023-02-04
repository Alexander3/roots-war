import Phaser from 'phaser'

export default class extends Phaser.Scene {
    constructor() {
        super({
            key: "Scores"
        });
    }

    init() {
        console.log("Scores init()")
    }

    create() {
        const w = this.game.config.width;
        const h = this.game.config.height;
    }
}
