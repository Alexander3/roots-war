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
  teamColor: number;
  brushColor: number;
  playerId: string;
  speed: number;

  constructor(playerInfo) {
    const { teamColor, brushColor } = getPlayerColors(playerInfo);

    this.color = colors.pop();
    this.orientation = 0;
    this.hasBigBrush = false;
    this.teamColor = teamColor;
    this.brushColor = brushColor;
    this.playerId = playerInfo.playerId;
    this.speed = DEFAULT_SPEED;
  }
  update() {}

  resetSpeed() {
    this.speed = DEFAULT_SPEED;
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
    case "red":
      return {
        teamColor: 0xff0000,
        brushColor: invertRB(0xeba534),
      };
    case "blue":
      return {
        teamColor: 0x0000ff,
        brushColor: invertRB(0xdbeb34),
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
  }
  return {
    teamColor: 0x000000,
    brushColor: 0x00000,
  };
};