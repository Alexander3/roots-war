import Phaser from 'phaser'
import WebFont from 'webfontloader'
import brushStandard from "../assets/brushStandard.png";
import brushBig from "../assets/brushBig.png";
import characterImg1 from "../assets/vehicle1.png";
import characterImg2 from "../assets/vehicle2.png";
import characterImg3 from "../assets/vehicle3.png";
import characterImg4 from "../assets/vehicle4.png";
import enhanceScopeImage from "../assets/images/perks/improvement-enhance-signal.png";
import enhanceSpeedImage from "../assets/images/perks/improvement-increase-speed.png";
import disruptionNoSeedsImage from "../assets/images/perks/disruption-no-seeds.png";
import disruptionFreeze from "../assets/images/perks/disruption-freeze.png";
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
        this.load.spritesheet("character1", characterImg1, {
            frameWidth: 178,
            frameHeight: 141,
        });
        this.load.spritesheet("character2", characterImg2, {
            frameWidth: 178,
            frameHeight: 141,
        });
        this.load.spritesheet("character3", characterImg3, {
            frameWidth: 178,
            frameHeight: 141,
        });
        this.load.spritesheet("character4", characterImg4, {
            frameWidth: 178,
            frameHeight: 141,
        });
        this.load.image('enhance-scope', enhanceScopeImage);
        this.load.image('enhance-speed', enhanceSpeedImage);
        this.load.image('disruption-no-seeds', disruptionNoSeedsImage);
        this.load.image('disruption-freeze', disruptionFreeze);
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
