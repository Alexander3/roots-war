import {SCALE} from "./constants";

export function calculateScores(self,hiddenTexture, players) {

    var src = hiddenTexture.texture.getSourceImage();
    var canvasTexture = self.textures.createCanvas('map', src.width, src.height).draw(0, 0, src);


    // hiddenTexture.update()
    // hiddenTexture.snapshotArea(0, 0, hiddenTexture.width, hiddenTexture.height, (snap) => {
    //
    //     var canvas = document.createElement('canvas');
    //     var context = canvas.getContext('2d');
    //     context.drawImage(snap, 0, 0);
    //     const pixels = context.getImageData(0, 0, 1920, 1080).data;
        const scores = {};
    //     for (let x = 0; x < pixels.length; x++) {
    //         const color = pixels[x]
    //         if (!scores[color]) scores[color] = 0;
    //         scores[color] += 1;
    //     }
    //     console.log(scores, players.map(p => p.player.points))
    //
    // })


const pixels = canvasTexture.getPixels();
//     const pixels = canvasTexture.context.getImageData(0, 0, 1920, 1080).data
//
    const playerMap = Object.fromEntries(players.map(p => ([p.player.brushColor, p])))
//     const scores = {};
//     for (let x = 0; x < pixels.length; x++) {
//         const color = pixels[x]
//         if (!scores[color]) scores[color] = 0;
//         scores[color] += 1;
//     }
//

for (let x = 0, c = pixels.length; x < c; x++) {
    const row = pixels[x];
    for (let y = 0, r = row.length; y < r; y++) {
        // const color = row[y].color
        const color = row[y]
        const player = playerMap[color]
        if (player) player.player.points++;

        if (!scores[color]) scores[color] = 0;
        scores[color] += 1;
    }
}
    console.log(scores, players.map(p => p.player.points))
}