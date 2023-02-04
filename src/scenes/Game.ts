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
  spaceKey: Phaser.Input.Keyboard.Key;
  socket: any;
  promptText: Phaser.GameObjects.Text;
  perk: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  otherPlayers: Phaser.Physics.Arcade.Group;
  mainPlayer: Player;

  allPlayers: () => Player[];
  standardBrush: Phaser.GameObjects.Image;
  bigBrush: Phaser.GameObjects.Image;
  timeText: Phaser.GameObjects.Text;
  endTime: number;
  peacefulMusic: Phaser.Sound.BaseSound;

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

    // this.standardBrush = this.add.image(100, 100, 'brushStandard').setVisible(false).setOrigin(0.5,0.5);
    this.bigBrush = this.add.image(100, 100, 'brushBig').setVisible(false).setOrigin(0.5,0.5);

    const config = {
          key: "move",
          frames: this.anims.generateFrameNumbers("brushStandardSheet", {
            start: 0,
            end: 4,
            first: 0
          }),
          frameRate: 5,
          repeat: -1
        };

        this.anims.create(config);
      this.standardBrush = this.add.sprite(100, 100, 'brushStandardSheet').setVisible(false).setOrigin(0.5,0.5).play("move");;

    this.timeText = this.add.text(w/2, h-15, '', { font: '32px severinaregular' });
    this.timeText.setOrigin(0.5, 0.5);

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

    this.peacefulMusic = this.sound.add('peaceful-music');
    this.peacefulMusic.play();
    // this.worker = new SharedWorker('domain.js');
  }

  changeGameStatus(gameStatus) {
    this.gameStatus = gameStatus;

    if (gameStatus === GameStatus.Start) {
      this.tutorial.destroy();
      this.promptText.destroy();
      this.endTime = Date.now() + 60000;
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
      if(this.endTime){
         const timeRemaining = Math.ceil((this.endTime - Date.now()) / 1000);
        this.timeText.text = timeRemaining + ' seconds remaining';

      }

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
