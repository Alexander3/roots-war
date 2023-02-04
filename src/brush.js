export function drawPlayerBrush(self, player) {
    let brush = "brush";
    if (player.player.hasBigBrush > 0) {
        brush = "brush2"
    }
    self.surface.draw(
        brush,
        player.x - player.width / 2,
        player.y - player.height / 2,
        1,
        player.player.brushColor
    );
}
