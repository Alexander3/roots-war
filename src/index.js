import Phaser from "phaser";
import logoImg from "./assets/logo.png";

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
  width: 800,
  height: 600,
  scene: MyScene,
};

class MyGame extends Phaser.Game {
  step(time, delta) {
    super.step(time, delta);
    console.log("dupa");
  }
}

const game = new MyGame(config);
