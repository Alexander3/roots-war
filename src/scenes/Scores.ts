import Phaser from "phaser";
import {TEXT_STYLES} from "../constants";
import {calculateScores} from "../domain";
import {GameStatus} from "../gameSocket";

export default class extends Phaser.Scene {
  private players: any[];
  private surfaceSnapshot: any;
  private titleText: Phaser.GameObjects.Text;
  private spaceKey: Phaser.Input.Keyboard.Key;
  gameScene:any;
  private restartText: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: "Scores",
    });
  }

  init(data) {
    console.log("Scores init()", data);
    this.players = data.players;
    this.surfaceSnapshot = data.surfaceSnapshot;
    this.gameScene = data.game;
  }

  create() {
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    const w = this.game.config.width as number;
    const h = this.game.config.height as number;

    this.add.image(w / 2, h / 2, "results-background");

    let i = 0;

    this.titleText = this.add
      .text(w / 2, h / 2 - 150, "Calculating results...", {
        ...TEXT_STYLES.largeTextStyle,
        fill: "#0aafa9",
        stroke: "#390041",
      } as any)
      .setOrigin(0.5, 0.5);
     this.restartText = this.add
      .text(w / 2, h-150, "Press space to restart", {
        ...TEXT_STYLES.mediumTextStyle,
        stroke: "#390041",
      } as any)
      .setOrigin(0.5, 0.5);

    const gradient = this.titleText.context.createLinearGradient(0, 0, 0, this.titleText.height);
    gradient.addColorStop(0, '#0aafa9');
    gradient.addColorStop(.3, '#dddddd');
    gradient.addColorStop(1, '#390041');
    this.titleText.setFill(gradient);

    setTimeout(() => {
      const results: { [playerId: string]: number } = calculateScores(
        this.surfaceSnapshot,
        this.players
      );

      console.log("score ready", results);
      this.titleText.setText("Results:");

      const totalPaintedPixels = Object.values(results).reduce(
        (acc, paintedPixelsByPlayer) => acc + paintedPixelsByPlayer,
        0
      );
      this.players=this.players.sort((p1,p2)=>p2.points - p1.points)
      for (const player of this.players) {
        const points = `${player.playerName}: ${fPercent(
          results[player.playerId] / totalPaintedPixels
        )}`;
        this.add
          .text(w / 2, h / 2 + i * 100, points, TEXT_STYLES.bigTextStyle)
          .setOrigin(0.5, 0.5)
        .setColor(player.brushColorObj.hex());
        // .setColor("#" + player.brushColor.toString(16));
        i += 1;
      }
    });
  }

  update() {
    if (this.gameScene.gameStatus === GameStatus.Finished && this.spaceKey.isDown) {
      this.gameScene.socket.emit("gameRestart");
      this.gameScene.gameStatus = GameStatus.Waiting
      this.scene.start("Game")
    }
  }
}

function fPercent(num) {
  return `${Math.round((num + Number.EPSILON) * 100)}%`;
}
