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

const getPlayerColors = ({team}) => {
    switch (team) {
        case 'red':
            return {
                teamColor: 0xff0000,
                brushColor: 0x0000ff,
            }
        case 'blue':
            return {
                teamColor: 0x0000ff,
                brushColor: 0xff0000,
            }
        case 'green':
            return {
                teamColor: 0x00ff00,
                brushColor: 0x00ff00,
            }
    }
    return {
        teamColor: 0x000000,
        brushColor: 0x00000,
    }
}
