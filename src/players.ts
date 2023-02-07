import {Player} from "./player";
import Game from "./scenes/Game";

export function addCurrentPlayer(self, playerInfo) {
    if (self.mainPlayer) {
        self.mainPlayer.destroy();
    }
    self.mainPlayer = addPlayer(self, playerInfo)
    self.onMainPlayerJoined(self.mainPlayer);
}

export function addOtherPlayer(self, playerInfo) {
    let player;
    self.getOtherPlayersChildren().forEach(function (otherPlayer: Player) {
        if (playerInfo.playerId === otherPlayer.playerId) {
            player = otherPlayer;
        }
    });
    if (!player) {
        player = addPlayer(self, playerInfo)
        player.playerId = playerInfo.playerId;
    }
    if (self.mainPlayer && self.otherPlayers?.children) {
        self.otherPlayers.add(player);
        self.physics.add.overlap(
            self.mainPlayer,
            player,
            function () {
                if (self.mainPlayer.collisionPossible && player.collisionPossible) {
                    self.socket.emit("playersCollision", {
                        player1: self.mainPlayer.playerId,
                        player2: player.playerId
                    });
                }
            },
            null,
            this
        );
    }
}

function addPlayer(self: Game, playerInfo) {
    return new Player(self, playerInfo);
}
