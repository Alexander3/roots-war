import {drawPlayerBrush} from "../brush";
import {createForServer, GameStatus, initPlayers} from "../gameSocket";
import {Player} from "../player";
import {TEXT_STYLES} from "../constants";
import isMobile from "ismobilejs";
import {getFrameRate} from "../utils";
import {GameSceneKeys} from "../index";

interface IGameStatusData {
    gameStatus: GameStatus;
    data: any;
}

export default class extends Phaser.Scene {
    speed: number;
    surface: Phaser.GameObjects.RenderTexture;
    tutorial: Phaser.GameObjects.Sprite;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    gameStatus: GameStatus;
    spaceKey: Phaser.Input.Keyboard.Key;
    socket: any;
    promptText: Phaser.GameObjects.Text;
    promptTween: Phaser.Tweens.Tween;
    perk: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    otherPlayers: Phaser.Physics.Arcade.Group;
    mainPlayer: Player;

    allPlayers: () => Player[];
    getOtherPlayersChildren: () => Player[];
    standardBrush: Phaser.GameObjects.Image;
    bigBrush: Phaser.GameObjects.Image;
    timeText: Phaser.GameObjects.Text;
    endTime: number;
    peacefulMusic: Phaser.Sound.BaseSound;
    freezeSound: Phaser.Sound.BaseSound;
    fastSound: Phaser.Sound.BaseSound;
    waterDropSound: Phaser.Sound.BaseSound;
    rockSound: Phaser.Sound.BaseSound;
    titleText: Phaser.GameObjects.Text;
    playerNameText: Phaser.GameObjects.Text;
    readyPlayersText: Phaser.GameObjects.Text;
    mobileInstructionTextLeft: Phaser.GameObjects.Text;
    mobileInstructionTextRight: Phaser.GameObjects.Text;
    mobileInstructionDivider: Phaser.GameObjects.Line;

    constructor() {
        super({
            key: GameSceneKeys.Game,
        });
    }


