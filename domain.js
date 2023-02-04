import { HEIGHT, WIDTH } from "./constants";

const pixels = new Uint8Array(WIDTH * HEIGHT * 3);
export function calculate_scores(canvas) {
  const gl = canvas.getContext("webgl");
  gl.readPixels(0, 0, WIDTH, HEIGHT, gl.RGB, gl.UNSIGNED_BYTE, pixels);
  const scores = {};
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    const color =
      String(pixels[i]) + String(pixels[i + 1]) + String(pixels[i + 2]);
    if (!scores[color]) scores[color] = 0;
    scores[color] += 1;
  }
  console.log(scores);
}
