import Phaser from 'phaser'
import WebFont from 'webfontloader'
import rootStandardSheet from "../assets/images/root.png";
import rootBigSheet from "../assets/images/rootBig.png";
import vehicleImg1 from "../assets/vehicle1.png";
import vehicleImg2 from "../assets/vehicle2.png";
import vehicleImg3 from "../assets/vehicle3.png";
import vehicleImg4 from "../assets/vehicle4.png";
import vehicleImg5 from "../assets/vehicle5.png";
import vehicleImg6 from "../assets/vehicle6.png";

import enhanceScopeImage from "../assets/images/perks/improvement-enhance-signal.png";
import enhanceSpeedImage from "../assets/images/perks/improvement-increase-speed.png";
import disruptionNoSeedsImage from "../assets/images/perks/disruption-no-seeds.png";
import disruptionFreeze from "../assets/images/perks/disruption-freeze.png";
import fieldImage from "../assets/images/field.png";
import tutorialImage from "../assets/images/background.png";
import peacefulMusic from "../assets/sounds/peacful-music.mp3";
import freezeSound from "../assets/sounds/freeze.mp3";
import fastSound from "../assets/sounds/fast.mp3";
import waterDropSound from "../assets/sounds/water-drop.mp3";
import rockSound from "../assets/sounds/rock.mp3";
import resultsBackgroundImage from "../assets/images/results-background.png";

const vehicles = [
    vehicleImg1,
    vehicleImg2,
    vehicleImg3,
    vehicleImg4,
    vehicleImg5,
    vehicleImg6,
]

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
                families: ['Leaves', 'Floral'],
                urls: ['./src/assets/fonts/leaves/stylesheet.css', './src/assets/fonts/floral/stylesheet.css']
            },
            active: this.fontsLoaded
        });


        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();

        var width = this.cameras.main.width;
        var height = this.cameras.main.height;

        progressBox.fillStyle(0xffffff, 0.8);
        progressBox.fillRect(width / 2 - 320, 370, 640, 50);

        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 200,
            text: 'Loading...',
            style: {
                font: '32px monospace',
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 145,
            text: '0%',
            style: {
                font: '24px monospace',
                color: '#000000'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            percentText.setText((value * 100).toFixed(2) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 310, 380, 620 * value, 30);
        });

        this.load.on('complete', () => {
            loadingText.setText("Let's go!")
            setTimeout(() => {
                this.scene.start('Game');
            }, 400)
        });

        this.load.spritesheet("rootStandardSheet", rootStandardSheet, {frameWidth: 6, frameHeight: 176});
        this.load.spritesheet("rootBigSheet", rootBigSheet, {frameWidth: 6, frameHeight: 264});
        for (let a = 0; a < vehicles.length; a++) {
            this.load.spritesheet(`vehicle${a + 1}`, vehicles[a], {
                frameWidth: 178,
                frameHeight: 141,
            });
        }

        this.load.image('enhance-scope', enhanceScopeImage);
        this.load.image('enhance-speed', enhanceSpeedImage);
        this.load.image('disruption-no-seeds', disruptionNoSeedsImage);
        this.load.image('disruption-freeze', disruptionFreeze);
        this.load.image('field', fieldImage);
        this.load.image('tutorial', tutorialImage);
        this.load.image('results-background', resultsBackgroundImage);

        this.load.audio('peaceful-music', peacefulMusic);
        this.load.audio('freeze-sound', freezeSound);
        this.load.audio('fast-sound', fastSound);
        this.load.audio('water-drop-sound', waterDropSound);
        this.load.audio('rock-sound', rockSound);

        this.load.start();
    }


    update() {
        // if (this.fontsReady) {
        //     this.scene.start('Game');
        // }
    }

    fontsLoaded() {
        this.fontsReady = true
    }
}
