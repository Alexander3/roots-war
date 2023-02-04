export function drawPlayerBrush(self, player) {
    if (!player.player.isBrushEnabled) {
        return;
    }
    const brushImage= player.player.hasBigBrush ? self.bigBrush : self.standardBrush;
    brushImage.setRotation(player.rotation)
    self.surface.draw(
        brushImage,
        player.x,
        player.y,
        1,
        player.player.brushColor
    );
}