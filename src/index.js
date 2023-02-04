import Phaser from "phaser";
import BootScene from "./scenes/Boot";
import MenuScene from "./scenes/Menu";
import { calculate_scores } from "../domain";
import { HEIGHT, WIDTH } from "../constants";

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: WIDTH,
  height: HEIGHT,
  mode: Phaser.Scale.FIT,
  backgroundColor: "#4488aa",
  scene: [BootScene, MenuScene],
};
let lastCalc = 0;

class MyGame extends Phaser.Game {
  step(time, delta) {
    super.step(time, delta);

    if (time > 2000 && Math.round(time / 3000) > lastCalc) {
      calculate_scores(this.canvas);
      lastCalc += 1;
    }
  }
}

const game = new MyGame(config);
