import * as io from "socket.io-client";
import {addCurrentPlayer, addOtherPlayer} from "./players";
import {drawPlayerBrush} from "./brush";
import {Player} from "./player";

export enum GameStatus {
    Waiting = 'waiting',
    Start = 'started',
    Finished = 'finished'
}

export function disconnectWithServer(self) {
    self.socket.disconnect();
}

export function createForServer(self) {
    self.socket = io.connect("http://localhost:8081");
    self.otherPlayers = self.physics.add.group();
    self.allPlayers = () => {
        return [self.character, ...self.otherPlayers.getChildren()];
    }

    // ADDING EXISTING PLAYERS WHEN JOINING AS NEW PLAYER
    self.socket.on("currentPlayers", function (players: Player[]) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addCurrentPlayer(self, players[id]);
            } else {
                addOtherPlayer(self, players[id]);
            }
        });
    });

    // ADDING NEW PLAYER WHEN ALREADY PLAYING AS ONE
    self.socket.on("newPlayer", function (playerInfo) {
        addOtherPlayer(self, playerInfo);
    });


    // REMOVING PLAYER THAT DISCONNECTED
    self.socket.on("disconnect", function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });


    // RECEIVING INFO ABOUT MOVEMENT OF OTHER PLAYERS
    self.socket.on("playerMoved", function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                // set player rotation
                otherPlayer.setRotation(playerInfo.rotation);
                // set player position
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                // draw player brush
                drawPlayerBrush(self, otherPlayer)
            }
        });
    });

    // RECEIVING INFO ABOUT BIG BRUSH ACTIVATION
    self.socket.on("bigBrushActivated", function (playerId) {
        self.allPlayers().forEach((sprite) => {
            if (sprite.player.playerId === playerId) {
                sprite.player.hasBigBrush = true;
            }
        })
    });

    // RECEIVING INFO WHEN GAME CAN BE STARTED
    self.socket.on("gameStatusChanged", function (gameStatus) {
        self.gameStatus = gameStatus
        if (self.gameStatus === GameStatus.Finished) {
            disconnectWithServer(self);
        }
    });

    // RECEIVING INFO ABOUT BIG BRUSH DEACTIVATION
    self.socket.on("bigBrushDeactivated", function (playerId) {
        self.allPlayers().forEach((sprite) => {
            if (sprite.player.playerId === playerId) {
                sprite.player.hasBigBrush = false;
            }
        })
    });

    // RECEIVING INFO ABOUT SHOE ACTIVATION
    self.socket.on("shoeActivated", function (playerId) {
        self.allPlayers().forEach((sprite) => {
            if (sprite.player.playerId === playerId) {
                sprite.player.speed *= 2;
            }
        })
    });

    // RECEIVING INFO ABOUT SHOE DEACTIVATION
    self.socket.on("shoeDeactivated", function (playerId) {
        self.allPlayers().forEach((sprite) => {
            if (sprite.player.playerId === playerId) {
                sprite.player.speed /= 2;
            }
        })
    });

    // RECEIVING INFO ABOUT CLOCK ACTIVATION
    self.socket.on("clockActivated", function (playerId) {
        self.allPlayers().forEach((sprite) => {
            if (sprite.player.playerId !== playerId) {
                sprite.player.speed = 0;
            }
        })
    });

    // RECEIVING INFO ABOUT CLOCK DEACTIVATION
    self.socket.on("clockDeactivated", function (playerId) {
        self.allPlayers().forEach((sprite) => {
            if (sprite.player.playerId !== playerId) {
                sprite.player.resetSpeed()
            }
        })
    });

    // RECEIVING INFO ABOUT NO PAINT ACTIVATION
    self.socket.on("noPaintActivated", function (playerId) {
        self.allPlayers().forEach((sprite) => {
            if (sprite.player.playerId !== playerId) {
                console.log("DISABLE paint for", playerId)
                sprite.player.disablePaint();
            }
        })
    });

    // RECEIVING INFO ABOUT NO PAINT DEACTIVATION
    self.socket.on("noPaintDeactivated", function (playerId) {
        self.allPlayers().forEach((sprite) => {
            if (sprite.player.playerId !== playerId) {
                console.log("ENABLE paint for", playerId)
                sprite.player.enablePaint();
            }
        })
    });

    // CREATING INPUT CONTROLS FOR CURRENT PLAYER
    self.cursors = self.input.keyboard.createCursorKeys();

    // ADD PERK FOR ALL PLAYERS
    self.socket.on("perkDrop", function ({x, y, type: perkType}) {
        if (self.perk) {
            self.perk.destroy();
        }

        // add perk image
        self.perk = self.physics.add.image(x, y, perkType);


        // setup collection logic on collision between player sprite and perk sprite
        self.physics.add.overlap(
            self.character,
            self.perk,
            function () {
                self.socket.emit("perkCollected", perkType);
            },
            null,
            this
        );
    });
}
