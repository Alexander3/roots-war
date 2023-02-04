import Phaser from 'phaser'
import WebFont from 'webfontloader'
import brushStandard from "../assets/brushStandard.png";
import brushStandardSheet from "../assets/brushStandardSheet2.png";
import brushBig from "../assets/brushBig.png";
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
import tutorialImage from "../assets/images/gimp_intro.png";
import peacefulMusic from "../assets/sounds/peacful-music.mp3";

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
                families: ['severinaregular'],
                urls: ['./src/assets/fonts/chlorinar/stylesheet.css', './src/assets/fonts/severina/stylesheet.css']
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


        this.load.image("brushStandard", brushStandard);
        this.load.spritesheet("brushStandardSheet", brushStandardSheet,{frameHeight:32, frameWidth:32});
        this.load.image("brushBig", brushBig);
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

        this.load.audio('peaceful-music', peacefulMusic);

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
