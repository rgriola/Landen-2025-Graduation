import { Scene } from 'phaser';
import { ASSETS } from '../assets.js';


export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

        init() {
        //  Progress bar setup
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);
        this.load.on('progress', (progress) => {
            bar.width = 4 + (460 * progress);
        });
        }

    preload() {

        // Use the preloadAll function to load all assets
        ASSETS.preloadAll(this);

        // Any additional assets not in the configuration
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
        this.load.image('fullscreen', 'full-screen.png');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.
        console.log('Preloader Create loaded!');
        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }

}
