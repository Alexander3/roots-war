import Phaser from "phaser";
import { Player } from "../player";
import { TEXT_STYLES } from "../constants";
import { calculateScores } from "../domain";

export default class extends Phaser.Scene {
  private players: any[];
  private surfaceSnapshot: any;
  private titleText: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: "Scores",
    });
  }

  init(data) {
    console.log("Scores init()", data);
    this.players = data.players;
    this.surfaceSnapshot = data.surfaceSnapshot;
  }

  create() {
    const w = this.game.config.width as number;
    const h = this.game.config.height as number;

    this.add.image(w / 2, h / 2, "results-background");

    let i = 0;

    this.titleText = this.add
      .text(
        w / 2,
        h / 2 - 100,
        "Calculating results...",
        TEXT_STYLES.bigTextStyle
      )
      .setOrigin(0.5, 0.5);

    setTimeout(() => {
      const results: {[playerId: string]: number} = calculateScores(this.surfaceSnapshot, this.players);

      console.log("score ready", results);
      this.titleText.setText("Results:");

      const totalPaintedPixels = Object.values(results).reduce(
        (acc, paintedPixelsByPlayer) => acc + paintedPixelsByPlayer,
        0
      );

      for (const player of this.players) {
        const points = `${player.playerName}: ${fPercent(
          results[player.playerId] / totalPaintedPixels
        )}`;

        this.add
          .text(w / 2, h / 2 + i * 100, points, TEXT_STYLES.bigTextStyle)
          .setOrigin(0.5, 0.5);
        // .setColor("#" + player.brushColor.toString(16));
        i += 1;
      }
    });
  }
}

function fPercent(num) {
  return `${Math.round((num + Number.EPSILON) * 100)}%`;
}
