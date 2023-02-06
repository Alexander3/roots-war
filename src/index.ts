import Phaser from "phaser";

import BootScene from "./scenes/Boot";
import GameScene from "./scenes/Game";
import ScoresScene from "./scenes/Scores";
import {HEIGHT, WIDTH} from "./constants";
import {getFrameRate} from "./utils";

const config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    physics: {
        default: "arcade",
        arcade: {
            fps: getFrameRate(),
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
    backgroundColor: "#000000",
    scene: [BootScene, GameScene, ScoresScene],
};

class MyGame extends Phaser.Game {
    step(time, delta) {
        super.step(time, delta);
    }
}

new MyGame(config);
