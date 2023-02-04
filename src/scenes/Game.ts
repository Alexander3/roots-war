import { drawPlayerBrush } from "../brush";
import { calculateScores } from "../domain";
import { createForServer, GameStatus } from "../gameSocket";
import { Player } from "../player";

export default class extends Phaser.Scene {
  speed: number;
  surface: Phaser.GameObjects.RenderTexture;
  tutorial: Phaser.GameObjects.Sprite;
  textureSmall: Phaser.Textures.CanvasTexture;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  spaceKey: Phaser.Input.Keyboard.Key;
  character: any;
  gameStatus: GameStatus;
  socket: any;
  promptText: Phaser.GameObjects.Text;

  allPlayers: () => Player[];

  constructor() {
    super({
      key: "Game",
    });
    this.gameStatus = GameStatus.Waiting;
  }

  create() {
    createForServer(this);
    const w = this.game.config.width as number;
    const h = this.game.config.height as number;

    this.add.tileSprite(w / 2, h / 2, 1920, 1080, "field");

    this.surface = this.add.renderTexture(0, 0, w, h);
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("character", {}),
      frameRate: 3,
    });

    this.tutorial = this.add.sprite(w / 2, h / 2, "tutorial");

    this.promptText = this.make
      .text({
        x: w / 2,
        y: h - h / 10,
        text: "Press spacebar if you are ready to play!",
        style: {
          font: "48px monospace",
          color: "#ffffff",
        },
      })
      .setOrigin(0.5, 0.5);

    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    // this.worker = new SharedWorker('domain.js');
  }

  changeGameStatus(gameStatus) {
    this.gameStatus = gameStatus;

    if (gameStatus === GameStatus.Start) {
      this.tutorial.destroy();
      this.promptText.destroy();
    }
  }

  update(time) {
    if (this.gameStatus === GameStatus.Waiting) {
      if (this.spaceKey.isDown) {
        this.socket.emit("playerReady");
        this.promptText.setText("Waiting for other players!");
      }
    } else if (this.gameStatus === GameStatus.Finished) {
      this.scene.start("Scores");
    } else {
      if (this.cursors.left.isDown) {
        this.character.angle -= 4;
      } else if (this.cursors.right.isDown) {
        this.character.angle += 4;
      }

      if (this.character) {
        this.character.player.update();
        // if (Math.round(time / 2000) % 10 === 0) {
        //   calculateScores(this.surface, this.allPlayers())
        // }
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
