import Phaser from 'phaser'

export default class extends Phaser.Scene {
    constructor() {
        super({
            key: "Menu"
        });
    }

    init() {
        console.log("Menu init()")
    }

    create() {
        const w = this.game.config.width;
        const h = this.game.config.height;
    }
}