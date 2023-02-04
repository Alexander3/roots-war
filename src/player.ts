import chroma from "chroma-js";
import Phaser from "phaser";
import Game from "./scenes/Game";

const colormap = require("colormap");

const colors = colormap({
  colormap: "jet",
  nshades: 20,
  format: "hex",
  alpha: 1,
});
const DEFAULT_SPEED = 300;

export class Player extends Phaser.Physics.Arcade.Sprite {
  color: any;
  orientation: number;
  hasBigBrush: boolean;
  isBrushEnabled: boolean;
  collisionPossible: boolean;
  teamColor: number;
  brushColor: number;
  playerId: string;
  speed: number;
  points = 0;
  brushColorObj: any;
  oldPosition: { x: number; y: number; rotation: number };
  spriteName: string;

  constructor(game: Game, playerInfo, kind: string) {
    super(game, playerInfo.x, playerInfo.y, "character1");

    game.physics.add.existing(this, false);

    const isCurrent = kind === 'current';

    this.setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    
    // this.play({key: "walk", repeat: -1});

    this.setAngle(45);
    
    const velocity = game.physics.velocityFromAngle(
      this.angle,
      game.speed
    )

    if (isCurrent) {

      this.setVelocity(velocity.x, velocity.y);
    }

    // this.setTint(playerInfo.teamColor);

    const {teamColor, brushColor, character: spriteName} = getPlayerColors(playerInfo);

    this.color = colors.pop();
    this.orientation = 0;
    this.hasBigBrush = false;
    this.isBrushEnabled = true;
    this.teamColor = teamColor;
    this.brushColor = brushColor;
    this.brushColorObj = chroma(brushColor);
    this.playerId = playerInfo.playerId;
    this.speed = DEFAULT_SPEED;
    this.collisionPossible = true;
    this.spriteName = spriteName;
  }

  update() {}

  resetSpeed() {
    this.speed = DEFAULT_SPEED;
  }

  disablePaint() {
    this.isBrushEnabled = false;
  }

  enablePaint() {
    this.isBrushEnabled = true;
  }

  disableCollision() {
    this.collisionPossible = false;
  }

  enableCollision() {
    this.collisionPossible = true;
  }
}

export const invertRB = (colour) => {
  const [r, g, b] = colour
    .toString(16)
    .padStart(6, "0")
    .match(/[\w]{2}/g);
  return parseInt([b, g, r].join(""), 16);
};

const getPlayerColors = ({ team }) => {
  switch (team) {
    case "orange":
      return {
        character: 'character1',
        teamColor: 0xff0000,
        brushColor: invertRB(0xeba534),
      };
    case "white":
      return {
        character: 'character2',
        teamColor: 0xffffff,
        brushColor: invertRB(0xffffff),
      };
    case "green":
      return {
        character: 'character3',
        teamColor: 0x00ff00,
        brushColor: invertRB(0x199147),
      };
    case "pink":
      return {
        character: 'character4',
        teamColor: 0x6c12a3,
        brushColor: invertRB(0xdbb0ef),
      };
    case "red":
      return {
        character: 'character5',
        teamColor: 0xff0000,
        brushColor: invertRB(0xff0000),
      };
  }
  return {
    teamColor: 0x000000,
    brushColor: 0x00000,
    character: 'character6'
  };
};
