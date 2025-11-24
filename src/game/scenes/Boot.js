import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        // Load essential assets needed by other scenes
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
        this.load.image('fullscreen', 'full-screen.png');
        
        // Set up loading progress
        this.load.on('progress', (progress) => {
            console.log('Boot loading progress:', Math.round(progress * 100) + '%');
        });
    }

    create ()
    {
        console.log('Boot scene: Essential assets loaded');
        this.scene.start('Preloader');
    }
}