    create() {
        this.gameStatus = GameStatus.Waiting;
        this.otherPlayers = this.physics.add.group();
        createForServer(this);
        const w = this.game.config.width as number;
        const h = this.game.config.height as number;

        this.add.tileSprite(w / 2, h / 2, 1920, 1080, "field");

        this.surface = this.add.renderTexture(0, 0, w, h);

        this.anims.create({
            key: "move",
            frames: this.anims.generateFrameNumbers("rootStandardSheet", {}),
            frameRate: getFrameRate(),
            repeat: -1,
        });

        this.physics.world.setFPS(getFrameRate())

        this.standardBrush = this.add
            .sprite(100, 100, "rootStandardSheet")
            .setVisible(false)
            .setOrigin(0.5, 0.5)
            .play("move");

        this.anims.create({
            key: "moveBig",
            frames: this.anims.generateFrameNumbers("rootBigSheet", {}),
            frameRate: getFrameRate(),
            repeat: -1,
        });

        this.bigBrush = this.add
            .sprite(100, 100, "rootBigSheet")
            .setVisible(false)
            .setOrigin(0.5, 0.5)
            .play("moveBig");

        this.timeText = this.add.text(w / 2, h - 30, "", TEXT_STYLES.textStyle);
        this.timeText.setOrigin(0.5, 0.5);

        this.tutorial = this.add.sprite(w / 2, h / 2, "tutorial");

        this.promptText = this.make
            .text({
                x: w / 2,
                y: h / 2 + 100,
                text: "Press spacebar if you are ready to play!",
                style: TEXT_STYLES.mediumTextStyle,
            })
            .setOrigin(0.5, 0.5);

        this.promptTween = this.tweens.add({
            targets: this.promptText,
            props: {
                scale: {
                    value: 1.05,
                    duration: 1000,
                    ease: 'Power1',
                    yoyo: true,
                    repeat: -1
                },
            }
        });

        this.titleText = this.make
            .text({
                x: w / 2,
                y: h / 5,
                text: "Siblings in soil",
                style: {
                    ...TEXT_STYLES.extraLargeTextStyle,
                    fill: "#0aafa9",
                    stroke: "#390041",
                } as any,
            })
            .setOrigin(0.5, 0.5);

        this.playerNameText = this.make
            .text({
                x: w / 2,
                y: h - h / 2,
                text: ``,
                style: TEXT_STYLES.bigTextStyle,
            })
            .setOrigin(0.5, 0.5);

        this.readyPlayersText = this.make
            .text({
                x: w / 2,
                y: h / 2 + 300,
                text: `Players ready: 0`,
                style: TEXT_STYLES.bigTextStyle,
            })
            .setOrigin(0.5, 0.5);


        const gradient = this.titleText.context.createLinearGradient(0, 0, 0, this.titleText.height);
        gradient.addColorStop(0, '#0aafa9');
        gradient.addColorStop(.3, '#dddddd');
        gradient.addColorStop(1, '#390041');
        this.titleText.setFill(gradient);


        this.mobileInstructionTextLeft = this.add
            .text(
                w / 4,
                h / 2,
                "Touch to turn left",
                TEXT_STYLES.mobileInstructionTextStyle
            )
            .setOrigin(0.5, 0.5)
            .setAlpha(0);

        this.mobileInstructionTextRight = this.add
            .text(
                (w * 3) / 4,
                h / 2,
                "Touch to turn right",
                TEXT_STYLES.mobileInstructionTextStyle
            )
            .setOrigin(0.5, 0.5)
            .setAlpha(0);

        this.mobileInstructionDivider = this.add.line(w / 2, h / 2, 0, 0, 0, h - 200, 0xffffff, 0).setLineWidth(10).setOrigin(0.5, 0.5)

        this.spaceKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        // CREATING INPUT CONTROLS FOR CURRENT PLAYER
        this.cursors = this.input.keyboard.createCursorKeys();

        this.peacefulMusic = this.sound.add("peaceful-music");
        this.freezeSound = this.sound.add("freeze-sound");
        this.fastSound = this.sound.add("fast-sound");
        this.waterDropSound = this.sound.add("water-drop-sound");
        this.rockSound = this.sound.add("rock-sound");
        this.peacefulMusic.play();
    }

    onMainPlayerJoined(mainPlayer) {
        this.playerNameText
            .setText(`Hello, ${mainPlayer.playerName}`)
    }

    onSomePlayerReady(amountOfReadyPlayers = 0, allPlayersCount = 0) {
        const text = this.readyPlayersText;
        const {visible} = text;
        visible && this.readyPlayersText.setText(`Players ready: ${amountOfReadyPlayers}/${allPlayersCount}`)
    }

    onPlayersCountUpdate(amountOfReadyPlayers = 0, allPlayersCount = 0) {
        const text = this.readyPlayersText;
        const {visible} = text;
        visible && text.setText(`Players ready: ${amountOfReadyPlayers}/${allPlayersCount}`)
    }

