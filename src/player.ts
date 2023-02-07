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
export const DEFAULT_SPEED = 300;

export class Player extends Phaser.Physics.Arcade.Sprite {
    color: any;
    orientation: number;
    hasBigBrush: boolean;
    isBrushEnabled: boolean;
    collisionPossible: boolean;
    teamColor: number;
    brushColor: number;
    playerId: string;
    playerName: string;
    speed: number;
    points = 0;
    brushColorObj: any;
    oldPosition: { x: number; y: number; rotation: number };
    spriteName: string;
    playerReady: boolean = false;
    paintCounter: number = 0;

    constructor(game: Game, playerInfo) {
        const {
            teamColor,
            brushColor,
            vehicle: spriteName,
        } = getPlayerColors(playerInfo);
        super(game, playerInfo.x, playerInfo.y, spriteName);
        this.teamColor = teamColor;
        this.brushColor = brushColor;
        this.brushColorObj = chroma(brushColor);
        this.playerId = playerInfo.playerId;
        this.playerName = playerInfo.name;
        this.spriteName = spriteName;
        this.setOrigin(0.5, 0.5).setDisplaySize(90, 70);
        this.setAngle(45);
        this.resetToDefaults();
        this.color = colors.pop();
    }


    create(game: Game) {
        this.resetToDefaults();
        this.resetSpeed();
        this.enablePaint();
    }

    resetToDefaults() {
        this.orientation = 0;
        this.visible = false;
        this.hasBigBrush = false;
        this.isBrushEnabled = true;
        this.speed = DEFAULT_SPEED;
        this.collisionPossible = true;
        this.paintCounter = 0;
    }

    update() {
    }

    startGame(game: Game) {
        game.physics.add.existing(this, false);
        game.add.existing(this);
        this.setVisible(true);
    }

    startActivePlayer(game: Game) {
        const velocity = game.physics.velocityFromAngle(this.angle, game.speed);
        this.setVelocity(velocity.x, velocity.y);
    }

    stopGame() {
        this.setVisible(false);
        this.setVelocity(0, 0);
        this.speed = 0;
    }

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
        this.speed = DEFAULT_SPEED;
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

const colorOptions = [
    "#2E5A18",
    "#381700",
    "#10e004",
    "#796f00",
    "#524B49",
    "#468564",
].map((c) => chroma(c).num());

const getPlayerColors = ({team}) => {
    switch (team) {
        case "white":
            return {
                vehicle: "vehicle2",
                teamColor: 0xffffff,
                brushColor: colorOptions[0],
            };
        case "green":
            return {
                vehicle: "vehicle3",
                teamColor: 0x00ff00,
                brushColor: colorOptions[1],
            };
        case "orange":
            return {
                vehicle: "vehicle1",
                teamColor: 0xffe0ac,
                brushColor: colorOptions[2],
            };
        case "pink":
            return {
                vehicle: "vehicle4",
                teamColor: 0x6c12a3,
                brushColor: colorOptions[3],
            };
        case "red":
            return {
                vehicle: "vehicle5",
                teamColor: 0xff0000,
                brushColor: colorOptions[4],
            };
        case "grey":
            return {
                vehicle: "vehicle6",
                teamColor: 0xcccccc,
                brushColor: colorOptions[5],
            };
    }
};

//Generating colors
// '#000083', '0x003caa', '0x05ffff', '0xffff00', '0xfa0000', '0x800000'
//
// const teamNames = ["white", "green", "orange", "pink", "red", "grey"];
// const colors = teamNames.map(t=>getPlayerColors({team:t}).brushColor)
// colors.forEach(c=>{
//   colors.forEach(c2=>{
//     if (c!=c2){
//       const c11=chroma(c)
//       const c12=chroma(c2)
//       const dis = chroma.deltaE(c11, c12)
//       if (dis < 40) {
//         console.log(`%c ${c11.hex()}`, `color: ${c11.hex()}`);
//         console.log(`%c ${c12.hex()}, ${dis}`, `color: ${c12.hex()}`);
//       }
//     }
//   })
//
// })
// let colors2 = colormap({
//     colormap: 'rainbow',
//     nshades: 9,
//     format: 'hex',
//     alpha: 1
// })
// console.log(colors2)
