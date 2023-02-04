import io from "socket.io-client";
import brush from "../assets/brush.png";
import characterImg from "../assets/character-rotated.png";
import logoStar from "../assets/star_gold.png";

export default class extends Phaser.Scene {
  constructor() {
    super({
      key: "Game",
    });

    this.velocity = 100;
  }

  preload() {
    this.load.image("brush", brush);
    this.load.spritesheet("character", characterImg, {
      frameWidth: 36,
      frameHeight: 32,
    });

    this.load.image('star', logoStar);
  }

  create() {
    createForServer(this);

    this.surface = this.add.renderTexture(0, 0, this.game.config.width, this.game.config.height);

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("character"),
      frameRate: 3,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors.left.isDown) {
      this.character.angle -= 1;
    } else if (this.cursors.right.isDown) {
      this.character.angle += 1;
    }

    if (this.character) {
      this.character.body.velocity = this.physics.velocityFromAngle(
        this.character.angle,
        this.velocity
      );

      this.surface.draw(
        "brush",
        this.character.x - this.character.width / 2,
        this.character.y - this.character.height / 2
      );

      this.physics.world.wrap(this.character, 32);

      // emit player movement
      var x = this.character.x;
      var y = this.character.y;
      var r = this.character.rotation;
      if (
        this.character.oldPosition &&
        (x !== this.character.oldPosition.x ||
          y !== this.character.oldPosition.y ||
          r !== this.character.oldPosition.rotation)
      ) {
        this.socket.emit("playerMovement", {
          x,
          y,
          rotation: r,
        });
      }
      // save old position data
      this.character.oldPosition = {
        x: this.character.x,
        y: this.character.y,
        rotation: this.character.rotation,
      };
    }
  }
}

function addPlayer(self, playerInfo) {
  self.character = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, "character")
    .setOrigin(0.5, 0.5)
    .setDisplaySize(53, 40);

  self.character.play({ key: "walk", repeat: -1 });

  self.character.setAngle(45);
  self.character.body.velocity = self.physics.velocityFromAngle(
    self.character.angle,
    self.velocity
  );

  if (playerInfo.team === "blue") {
    self.character.setTint(0x0000ff);
  } else {
    self.character.setTint(0xff0000);
  }
}

function createForServer(self) {
  self.socket = io.connect("http://localhost:8081");
  self.otherPlayers = self.physics.add.group();
  self.socket.on("currentPlayers", function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  self.socket.on("newPlayer", function (playerInfo) {
    addOtherPlayers(self, playerInfo);
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
        self.socket.emit("starCollected");
      },
      null,
      this
    );
  });
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add
    .sprite(playerInfo.x, playerInfo.y, "character")
    .setOrigin(0.5, 0.5)
    .setDisplaySize(53, 40);
  if (playerInfo.team === "blue") {
    otherPlayer.setTint(0x0000ff);
  } else {
    otherPlayer.setTint(0xff0000);
  }
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}
