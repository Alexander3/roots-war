import Phaser from "phaser";
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
      .text(w / 2, h / 2 - 150, "Calculating results...", {
        ...TEXT_STYLES.largeTextStyle,
        fill: "#0aafa9",
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

      for (const player of this.players) {
        const points = `${player.playerName}: ${fPercent(
          results[player.playerId] / totalPaintedPixels
        )}`;
        // console.log(player.playerName, player.brushColorObj.hex(), "#" + player.brushColor.toString(16))
        // for(const p of this.players) {
        //   const dis = chroma.deltaE(p.brushColorObj, player.brushColorObj)
        //   console.log(`%c ${player.brushColorObj.hex()}`, `color: ${player.brushColorObj.hex()}`);
        //   console.log(`%c ${p.brushColorObj.hex()}, ${dis}`, `color: ${p.brushColorObj.hex()}`);
        // }
        this.add
          .text(w / 2, h / 2 + i * 100, points, TEXT_STYLES.bigTextStyle)
          .setOrigin(0.5, 0.5)
        .setColor(player.brushColorObj.hex());
        // .setColor("#" + player.brushColor.toString(16));
        i += 1;
      }
    });
  }
}

function fPercent(num) {
  return `${Math.round((num + Number.EPSILON) * 100)}%`;
}
