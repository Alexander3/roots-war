import * as io from "socket.io-client";
import {addCurrentPlayer, addOtherPlayer} from "./players";
import {drawPlayerBrush} from "./brush";
import {Player} from "./player";
import Game from "./scenes/Game";

export enum GameStatus {
    Waiting = 'waiting',
    Start = 'started',
    Finished = 'finished'
}

export function disconnectWithServer(self) {
    self.socket.disconnect();
}

export function createForServer(self: Game) {
    self.socket = io.connect(`http://${location.hostname}:8081`);
    self.otherPlayers = self.physics.add.group();
    self.allPlayers = () => {
        return [self.mainPlayer as Player, ...self.otherPlayers.getChildren() as Player[]];
    }

    // ADDING EXISTING PLAYERS WHEN JOINING AS NEW PLAYER
    self.socket.on("currentPlayers", function (players: Player[]) {
        const [_, currentPlayerInfo] = Object.entries(players).find(([playerId, playerInfo]) => {
            return playerId === self.socket.id
        });

        addCurrentPlayer(self, currentPlayerInfo);

        Object.keys(players).forEach(function (id) {
            if (players[id].playerId !== self.socket.id) {
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
        self.otherPlayers.getChildren().forEach(function (otherPlayer: Player) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });

    // RECEIVING INFO ABOUT MOVEMENT OF OTHER PLAYERS
    self.socket.on("playerMoved", function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer: Player) {
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
        self.allPlayers().forEach((player) => {
            if (player.playerId === playerId) {
                player.hasBigBrush = true;
            }
        })
    });

    // RECEIVING INFO WHEN GAME CAN BE STARTED
    self.socket.on("gameStatusChanged", function (gameStatus) {
        self.changeGameStatus(gameStatus)

        if (self.gameStatus === GameStatus.Finished) {
            disconnectWithServer(self);
        }
    });

    // RECEIVING INFO ABOUT BIG BRUSH DEACTIVATION
    self.socket.on("bigBrushDeactivated", function (playerId) {
        self.allPlayers().forEach((player) => {
            if (player.playerId === playerId) {
                player.hasBigBrush = false;
            }
        })
    });

    // RECEIVING INFO ABOUT SHOE ACTIVATION
    self.socket.on("shoeActivated", function (playerId) {
        self.allPlayers().forEach((player) => {
            if (player.playerId === playerId) {
                player.speed *= 2;
            }
        })
    });

    // RECEIVING INFO ABOUT SHOE DEACTIVATION
    self.socket.on("shoeDeactivated", function (playerId) {
        self.allPlayers().forEach((player) => {
            if (player.playerId === playerId) {
                player.speed /= 2;
            }
        })
    });

    // RECEIVING INFO ABOUT CLOCK ACTIVATION
    self.socket.on("clockActivated", function (playerId) {
        self.allPlayers().forEach((player) => {
            if (player.playerId !== playerId) {
                player.speed = 0;
            }
        })
    });

    // RECEIVING INFO ABOUT CLOCK DEACTIVATION
    self.socket.on("clockDeactivated", function (playerId) {
        self.allPlayers().forEach((player) => {
            if (player.playerId !== playerId) {
                player.resetSpeed()
            }
        })
    });

    // RECEIVING INFO ABOUT NO PAINT ACTIVATION
    self.socket.on("noPaintActivated", function (playerId) {
        self.allPlayers().forEach((player) => {
            if (player.playerId !== playerId) {
                player.disablePaint();
            }
        })
    });

    // RECEIVING INFO ABOUT NO PAINT DEACTIVATION
    self.socket.on("noPaintDeactivated", function (playerId) {
        self.allPlayers().forEach((player) => {
            if (player.playerId !== playerId) {
                player.enablePaint();
            }
        })
    });

    // RECEIVING INFO ABOUT COLLISION BETWEEN TWO PLAYERS
    self.socket.on("playerCollided", function ({player1, player2}) {
        self.allPlayers().forEach((player) => {
            if (player.playerId === player1 || player.playerId === player2) {
                player.angle += 120;
                player.alpha = 0.5;
                player.speed /= 2;
                player.disableCollision()
            }
        })
    });

    // RECEIVING INFO ABOUT COLLISION BETWEEN TWO PLAYERS
    self.socket.on("playerCanCollideAgain", function ({player1, player2}) {
        self.allPlayers().forEach((player) => {
            if (player.playerId === player1 || player.playerId === player2) {
                player.alpha = 1;
                player.resetSpeed()
                player.enableCollision()
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
            self.mainPlayer,
            self.perk,
            function () {
                self.socket.emit("perkCollected", perkType);
            },
            null,
            this
        );
    });
}
