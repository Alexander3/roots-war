const colormap = require("colormap");

const colors = colormap({
    colormap: "jet",
    nshades: 20,
    format: "hex",
    alpha: 1,
});

export class Player {
    constructor(playerInfo = {}) {
        const {teamColor, brushColor} = getPlayerColors(playerInfo)
        this.color = colors.pop();
        this.orientation = 0
        this.hasBigBrush = false;
        this.teamColor = teamColor;
        this.brushColor = brushColor;
    }

    collectBigBrush() {
        this.hasBigBrushLimit = 100;
        this.hasBigBrush = true;
    }

    update() {
        if (this.hasBigBrushLimit > 0) {
            this.hasBigBrushLimit = this.hasBigBrushLimit - 1;
            if (this.hasBigBrushLimit <= 0) {
                this.hasBigBrush = false;
            }
        }
    }
}

export const invertRB = (colour) => {
    const [r, g, b] = colour.toString(16).padStart(6, '0').match(/[\w]{2}/g);
    return parseInt([b, g, r].join(''), 16);
}

const getPlayerColors = ({team}) => {
    switch (team) {
        case 'red':
            return {
                teamColor: 0xff0000,
                brushColor: invertRB(0xeba534),
            }
        case 'blue':
            return {
                teamColor: 0x0000ff,
                brushColor: invertRB(0xdbeb34),
            }
        case 'green':
            return {
                teamColor: 0x00ff00,
                brushColor: invertRB(0x199147),
            }
        case 'pink':
            return {
                teamColor: 0x6c12a3,
                brushColor: invertRB(0xDBB0EF),
            }
    }
    return {
        teamColor: 0x000000,
        brushColor: 0x00000,
    }
}
