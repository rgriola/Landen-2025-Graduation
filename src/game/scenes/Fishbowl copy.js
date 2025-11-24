import { Scene } from 'phaser';

export class Fishbowl extends Scene {
    constructor() {
        super('Fishbowl');
        this.width = this.scale.gameSize.width;
        this.height = this.scale.gameSize.height;

        this.browserWidth = window.innerWidth;
        this.browserHeight = window.innerHeight;
        this.prevWidth = window.innerWidth;
        this.prevHeight = window.innerHeight;

        // FUll Screen Button
        this.fsBtn = null;

        // Video Object
        this.bgVideo = null;
        this.htmlVideo = null;
        
        // Resize info text
        this.resizeInfoText = null;

    }

    create() {
        // Add background video
        this.bgVideo = this.add.video(this.width / 2, this.height / 2, 'background_rivertimelapse');
        this.htmlVideo = this.bgVideo.video;
        
        console.log(`Fishbowl dimensions: ${this.width}x${this.height}`);

        // DEBUG LIVE VARIABLES
        this.resizeInfoText = this.add.text(20, 20, '', {
            fontSize: '30px',
            color: '#fff',
            backgroundColor: '#222',
            padding: { x: 8, y: 4 }
        }).setOrigin(0, 0).setDepth(1000);
        // Inital Set

        this.resizeInfoText.setText(
            `Display Size + Current Size: ${this.scale.displaySize.width} x ${this.scale.displaySize.height}\n` +
            `Inner size : ${this.prevWidth} x ${this.prevHeight}\n` +
            `Resized video to: ${this.htmlVideo.videoWidth} x ${this.htmlVideo.videoHeight}\n` +
            `Outer Window Size: ${window.outerWidth } x ${window.outerHeight}`
            );


         // FULL SCREEN BUTTON
        this.fsBtn = this.add.text(this.width - 40, 20, '⛶', {
            fontSize: '32px',
            color: '#FFD700',
            backgroundColor: '#222',
            padding: { x: 8, y: 4 }
        })
        .setOrigin(1, 0)
        .setInteractive({ useHandCursor: true });

        this.fsBtn.on('pointerup', () => {
            this.switchFullscreen();
        });

        var prevWidth = window.innerWidth;
        var prevHeight = window.innerHeight;

        window.addEventListener('resize', () => {
            const WnewWidth = window.outerWidth  //innerWidth;
            const HnewHeight = window.outerHeight //innerHeight;

            if (WnewWidth !== prevWidth || HnewHeight !== prevHeight) {
              //  console.log(`Window resized from ${prevWidth}x${prevHeight} to ${newWidth}x${newHeight}`);
                // Update previous size
                prevWidth = WnewWidth;
                prevHeight = HnewHeight;
                }
            
             // LIVE DIMENSIONS
            this.resizeInfoText.setText(
                `Display Size + Current Size: ${this.scale.displaySize.width} x ${this.scale.displaySize.height}\n` +
                `Previous size : ${this.prevWidth} x ${this.prevHeight}\n` +
                `Resized video to: ${this.htmlVideo.videoWidth} x ${this.htmlVideo.videoHeight}\n` +
                `New Window Size: ${WnewWidth} x ${HnewHeight}`
                );
        });
        
        // Play the video
       this.bgVideo.play(true);

        // Fullscreen with F key
        this.input.keyboard.on('keydown-F', () => {
            this.switchFullscreen();
        });
    }

    switchFullscreen() {
        if (!this.scale.isFullscreen) {
            this.scale.startFullscreen();
        } else {
            this.scale.stopFullscreen();
            }
    }
}