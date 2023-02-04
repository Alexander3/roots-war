export function addCurrentPlayer(self, playerInfo) {
    self.character = addPlayer(self, playerInfo, 'current')
}

export function addOtherPlayer(self, playerInfo) {
    const otherPlayer = addPlayer(self, playerInfo, 'other')
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}

export function addPlayer(self, playerInfo, kind) {
    const isCurrent = kind === 'current';
    const content = isCurrent ? self.physics : self;
    const character = content.add
        .sprite(playerInfo.x, playerInfo.y, "character")
        .setOrigin(0.5, 0.5)
        .setDisplaySize(53, 40);

    character.play({key: "walk", repeat: -1});

    const {teamColor, brushColor} = getPlayerDetails(playerInfo.team)
    character.setAngle(45);
    if (isCurrent) {
        character.body.velocity = self.physics.velocityFromAngle(
            character.angle,
            self.velocity
        );
    }
    character.teamColor = teamColor
    character.brushColor = brushColor
    character.setTint(teamColor);
    return character;
}

const getPlayerDetails = (team) => {
    switch (team) {
        case 'red':
            return {
                teamColor: 0xff0000,
                brushColor: 0x0000ff,
            }
        case 'blue':
            return {
                teamColor: 0x0000ff,
                brushColor: 0xff0000,
            }
        case 'green':
            return {
                teamColor: 0x00ff00,
                brushColor: 0x00ff00,
            }
    }
    return {
        teamColor: 0x000000,
        brushColor: 0x00000,
    }
}
