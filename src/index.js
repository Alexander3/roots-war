import Phaser from "phaser";
import logoImg from "./assets/logo.png";
import { calculate_scores } from "../domain";
import { HEIGHT, WIDTH } from "../constants";

class MyScene extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    this.load.image("logo", logoImg);
  }

  create() {
    const logo = this.add.image(400, 150, "logo");

    this.tweens.add({
      targets: logo,
      y: 450,
      duration: 2000,
      ease: "Power2",
      yoyo: true,
      loop: -1,
    });
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: WIDTH,
  height: HEIGHT,
  scene: MyScene,
};
let lastCalc = 0;

class MyGame extends Phaser.Game {
  step(time, delta) {
    super.step(time, delta);

    if (time > 2000 && Math.round(time / 1000) > lastCalc) {
      calculate_scores(this.canvas);
      lastCalc += 1;
    }
  }
}

const game = new MyGame(config);
