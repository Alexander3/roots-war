import Phaser from "phaser";

import BootScene from "./scenes/Boot";
import MenuScene from "./scenes/Menu";
import GameScene from "./scenes/Game";
import {HEIGHT, WIDTH} from "./constants";
import {Player} from "./player";

const config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    physics: {
        default: "arcade",
        arcade: {
            fps: 60,
            debug: false,
            gravity: {y: 0},
        },
    },
    width: WIDTH,
    height: HEIGHT,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: "#4488aa",
    scene: [BootScene, MenuScene, GameScene],
};
let lastCalc = 0;
const players = [new Player()];

class MyGame extends Phaser.Game {
    step(time, delta) {
        super.step(time, delta);
    }
}

const game = new MyGame(config);
