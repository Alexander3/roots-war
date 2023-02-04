export function calculateScores(canvasTexture, players) {
    const pixels = canvasTexture.getPixels();
    const playerMap = Object.fromEntries(players.map(p => ([p.player.brushColor, p])))
    const scores = {};

    for (let x = 0, c = pixels.length; x < c; x++) {
        const row = pixels[x];
        for (let y = 0, r = row.length; y < r; y++) {
            const color = row[y].color
            const player = playerMap[color]
            if (player) player.player.points++;

            // if (!scores[color]) scores[color] = 0;
            // scores[color] += 1;
        }
    }
    console.log(scores, players.map(p => p.player.points))
}

export function copy(sourceTexture, destTexture) {
    destTexture
        .clear()
        .getContext()
        .drawImage(
            sourceTexture.canvas,
            0,
            0,
            sourceTexture.width,
            sourceTexture.height,
            0,
            0,
            destTexture.width,
            destTexture.height
        );
    destTexture.update();
}