    changeGameStatus({gameStatus, data}) {
        const prevStatus = this.gameStatus;
        if (this.gameStatus !== gameStatus) {
            this.gameStatus = gameStatus;
            const w = this.game.config.width as number;
            const h = this.game.config.height as number;

            if (gameStatus === GameStatus.Start) {
                initPlayers(this)
                this.tutorial.destroy();
                this.promptText.destroy();
                this.titleText.destroy();
                this.readyPlayersText.destroy();
                this.playerNameText
                    .setOrigin(1, 0.5)
                    .setText(this.mainPlayer.playerName)
                    .setPosition(w - 10, 60)
                    .setTint(this.mainPlayer.brushColor);
                this.endTime = data.endTime || Date.now() + 6000;
                this.mainPlayer.startGame(this);
                this.mainPlayer.startActivePlayer(this);
                this.allPlayers().forEach((player) => {
                    player.startGame(this);
                });

                if (isMobile().any) {
                    this.mobileInstructionTextRight.setAlpha(0.3);
                    this.mobileInstructionTextLeft.setAlpha(0.3);
                    this.mobileInstructionDivider.setStrokeStyle(20, 0xffffff, 0.3);
                    setTimeout(() => {
                        this.mobileInstructionTextRight.destroy();
                        this.mobileInstructionTextLeft.destroy();
                        this.mobileInstructionDivider.destroy();
                    }, 5000);
                }
            } else if (gameStatus === GameStatus.Finished) {
                if (prevStatus === GameStatus.Start) {
                    this.mainPlayer.stopGame();
                    this.allPlayers().forEach((player) => {
                        player.stopGame();
                    });
                    const p = this.allPlayers().map((player) => ({
                        playerId: player.playerId,
                        playerName: player.playerName,
                        brushColorObj: player.brushColorObj,
                        brushColor: player.brushColor
                    }));
                    this.mainPlayer.playerReady = false;
                    this.surface.snapshot((snapshot) => {
                        this.peacefulMusic.stop()
                        this.otherPlayers.destroy()
                        this.scene.start(GameSceneKeys.Scores, {
                            players: p,
                            surfaceSnapshot: snapshot,
                            socket: this.socket
                        });
                    });
                } else {
                    this.socket.emit("playerReady", false);
                    this.scene.restart();
                }
            }
        }
    }

    isTouchingHalfOfScreen(whichHalf: string) {
        if (!this.input.activePointer.isDown) {
            return false;
        }

        if (
            whichHalf === "left" &&
            this.input.activePointer.x <= (this.game.config.width as number) / 2
        ) {
            return true;
        } else if (
            whichHalf === "right" &&
            this.input.activePointer.x > (this.game.config.width as number) / 2
        ) {
            return true;
        }

        return false;
    }

    update(time, delta) {
        if (this.gameStatus === GameStatus.Waiting) {
            if ((this.spaceKey.isDown || this.input.activePointer.isDown) && !this.mainPlayer.playerReady) {
                this.socket.emit("playerReady", true);
                this.mainPlayer.playerReady = true;
                this.promptText.setText("Waiting for other players!");
                this.promptTween.stop();
            }
        } else if (this.gameStatus === GameStatus.Finished) {
            return
        } else {
            if (this.endTime) {
                const timeRemaining = Math.ceil((this.endTime - Date.now()) / 1000);
                this.timeText.text =
                    timeRemaining >= 0 ? `${timeRemaining} seconds remaining` : "";
            }

            if (this.cursors.left.isDown || this.isTouchingHalfOfScreen('left')) {
                this.mainPlayer.angle -= 4;
            } else if (this.cursors.right.isDown || this.isTouchingHalfOfScreen('right')) {
                this.mainPlayer.angle += 4;
            }

            if (this.mainPlayer) {
                this.mainPlayer.update();
                // if (Math.round(time / 2000) % 10 === 0) {
                //   calculateScores(this.surface, this.allPlayers())
                // }
                const velocity = this.physics.velocityFromAngle(
                    this.mainPlayer.angle,
                    this.mainPlayer.speed
                );

                this.mainPlayer.setVelocity(velocity.x, velocity.y);
                drawPlayerBrush(this, this.mainPlayer);

                this.physics.world.wrap(this.mainPlayer, 32);

                // emit player movement
                var x = this.mainPlayer.x;
                var y = this.mainPlayer.y;
                var r = this.mainPlayer.rotation;
                if (
                    this.mainPlayer.oldPosition &&
                    (x !== this.mainPlayer.oldPosition.x ||
                        y !== this.mainPlayer.oldPosition.y ||
                        r !== this.mainPlayer.oldPosition.rotation)
                ) {
                    this.socket.emit("playerMovement", {
                        x,
                        y,
                        rotation: r,
                        hasBigBrush: this.mainPlayer.hasBigBrush,
                    });
                }
                // save old position data
                this.mainPlayer.oldPosition = {
                    x: this.mainPlayer.x,
                    y: this.mainPlayer.y,
                    rotation: this.mainPlayer.rotation,
                };
            }
        }
    }
}
