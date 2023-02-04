import chroma from "chroma-js";

const colormap = require("colormap");

const colors = colormap({
  colormap: "jet",
  nshades: 20,
  format: "hex",
  alpha: 1,
});
const DEFAULT_SPEED = 300;

export class Player {
  color: any;
  orientation: number;
  hasBigBrush: boolean;
  isBrushEnabled: boolean;
  collisionPossible: boolean;
  teamColor: number;
  brushColor: number;
  playerId: string;
  speed: number;
  points=0;
  private brushColorObj: any;

  constructor(playerInfo) {
    const { teamColor, brushColor } = getPlayerColors(playerInfo);

    this.color = colors.pop();
    this.orientation = 0;
    this.hasBigBrush = false;
    this.isBrushEnabled = true;
    this.teamColor = teamColor;
    this.brushColor = brushColor;
    this.brushColorObj = chroma(brushColor)
    this.playerId = playerInfo.playerId;
    this.speed = DEFAULT_SPEED;
    this.collisionPossible = true;
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
        teamColor: 0xff0000,
        brushColor: invertRB(0xeba534),
      };
    case "white":
      return {
        teamColor: 0xffffff,
        brushColor: invertRB(0xffffff),
      };
    case "green":
      return {
        teamColor: 0x00ff00,
        brushColor: invertRB(0x199147),
      };
    case "pink":
      return {
        teamColor: 0x6c12a3,
        brushColor: invertRB(0xdbb0ef),
      };
    case "red":
      return {
        teamColor: 0xff0000,
        brushColor: invertRB(0xff0000),
      };
  }
  return {
    teamColor: 0x000000,
    brushColor: 0x00000,
  };
};
