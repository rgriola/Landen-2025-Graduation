import { Scene } from 'phaser';

export class Fishbowl extends Scene {
    constructor() {
        super('Fishbowl');
        // Only initialize your own variables here
        this.fsBtn = null;
        this.bgVideo = null;
        this.htmlVideo = null;
        this.resizeInfoText = null;
    }

    create() {
        // Use Phaser's game size for all layout
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        // Add background video with error handling
        try {
            this.bgVideo = this.add.video(width / 2, height / 2, 'background_rivertimelapse');
            this.htmlVideo = this.bgVideo.video;
            
            // Handle case where video didn't load
            if (!this.htmlVideo) {
                console.warn('Background video failed to load - using fallback');
                this.bgVideo = null;
                this.htmlVideo = null;
            }
        } catch (error) {
            console.warn('Error creating background video:', error);
            this.bgVideo = null;
            this.htmlVideo = null;
        }

        // Info text for live display
        this.resizeInfoText = this.add.text(20, 20, '', {
            fontSize: '30px',
            color: '#fff',
            backgroundColor: '#222',
            padding: { x: 8, y: 4 }
        }).setOrigin(0, 0).setDepth(1000);

        // Fullscreen button
        this.fsBtn = this.add.text(width - 40, 20, '⛶', {
            fontSize: '32px',
            color: '#FFD700',
            backgroundColor: '#222',
            padding: { x: 8, y: 4 }
        })
        .setOrigin(1, 0)
        .setInteractive({ useHandCursor: true });

        this.fsBtn.on('pointerup', () => this.switchFullscreen());

         // Fullscreen button
        this.mainBtn = this.add.text(width - 40, 100, '[MAIN]', {
            fontSize: '40px',
            color: '#FFD700',
            align: 'center',
            backgroundColor: '#222222',
            padding: { x: 8, y: 4 }
        })
        .setOrigin(1, 0)
        .setDepth(1000)
        .setInteractive({ useHandCursor: true });
        this.mainBtn.on('pointerup', () => this.scene.start('MainMenu'));

        // Fullscreen with F key
        this.input.keyboard.on('keydown-F', () => this.switchFullscreen());

        // Phaser's resize event
        this.scale.on('resize', this.handleResize, this);

        // Play the video if it loaded successfully
        if (this.bgVideo) {
            this.bgVideo.play(true);
        }

    }

    handleResize() { // FOR DEBUGGIN
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        // Only resize video if it exists and loaded properly
        if (this.bgVideo && this.htmlVideo && this.htmlVideo.videoWidth && this.htmlVideo.videoHeight) {
            const videoRatio = this.htmlVideo.videoWidth / this.htmlVideo.videoHeight;
            const screenRatio = width / height;
            let videoWidth, videoHeight;
            if (screenRatio > videoRatio) {
                videoHeight = height;
                videoWidth = height * videoRatio;
            } else {
                videoWidth = width;
                videoHeight = width / videoRatio;
            }
            this.bgVideo.setPosition(width / 2, height / 2)
                        .setDisplaySize(videoWidth, videoHeight);
        } else if (this.bgVideo) {
            // If video exists but metadata not loaded, just center
            this.bgVideo.setPosition(width / 2, height / 2);
        }

        // Update live info text with safe property access
        const videoWidth = this.htmlVideo && this.htmlVideo.videoWidth ? this.htmlVideo.videoWidth : 'N/A';
        const videoHeight = this.htmlVideo && this.htmlVideo.videoHeight ? this.htmlVideo.videoHeight : 'N/A';
        
        this.resizeInfoText.setText(
            `Game Size: ${width} x ${height}\n` +
            `Display Size: ${this.scale.displaySize.width} x ${this.scale.displaySize.height}\n` +
            `Video natural: ${videoWidth} x ${videoHeight}\n` +
            `Window: ${window.innerWidth} x ${window.innerHeight}`
        );
    }

    switchFullscreen() {
        if (!this.scale.isFullscreen) {
            this.scale.startFullscreen();
        } else {
            this.scale.stopFullscreen();
        }
    }
}