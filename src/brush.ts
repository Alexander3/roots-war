export function drawPlayerBrush(self, player) {
    const brushImageKey = player.player.hasBigBrush ? "brushBig" : "brushStandard";
    const brushTexture = self.game.textures.get(brushImageKey);
    const brushImage = brushTexture.getSourceImage();
    self.surface.draw(
        brushImageKey,
        player.x - brushImage.width / 2,
        player.y - brushImage.height / 2,
        1,
        player.player.brushColor
    );
}
