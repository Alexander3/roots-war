import Phaser from 'phaser'
import WebFont from 'webfontloader'
import brushStandard from "../assets/brushStandard.png";
import brushBig from "../assets/brushBig.png";
import characterImg from "../assets/vehicle3.png";
import logoStar from "../assets/images/star-gold.png";
import shoeImage from "../assets/images/apple.png";
import clockImage from "../assets/images/clock.png";
import noPaintImage from "../assets/images/no-paint.png";
import tutorial from "../assets/images/apple.png";

export default class extends Phaser.Scene {
    fontsReady: boolean;

    constructor() {
        super({
            key: "Boot"
        });
    }

    init() {
        this.fontsReady = false;
        this.fontsLoaded = this.fontsLoaded.bind(this);
    }

    preload() {
        WebFont.load({
            google: {
                families: ['Baloo Da']
            },
            custom: {
                families: ['severinaregular'],
                urls: ['./src/assets/fonts/chlorinar/stylesheet.css', './src/assets/fonts/severina/stylesheet.css']
            },
            active: this.fontsLoaded
        });


        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();

        var width = this.cameras.main.width;
        var height = this.cameras.main.height;

        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, 370, 320, 50);

        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
            }
        });
        percentText.setOrigin(0.5, 0.5);

        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px monospace',
            }
        });
        assetText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            percentText.setText(value * 100 + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 160, 380, 300 * value, 30);
        });

        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading asset: ' + file.key);
        });
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });


        this.load.image("brushStandard", brushStandard);
        this.load.image("brushBig", brushBig);
        this.load.spritesheet("character", characterImg, {
            frameWidth: 178,
            frameHeight: 141,
        });
        this.load.image('star', logoStar);
        this.load.image('shoe', shoeImage);
        this.load.image('clock', clockImage);
        this.load.image('no-paint', noPaintImage);
        this.load.image('tutorial', tutorial);
    }


    update() {
        if (this.fontsReady) {
            this.scene.start('Game');
        }
    }

    fontsLoaded() {
        this.fontsReady = true
    }
}
