import { drawPlayerBrush } from "../brush";
import { createForServer,GameStatus } from "../gameSocket";
import { copy, calculateScores } from "../domain";

const SCALE = 0.1;

export default class extends Phaser.Scene {
  speed: number;
  surface: Phaser.GameObjects.RenderTexture;
  tutorial: Phaser.GameObjects.Sprite;
  textureSmall: Phaser.Textures.CanvasTexture;
  hiddenSurface: Phaser.Textures.CanvasTexture;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  character: any;
  gameStatus: GameStatus
  socket: any;

  constructor() {
    super({
      key: "Game",
    });
    this.gameStatus = GameStatus.Waiting
  }

  create() {
    createForServer(this);
    const w = this.game.config.width as number
    const h = this.game.config.height as number

    this.surface = this.add.renderTexture(0, 0, w, h);
    this.hiddenSurface = this.textures.createCanvas("hiddenSurface", w, h);
    this.textureSmall = this.textures.createCanvas("canvastextureSmall", SCALE * w, SCALE * h);

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("character", {}),
      frameRate: 3,
    });

    this.tutorial = this.add.sprite(0, 0, 'tutorial');
    this.cursors = this.input.keyboard.createCursorKeys();

    // Hidden surface just to count score
    // this.add.image(0, 0, "hiddenSurface").setOrigin(0);
    //View minimap for debug
    // this.add.image(0, 0, "canvastextureSmall").setOrigin(0);
    // this.worker = new SharedWorker('domain.js');
  }

  update(time) {
    if (this.gameStatus === GameStatus.Waiting) {
      if (this.cursors.right.isDown) {
        this.tutorial.destroy()
        this.socket.emit("playerReady");
      }
    } else if (this.gameStatus === GameStatus.Finished) {
      this.scene.start('Scores');
    } else {
      if (this.cursors.left.isDown) {
        this.character.angle -= 4;
      } else if (this.cursors.right.isDown) {
        this.character.angle += 4;
      }

      if (this.character) {
        this.character.player.update();
        if (Math.round(time / 2000) % 10 === 0) {
          copy(this.hiddenSurface, this.textureSmall);
          calculateScores(this.textureSmall, this.allPlayers())
        }
        this.character.body.velocity = this.physics.velocityFromAngle(
            this.character.angle,
            this.character.player.speed
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
}
