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
  gameStatus: GameStatus;
  socket: any;
  otherPlayers: Phaser.Physics.Arcade.Group;
  perk: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  mainPlayer: Player;

  allPlayers: () => Player[];
  standardBrush: Phaser.GameObjects.Image;
  bigBrush: Phaser.GameObjects.Image;

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

    const tilingSprite = this.add.tileSprite(0, 0, w*2, h*2, 'dirt')
    tilingSprite.setTileScale(0.5, 0.5);
    this.surface = this.add.renderTexture(0, 0, w, h);
    this.standardBrush = this.add.image(100, 100, 'brushStandard').setVisible(false).setOrigin(0.5,0.5);
    this.bigBrush = this.add.image(100, 100, 'brushBig').setVisible(false).setOrigin(0.5,0.5);

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("character", {}),
      frameRate: 3,
    });

    this.tutorial = this.add.sprite(0, 0, "tutorial");
    this.cursors = this.input.keyboard.createCursorKeys();

    // this.worker = new SharedWorker('domain.js');
  }

  update(time) {
    if (this.gameStatus === GameStatus.Waiting) {
      if (this.cursors.right.isDown) {
        this.tutorial.destroy();
        this.socket.emit("playerReady");
      }
    } else if (this.gameStatus === GameStatus.Finished) {
      this.scene.start("Scores");
    } else {
      if (this.cursors.left.isDown) {
        this.mainPlayer.angle -= 4;
      } else if (this.cursors.right.isDown) {
        this.mainPlayer.angle += 4;
      }

      if (this.mainPlayer) {
        this.mainPlayer.update();
        // if (Math.round(time / 2000) % 10 === 0) {
        //   calculateScores(this.surface, this.allPlayers())
        // }

        const velocity = this.physics.velocityFromAngle(
          this.mainPlayer.angle,
          this.mainPlayer.speed
        );

        this.mainPlayer.setVelocity(velocity.x, velocity.y);

        drawPlayerBrush(this, this.mainPlayer);

        this.physics.world.wrap(this.mainPlayer, 32);

        // emit player movement
        var x = this.mainPlayer.x;
        var y = this.mainPlayer.y;
        var r = this.mainPlayer.rotation;
        if (
          this.mainPlayer.oldPosition &&
          (x !== this.mainPlayer.oldPosition.x ||
            y !== this.mainPlayer.oldPosition.y ||
            r !== this.mainPlayer.oldPosition.rotation)
        ) {
          this.socket.emit("playerMovement", {
            x,
            y,
            rotation: r,
            hasBigBrush: this.mainPlayer.hasBigBrush,
          });
        }
        // save old position data
        this.mainPlayer.oldPosition = {
          x: this.mainPlayer.x,
          y: this.mainPlayer.y,
          rotation: this.mainPlayer.rotation,
        };
      }
    }
  }
}
