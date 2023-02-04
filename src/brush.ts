export function drawPlayerBrush(self, player) {
    if (!player.player.isBrushEnabled) {
        return;
    }

    const brushImageKey = player.player.hasBigBrush ? "brushBig" : "brushStandard";
    const brushTexture = self.game.textures.get(brushImageKey);
    const brushImage = brushTexture.getSourceImage();

    self.trail.setRotation(player.rotation)
    self.surface.draw(
        self.trail,
        player.x,
        player.y,
        1,
        player.player.brushColor
    );
}