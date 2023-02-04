import {Player} from "./player";

export function addCurrentPlayer(self, playerInfo) {
    self.character = addPlayer(self, playerInfo, 'current')
}

export function addOtherPlayer(self, playerInfo) {
    const otherPlayer = addPlayer(self, playerInfo, 'other')
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);

    self.physics.add.overlap(
        self.character,
        otherPlayer,
        function () {
            if (self.character.player.collisionPossible && otherPlayer.player.collisionPossible) {
                self.socket.emit("playersCollision", {
                    player1: self.character.player.playerId,
                    player2: otherPlayer.playerId
                });
            }
        },
        null,
        this
    );
}

export function addPlayer(self, playerInfo, kind) {
    const isCurrent = kind === 'current';
    const content = isCurrent ? self.physics : self.physics;
    const character = content.add
        .sprite(playerInfo.x, playerInfo.y, "character2")
        .setOrigin(0.5, 0.5).setScale(0.5)

    // character.play({key: "walk", repeat: -1});

    character.setAngle(45);
    if (isCurrent) {
        character.body.velocity = self.physics.velocityFromAngle(
            character.angle,
            self.velocity
        );
    }
    const player = new Player(playerInfo)
    character.player = player
    // character.setTint(player.teamColor);
    return character;
}
