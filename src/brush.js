export function drawPlayerBrush(self, player) {
    self.surface.draw(
        "brush",
        player.x - player.width / 2,
        player.y - player.height / 2,
        1,
        player.brushColor
    );
}
