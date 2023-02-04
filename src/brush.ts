import { Player } from "./player";
import Game from "./scenes/Game";

export function drawPlayerBrush(self: Game, player: Player) {
    if (!player.isBrushEnabled) {
        return;
    }
    const brushImage= player.hasBigBrush ? self.bigBrush : self.standardBrush;
    brushImage.setRotation(player.rotation)

    self.surface.draw(
        brushImage,
        player.x,
        player.y,
        1,
        player.brushColor
    );
}