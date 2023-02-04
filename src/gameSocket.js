import io from "socket.io-client";
import {addCurrentPlayer, addOtherPlayer} from "./players";
import {drawPlayerBrush} from "./brush";

export function createForServer(self) {
    self.socket = io.connect("http://localhost:8081");
    self.otherPlayers = self.physics.add.group();
    self.allPlayers = () => {
        return [self.character, ...self.otherPlayers.getChildren()];
    }

    // ADDING EXISTING PLAYERS WHEN JOINING AS NEW PLAYER
    self.socket.on("currentPlayers", function (players) {
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

    // RECEIVING INFO ABOUT BIG BRUSH DEACTIVATION
    self.socket.on("bigBrushDeactivated", function (playerId) {
        self.allPlayers().forEach((sprite) => {
            if (sprite.player.playerId === playerId) {
                sprite.player.hasBigBrush = false;
            }
        })
    });

    // CREATING INPUT CONTROLS FOR CURRENT PLAYER
    self.cursors = self.input.keyboard.createCursorKeys();

    self.blueScoreText = self.add.text(16, 16, "", {
        fontSize: "32px",
        fill: "#0000FF",
    });
    self.redScoreText = self.add.text(584, 16, "", {
        fontSize: "32px",
        fill: "#FF0000",
    });

    // UPDATE STATISTICS FOR ALL PLAYERS
    self.socket.on("scoreUpdate", function (scores) {
        self.blueScoreText.setText("Blue: " + scores.blue);
        self.redScoreText.setText("Red: " + scores.red);
    });

    // ADD PERK FOR ALL PLAYERS
    self.socket.on("starLocation", function (starLocation) {
        if (self.star) {
            self.star.destroy();
        }

        // add perk image
        self.star = self.physics.add.image(starLocation.x, starLocation.y, "star");

        // setup collection logic on collision between player sprinte and perk sprite
        self.physics.add.overlap(
            self.character,
            self.star,
            function () {
                // self.character.player.collectBigBrush();
                self.socket.emit("starCollected");
            },
            null,
            this
        );
    });
}
