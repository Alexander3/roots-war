import chroma from "chroma-js";

var canvas = document.createElement("canvas");

const DELTA_E_EPS = 17;
const scale = 0.2

export function calculateScores(snap, players) {
    players = players.sort((a, b) => a.playerId.localeCompare(b.playerId))
    // document.body.append(snap)
    const scores = players.reduce(
        (acc, player) => ({
            ...acc, [player.playerId]: 0,
        }),
        {}
    );

    const ctx = canvas.getContext("2d", {willReadFrequently: true}) as CanvasRenderingContext2D;
    const w = snap.width * scale
    const h = snap.height * scale

    ctx.canvas.width = w;
    ctx.canvas.height = h;
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(snap, 0, 0, w, h);
    // var dataURL = canvas.toDataURL("image/png");
    // const img=document.createElement('img')
    // img.src=dataURL
    // document.body.append(img)
    const pixels = ctx.getImageData(0, 0, w, h).data;

    for (let x = 0; x < pixels.length; x += 4) {
        const r = pixels[x];
        const g = pixels[x + 1];
        const b = pixels[x + 2];
        const a = pixels[x + 3];
        if (a < 0.01)
            continue

        const color = chroma(r, g, b, "rgb");
        for (const player of players) {
            if (chroma.deltaE(color, player.brushColorObj) < DELTA_E_EPS) {
                scores[player.playerId]++;
                break
            }
        }
    }

    return scores;
}
