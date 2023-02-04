import Phaser from "phaser";
import BootScene from "./scenes/Boot";
import MenuScene from "./scenes/Menu";

const config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#4488aa',
    scene: [
        BootScene,
        MenuScene
    ],
};

class MyGame extends Phaser.Game {
    step(time, delta) {
        super.step(time, delta);
    }
}

const game = new MyGame(config);
