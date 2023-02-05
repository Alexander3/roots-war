import Phaser from "phaser";
import { Player } from "../player";
import { TEXT_STYLES } from "../constants";

export default class extends Phaser.Scene {
  private players: Player[];
  private titleText: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: "Scores",
    });
  }

  init(data) {
    console.log("Scores init()", data);
    this.players = data.players;
    const w = this.game.config.width as number;
    const h = this.game.config.height as number;
    let i = 0;


    document.addEventListener(
      "score-ready",
      (e) => {
        console.log("score ready");
        this.titleText.setText("Results:");

        const totalPoints = this.players.reduce(
          (acc, player) => acc + player.points,
          0
        );

        for (const player of this.players) {
          const points = `${player.playerName}: ${fPercent(
            player.points / totalPoints
          )}`;

          this.add
            .text(w / 2, h / 2 + i * 100, points, TEXT_STYLES.bigTextStyle)
            .setOrigin(0.5, 0.5)
            .setColor("#" + player.brushColor.toString(16));
          i += 1;
        }
      },
      false
    );
  }

  create() {
    const w = this.game.config.width as number;
    const h = this.game.config.height as number;
    this.add.image(w / 2, h / 2, "results-background");

    this.titleText = this.add
        .text(w / 2, h / 2 - 100, "Calculating results...", TEXT_STYLES.bigTextStyle)
        .setOrigin(0.5, 0.5);
    // this.add.rectangle(w / 2, h / 2 , 148, 148, 0x5c3506,0.8);
  }
}

function fPercent(num) {
  return `${Math.round((num + Number.EPSILON) * 100)}%`;
}
