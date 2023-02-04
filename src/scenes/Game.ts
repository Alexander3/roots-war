import { drawPlayerBrush } from "../brush.ts";
import { createForServer } from "../gameSocket";
// import {calculate_scores} from "../domain";

export default class extends Phaser.Scene {
  speed: number;
  surface: Phaser.GameObjects.RenderTexture;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  character: any;
  socket: any;

  constructor() {
    super({
      key: "Game",
    });

    this.speed = 300;
  }

  create() {
    createForServer(this);

    this.surface = this.add.renderTexture(
      0,
      0,
      this.game.config.width as number,
      this.game.config.height as number
    );

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("character", {}),
      frameRate: 3,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors.left.isDown) {
      this.character.angle -= 4;
    } else if (this.cursors.right.isDown) {
      this.character.angle += 4;
    }

    if (this.character) {
      this.character.player.update();
      // calculate_scores(this.game.canvas)
      this.character.body.velocity = this.physics.velocityFromAngle(
        this.character.angle,
        this.speed
      );

      drawPlayerBrush(this, this.character);

      this.physics.world.wrap(this.character, 32);

      // emit player movement
      var x = this.character.x;
      var y = this.character.y;
      var r = this.character.rotation;
      if (
        this.character.oldPosition &&
        (x !== this.character.oldPosition.x ||
          y !== this.character.oldPosition.y ||
          r !== this.character.oldPosition.rotation)
      ) {
        this.socket.emit("playerMovement", {
          x,
          y,
          rotation: r,
          hasBigBrush: this.character.player.hasBigBrush,
        });
      }
      // save old position data
      this.character.oldPosition = {
        x: this.character.x,
        y: this.character.y,
        rotation: this.character.rotation,
      };
    }
  }
}
