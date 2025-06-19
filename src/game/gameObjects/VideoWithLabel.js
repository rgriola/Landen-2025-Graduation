import { FONTS } from '../config/fonts.js';

export class VideoWithLabel extends Phaser.GameObjects.Container {
    constructor(scene, x, y, videoKey, videoWithLabelId, options = {}) {
        super(scene, x, y);

        this.id = videoWithLabelId;
        this.scene = scene;
        this.options = options;

        // Create the video
        this.video = scene.add.video(0, 0, videoKey);
        
        // Set video options
        if (options.scale) this.video.setScale(options.scale);
        this.video.setLoop(options.loop !== false); // Loop by default unless specified false
        this.video.setMute(options.mute !== false); // Mute by default unless specified false
        
        // Auto play when on screen
        if (options.autoPlay !== false) {
            this.video.play();
        }

        // Create the label text
        this.nameText = scene.add.text(
            0,
            this.video.displayHeight / 2 - 10 + (options.textOffsetY || 0),
            options.labelPrefix || videoKey,
            FONTS.styles.imageLabelA
        ).setOrigin(0.5, 0);

        // DEBUG TEXT
        this.debugText = scene.add.text(
            0,
            this.video.displayHeight / 2 + 60 + (options.textOffsetY || 0),
            '',
            FONTS.styles.debug
        ).setOrigin(0.5, 0).setVisible(!!options.debugMode);
        
        // Add all to the container
        this.add([this.video, this.nameText, this.debugText]);

        // Add particles if enabled
        if (options.particles !== false) {
            this.particles = scene.add.particles(0,
                this.video.displayHeight / 2 - 50,
                'red_particle', {
                    color: [0x040d61, 0xfacc22, 0xf89800, 0xf83600, 0x9f0404, 0x4b4a4f, 0x353438, 0x040404],
                    angle: { min: -100, max: -300 },
                    scale: 1,
                    speed: { min: 25, max: 200 },
                    advance: 5000,
                    blendMode: 'ADD'
                });
            
            // ADDS THE PARTICLES TO THE BOTTOM
            this.addAt(this.particles, 0);
        }
        
        // Add the container to the scene
        scene.add.existing(this);

        // Store speed if needed
        this.speed = options.speed || 2;
        
        // DO NOT REMOVE
        console.log(`VideoWithLabel ${this.id} created at (${x}, ${y}) with video ${videoKey}`);
        
        // Handle visibility changes to pause/play video
        this.on('visible', this.handleVisibilityChange, this);
        
        // Setup video visibility management
        this.setupVisibilityMonitoring();
    }
    
    setupVisibilityMonitoring() {
        // Monitor if component is on screen and manage playback
        this.scene.events.on('update', this.checkVisibility, this);
    }
    
    checkVisibility() {
        // Simple check if this object is visible on screen
        const cameraView = this.scene.cameras.main.worldView;
        
        const isVisible = (
            this.x + this.video.displayWidth/2 >= cameraView.x &&
            this.x - this.video.displayWidth/2 <= cameraView.x + cameraView.width &&
            this.y + this.video.displayHeight/2 >= cameraView.y &&
            this.y - this.video.displayHeight/2 <= cameraView.y + cameraView.height
        );
        
        // Only play when visible on screen
        if (isVisible && !this.video.isPlaying() && this.visible) {
            this.video.play();
            if (this.debugText.visible) {
                this.debugText.setText('PLAYING');
            }
        } else if (!isVisible && this.video.isPlaying()) {
            this.video.pause();
            if (this.debugText.visible) {
                this.debugText.setText('PAUSED');
            }
        }
    }
    
    handleVisibilityChange(visible) {
        if (visible) {
            this.checkVisibility(); // Will play if on screen
        } else {
            this.video.pause();
        }
    }

    setPosition(x, y) {
        super.setPosition(x, y);
        return this;
    }

    setDebugVisible(visible) {
        this.debugText.setVisible(visible);
    }

    setVisible(visible) {
        super.setVisible(visible);
        // Pause video if hidden
        if (!visible && this.video.isPlaying()) {
            this.video.pause();
        } else if (visible) {
            this.checkVisibility();
        }
        return this;
    }

    destroy(fromScene) {
        // Clean up event listeners
        this.scene.events.off('update', this.checkVisibility, this);
        this.off('visible', this.handleVisibilityChange, this);
        
        // Stop video playback
        this.video.stop();
        
        // This will destroy the container and all its children
        super.destroy(fromScene);
        
        if (this.particles) {
            this.particles.destroy();
        }
        
        console.log(`VideoWithLabel ${this.id} destroyed`);
    }
    
    // Video specific methods
    play() {
        this.video.play();
        return this;
    }
    
    pause() {
        this.video.pause();
        return this;
    }
    
    stop() {
        this.video.stop();
        return this;
    }
    
    setVolume(volume) {
        this.video.setVolume(volume);
        return this;
    }
    
    setMute(mute) {
        this.video.setMute(mute);
        return this;
    }
    
    setLoop(loop) {
        this.video.setLoop(loop);
        return this;
    }
}