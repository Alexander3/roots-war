import * as io from "socket.io-client";

import {addCurrentPlayer, addOtherPlayer} from "./players";
import {drawPlayerBrush} from "./brush";
import {DEFAULT_SPEED, Player} from "./player";
import Game from "./scenes/Game";
import {GameSceneKeys} from "./index";

export enum GameStatus {
    Waiting = 'waiting',
    Start = 'started',
    Finished = 'finished'
}

interface GamePlayersMap {
    [key: string]: Player;
}

let gamePlayers: GamePlayersMap = {};

function isGameRunning(self: Game) {
    return self.gameStatus === GameStatus.Start && self.scene.key === GameSceneKeys.Game;
}

function displayAmountOfReadyPlayers(self: Game) {
    if (!isGameRunning(self)) {
        const amountOfReadyPlayers = self.allPlayers().filter(player => player.playerReady).length ?? 0;
        self.onPlayersCountUpdate(amountOfReadyPlayers, self.allPlayers().length);
    }
}

export function initPlayers(self: Game) {
    const [_, currentPlayerInfo] = Object.entries(gamePlayers).find(([playerId, playerInfo]) => {
        return playerId === self.socket.id
    });

    addCurrentPlayer(self, currentPlayerInfo);

    Object.keys(gamePlayers).forEach(function (id) {
        if (gamePlayers[id].playerId !== self.socket.id) {
            addOtherPlayer(self, gamePlayers[id]);
        }
    });

    displayAmountOfReadyPlayers(self);
}

export function createForServer(self: Game) {
    const url = process.env.SOCKET_URL || `http://${location.hostname}:8081`;
    if (!self.socket) {
        self.socket = io.connect(url);

        self.getOtherPlayersChildren = () => {
            return self.otherPlayers?.children ? self.otherPlayers.getChildren() as Player[] : [];
        }

        self.allPlayers = () => {
            return [self.mainPlayer as Player, ...self.getOtherPlayersChildren() as Player[]];
        }

        // ADDING EXISTING PLAYERS WHEN JOINING AS NEW PLAYER
        self.socket.on("disconnectPlayer", function (playerId) {
            self.getOtherPlayersChildren().forEach(function (otherPlayer: Player) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
            if (gamePlayers[playerId]) {
                delete gamePlayers[playerId];
            }
            displayAmountOfReadyPlayers(self);
        });

        // ADDING EXISTING PLAYERS WHEN JOINING AS NEW PLAYER
        self.socket.on("currentPlayers", function (players: GamePlayersMap) {
            if (self.gameStatus !== GameStatus.Start) {
                gamePlayers = players
                initPlayers(self)
            }
        });

        // RECEIVING INFO WHEN PLAYER IS READY
        self.socket.on("playerReady", function ({playerId, status}) {
            self.allPlayers().forEach((player) => {
                if (player.playerId === playerId) {
                    player.playerReady = status;
                }
            })
            if (gamePlayers[playerId]) {
                gamePlayers[playerId].playerReady = status;
            }
            const all = Object.keys(gamePlayers).map(function (key, index) {
                return gamePlayers[key].playerReady
            });
            const amountOfReadyPlayers = all.filter(player => player).length ?? 0;
            // debugger;
            self.onSomePlayerReady(amountOfReadyPlayers, all.length);
        });

        // // ADDING NEW PLAYER WHEN ALREADY PLAYING AS ONE
        // self.socket.on("newPlayer", function (playerInfo) {
        //     addOtherPlayer(self, playerInfo);
        //     const amountOfReadyPlayers = self.allPlayers().filter(player => player.playerReady).length ?? 0;
        //     self.onPlayersCountUpdate(amountOfReadyPlayers, self.allPlayers().length);
        // });


        // REMOVING PLAYER THAT DISCONNECTED
        self.socket.on("disconnect", function () {
            if (self.otherPlayers.children) {
                self.getOtherPlayersChildren().forEach(function (otherPlayer: Player) {
                    otherPlayer.destroy();
                });
            }
            displayAmountOfReadyPlayers(self);
        });

        // RECEIVING INFO ABOUT MOVEMENT OF OTHER PLAYERS
        self.socket.on("playerMoved", function (playerInfo) {
            self.getOtherPlayersChildren().forEach(function (otherPlayer: Player) {
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
        self.socket.on("gameStatusChanged", function (data) {
            self.changeGameStatus(data)
        });

        // RECEIVING INFO ABOUT BIG BRUSH DEACTIVATION
        self.socket.on("bigBrushDeactivated", function (playerId) {
            self.waterDropSound.play();

            self.allPlayers().forEach((player) => {
                if (player.playerId === playerId) {
                    player.hasBigBrush = false;
                }
            })
        });

        // RECEIVING INFO ABOUT SHOE ACTIVATION
        self.socket.on("shoeActivated", function (playerId) {
            self.fastSound.play();

            self.allPlayers().forEach((player) => {
                if (player.playerId === playerId) {
                    player.speed = 2 * DEFAULT_SPEED;
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
            self.freezeSound.play();

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
            self.rockSound.play();

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

        // ADD PERK FOR ALL PLAYERS
        self.socket.on("perkDrop", function ({x, y, type: perkType}) {
            if (isGameRunning(self)) {
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
            }
        });

    }
}
