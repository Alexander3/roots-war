import brush from "../assets/brush.png";
import brush2 from "../assets/brush2.png";
import characterImg from "../assets/character-rotated.png";
import logoStar from "../assets/star_gold.png";
import {drawPlayerBrush} from "../brush";
import {createForServer} from "../gameSocket";

export default class extends Phaser.Scene {
    constructor() {
        super({
            key: "Game",
        });

        this.velocity = 300;
    }

    preload() {
        this.load.image("brush", brush);
        this.load.image("brush2", brush2);
        this.load.spritesheet("character", characterImg, {
            frameWidth: 36,
            frameHeight: 32,
        });

        this.load.image('star', logoStar);
    }

    create() {
        createForServer(this);

        this.surface = this.add.renderTexture(0, 0, this.game.config.width, this.game.config.height);
        const bigBrush = this.add.image(64, 64, 'brush2');
        bigBrush.setOrigin(0.5, 0.5)
        // bigBrush.scale = 2; // Resize the image
        this.bigBrush = bigBrush;

        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("character"),
            frameRate: 3,
        });

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.cursors.left.isDown) {
            this.character.angle -= 4;
        } else if (this.cursors.right.isDown) {
            this.character.angle += 4;
        }

        if (this.character) {
            this.character.player.update();
            this.character.body.velocity = this.physics.velocityFromAngle(
                this.character.angle,
                this.velocity
            );
            drawPlayerBrush(this, this.character)

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
