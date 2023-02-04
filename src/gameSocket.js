import io from "socket.io-client";
import {addCurrentPlayer, addOtherPlayer} from "./players";
import {drawPlayerBrush} from "./brush";

export function createForServer(self) {
    self.socket = io.connect("http://localhost:8081");
    self.otherPlayers = self.physics.add.group();
    self.socket.on("currentPlayers", function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addCurrentPlayer(self, players[id]);
            } else {
                addOtherPlayer(self, players[id]);
            }
        });
    });
    self.socket.on("newPlayer", function (playerInfo) {
        addOtherPlayer(self, playerInfo);
    });
    self.socket.on("disconnect", function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });
    self.socket.on("playerMoved", function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                drawPlayerBrush(self, otherPlayer)
            }
        });
    });
    self.cursors = self.input.keyboard.createCursorKeys();

    self.blueScoreText = self.add.text(16, 16, "", {
        fontSize: "32px",
        fill: "#0000FF",
    });
    self.redScoreText = self.add.text(584, 16, "", {
        fontSize: "32px",
        fill: "#FF0000",
    });

    self.socket.on("scoreUpdate", function (scores) {
        self.blueScoreText.setText("Blue: " + scores.blue);
        self.redScoreText.setText("Red: " + scores.red);
    });

    self.socket.on("starLocation", function (starLocation) {
        if (self.star) self.star.destroy();
        self.star = self.physics.add.image(starLocation.x, starLocation.y, "star");
        self.physics.add.overlap(
            self.character,
            self.star,
            function () {
                self.character.player.collectBigBrush();
                self.socket.emit("starCollected");
            },
            null,
            this
        );
    });
}
