import {DEFAULT_SPEED, Player} from "./player";
import Game from "./scenes/Game";

export function drawPlayerBrush(self: Game, player: Player) {
    const counterBound = 2 * (DEFAULT_SPEED / player.speed);

    if(player.paintCounter < counterBound) {
        player.paintCounter++;
        return;
    }

    player.paintCounter = 0;

    if (!player.isBrushEnabled) {
        return;
    }
    const brushImage= player.hasBigBrush ? self.bigBrush : self.standardBrush;
    brushImage.setRotation(player.rotation)
    brushImage.setTint(player.brushColor)
    self.surface.draw(
        brushImage,
        player.x,
        player.y,
        1
    );
}
