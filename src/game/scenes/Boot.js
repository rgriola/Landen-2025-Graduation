import { Scene } from 'phaser';
import { PATH_UTILS } from '../config/paths.js';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        // Load essential assets needed by other scenes using centralized paths
        this.load.image('background', PATH_UTILS.getRootAssetUrl('bg.png'));
        this.load.image('logo', PATH_UTILS.getRootAssetUrl('logo.png'));
        this.load.image('fullscreen', PATH_UTILS.getRootAssetUrl('full-screen.png'));
        
        console.log('Boot scene: Loading essential assets from:', PATH_UTILS.isDevelopment() ? 'Local Dev' : 'Production');
        
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
