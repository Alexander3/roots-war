const colormap = require("colormap");

const colors = colormap({
    colormap: "jet",
    nshades: 20,
    format: "hex",
    alpha: 1,
});

export class Player {
    constructor() {
        this.color = colors.pop();
        this.orientation = 0
    }
}
