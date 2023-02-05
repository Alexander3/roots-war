import {Player} from "./player";
import Game from "./scenes/Game";

export function addCurrentPlayer(self, playerInfo) {
    self.mainPlayer = addPlayer(self, playerInfo)
    self.onMainPlayerJoined(self.mainPlayer);
}

export function addOtherPlayer(self, playerInfo) {
    const otherPlayer = addPlayer(self, playerInfo)
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);

    self.physics.add.overlap(
        self.mainPlayer,
        otherPlayer,
        function () {
            if (self.mainPlayer.collisionPossible && otherPlayer.collisionPossible) {
                self.socket.emit("playersCollision", {
                    player1: self.mainPlayer.playerId,
                    player2: otherPlayer.playerId
                });
            }
        },
        null,
        this
    );
}

function addPlayer(self: Game, playerInfo) {
    return new Player(self, playerInfo);
}
