import chroma from "chroma-js";

var canvas = document.createElement('canvas');

const DELTA_E_EPS = 50

export function calculateScores(surface, players) {
    surface.snapshot((snap) => {
        const ctx = canvas.getContext('2d', {willReadFrequently: true});
        ctx.canvas.width = surface.width;
        ctx.canvas.height = surface.height;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(snap, 0, 0);
        const pixels = ctx.getImageData(0, 0, surface.width, surface.height).data;
        for (let x = 0; x < pixels.length; x += 4) {
            const r = pixels[x]
            const g = pixels[x + 1]
            const b = pixels[x + 2]

            const color = chroma(r, g, b, 'rgb');
            for (const player of players) {
                if (chroma.deltaE(color, player.brushColorObj) < DELTA_E_EPS)
                    player.points += 1
            }
        }
        console.log(players.map(p => p.points))
    })

}