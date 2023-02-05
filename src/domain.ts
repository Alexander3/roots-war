import chroma from "chroma-js";

var canvas = document.createElement("canvas");

const DELTA_E_EPS = 50;

export function calculateScores(snap, players) {
  const scores = players.reduce(
    (acc, player) => ({
      ...acc,
      [player.playerId]: 0,
    }),
    {}
  );

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.canvas.width = 1920;
  ctx.canvas.height = 1080;
  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(snap, 0, 0);
  const pixels = ctx.getImageData(0, 0, 1920, 1080).data;

  for (let x = 0; x < pixels.length; x += 4) {
    const r = pixels[x];
    const g = pixels[x + 1];
    const b = pixels[x + 2];
    const a = pixels[x + 3];
    if (a<0.1)
      continue

    const color = chroma(r, g, b, "rgb");
    for (const player of players) {
      if (chroma.deltaE(color, player.brushColorObj) < DELTA_E_EPS) {
        scores[player.playerId]++;
      }
    }
  }

  return scores;
}
