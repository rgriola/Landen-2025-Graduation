import { Scene } from 'phaser';
import { FONTS } from '../config/fonts';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const halfX = this.scale.width / 2;
        const halfY = this.scale.height / 2;

        // BACKGROUND
        this.add.image(halfX, halfY, 'background')
        .setOrigin(0.5, 0.5)
        .setScale(3);

        this.add.image(halfX, halfY - 300, 'logo');

       // Welcome text
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 150, 'Welcome to the Art Simulation', {
            fontSize: '40px',
            color: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Start Game button
        const startText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Launch Project', {
            fontSize: '32px',
            color: '#FFD700',
            fontFamily: 'Arial',
            backgroundColor: '#222',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startText.on('pointerup', () => {
            this.scene.start('Game');
        });

        // Asset Gallery button
        const galleryText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 80, 'Gallery', {
            fontSize: '28px',
            color: '#00FFAA',
            fontFamily: 'Arial',
            backgroundColor: '#222',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        galleryText.on('pointerup', () => {
            this.scene.start('AssetGallery');
        });

        // Asset Gallery button
        const fishBowlText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 160, 'Fishbowl', {
            fontSize: '28px',
            color: '#00FFAA',
            fontFamily: 'Arial',
            backgroundColor: '#222',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        fishBowlText.on('pointerup', () => {
            this.scene.start('Fishbowl');
        });

        // Optional: Keyboard support
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('Game');
        });
    }
}
