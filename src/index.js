import Phaser from "phaser";
import brush from "./assets/brush.png";
import characterImg from "./assets/character-rotated.png";

class MyScene extends Phaser.Scene {
  constructor() {
    super();

    this.velocity = 100;
  }

  preload() {
    this.load.image("brush", brush);
    this.load.spritesheet("character", characterImg, {
      frameWidth: 36,
      frameHeight: 32,
    });
  }

  create() {
    this.surface = this.add.renderTexture(0, 0, 800, 600);

    this.character = this.physics.add.sprite(50, 50, "character");

    const characterAnimation = this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("character"),
      frameRate: 3,
    });

    this.character.play({ key: "walk", repeat: -1 });

    this.character.setAngle(45);
    this.character.body.velocity = this.physics.velocityFromAngle(
      this.character.angle,
      this.velocity
    );

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors.left.isDown) {
      this.character.angle -= 1;
    } else if (this.cursors.right.isDown) {
      this.character.angle += 1;
    }

    this.character.body.velocity = this.physics.velocityFromAngle(
      this.character.angle,
      this.velocity
    );

    this.surface.draw(
      "brush",
      this.character.x - this.character.width / 2,
      this.character.y - this.character.height / 2
    );

    this.physics.world.wrap(this.character, 32);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      fps: 60,
      gravity: { y: 0 },
    },
  },
  scene: MyScene,
};

class MyGame extends Phaser.Game {
  step(time, delta) {
    super.step(time, delta);
  }
}

const game = new MyGame(config);
