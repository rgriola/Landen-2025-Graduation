import { Scene } from 'phaser';
import { ImageWithLabel } from '../gameObjects/ImageWithLabel.js';
import { ASSETS } from '../assets.js';
import { FONTS } from '../config/fonts.js';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.activeImages = [];
        this.imageConfigs = ASSETS.images; // Use the image configurations from assets.js
        this.pendingImages = [...this.imageConfigs]; // Make a copy to work with
        
        this.identifier = 0; // Unique identifier for images
    
    }

    create() {

         // PWA INSTALL RUNNING CHECK
        const isStandalone = window.navigator.standalone || 
                            window.matchMedia('(display-mode: standalone)').matches;
        
        if (!isStandalone && !this.hasShownInstallPrompt) {
            // Show instruction to add to home screen
            const text = this.add.text(
                this.cameras.main.centerX, 
                this.cameras.main.height - 50, 
                'Add to Home Screen for fullscreen experience',
                 FONTS.getStyle('subtitle', { color: FONTS.colors.gold })
                ).setOrigin(0.5).setDepth(1000);
            
                this.tweens.add({
                    targets: text,
                    alpha: { from: 1, to: 0 },
                    duration: 3000,
                    ease: 'Power2',
                    delay: 5000
                });
            
            this.hasShownInstallPrompt = true;
        }

         // Add full screen button
        const fullScreenButton = this.add.image(this.scale.width - 16, 16, 'fullscreen-icon')
            .setOrigin(1, 0)
            .setInteractive()
            .setScale(0.5)
            .setDepth(1000);

        // Handle clicks on the button
        fullScreenButton.on('pointerup', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        // ADD RESIZE HANDLING HERE
            window.addEventListener('resize', () => {
                this.scale.refresh();
                
                // If you need to reposition elements after resize
                this.repositionElements();
            });

        // Improved full screen handling
        this.input.keyboard.on('keydown-F', () => {
            this.toggleFullscreen();
            });

        // Listen for both entering and exiting fullscreen
        this.scale.on('enterfullscreen', this.onEnterFullScreen, this);
        this.scale.on('leavefullscreen', this.onLeaveFullScreen, this);

        // BACKGROUND MUSIC
        this.backgroundMusic = this.sound.add('backgroundMusic', {
            volume: 0.5,
            loop: true
        });
        this.backgroundMusic.play();

        // Calculate video dimensions to maintain aspect ratio
        const screenWidth = this.scale.width;    // 
        const screenHeight = this.scale.height;  // 
        
        // For a 16:9 video in a 4:3 container, we'll set the width to match
        // and let the height be calculated based on 16:9 aspect ratio
        const videoWidth = screenWidth;          // 
        const videoHeight = videoWidth * (9/16); // 
        
        // LOAD VIDEO BACKGROUND  
        this.video = this.add.video(screenWidth/2, screenHeight/2, 'background_rivertimelapse')
       // .setDisplaySize(videoWidth, videoHeight)
        .setScale(1)
        .setOrigin(0.5, 0.5)
        .setDepth(0)
        .setMute(true)
        .setAlpha(0.8); // Slightly transparent

        this.video1 = this.add.video(screenWidth/2, screenHeight/2, 'background_Puffins')
       // .setDisplaySize(videoWidth, videoHeight)
        .setScale(1)
        .setOrigin(0.5, 0.5)
        .setDepth(0)
        .setMute(true)
        .setAlpha(0.8); // Slightly transparent

        
        // MISSING: You need to play the video
        this.video.play(true); // The 'true' parameter enables looping

        // When ready to transition:
        this.tweens.add({
            targets: this.video,
            alpha: 0,
            duration: 1000,
            delay: 5000,
            onComplete: () => {
                this.video.stop();
                this.video1.play(true);
                this.tweens.add({
                    targets: this.video1,
                    alpha: 1,
                   // duration: 500,
                    ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                    duration: 1000,
                    repeat: -1,            // -1: infinity
                    yoyo: false,
                });
            }
        });
        /*
        // When ready to transition:
        this.tweens.add({
            targets: this.video1,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.video1.stop();
                this.video.play(true);
                this.tweens.add({
                    targets: this.video,
                    alpha: 1,
                    duration: 500
                });
            }
        });*/



        this.cameras.main.setBackgroundColor(0x0088FF);

        // Add space bar to navigate to GameOver scene - no visual hint
        this.spaceKey = this.input.keyboard.addKey('SPACE');

        //TRANSITION TO GAME OVER SCENE
        this.input.once('pointerdown', () => {
            this.scene.start('GameOver');
        });

        // D KEY 
        this.debugSetup();

        // Schedule the first image
        this.scheduleNextImage();
    }


    update() {
            // Move all active images
            for (const imageObj of this.activeImages) {
                this.moveImageWithLabel(imageObj, imageObj.speed);
            }
        }

     debugSetup(){
        // Add debug key
        this.debugKey = this.input.keyboard.addKey('D');
        // Initialize debug mode (off by default)
        this.debugMode = false;
        
        // Setup debug mode toggle
        this.input.keyboard.on('keydown-D', () => {
            this.debugMode = !this.debugMode;
            
            // Update all existing images
            for (const imageObj of this.activeImages) {
                imageObj.setDebugVisible(this.debugMode);
            }
        });

     }

    toggleFullscreen() {
    if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
    } else {
        this.scale.startFullscreen();
        }
    }

    onEnterFullScreen() {
        // Force a resize and reposition when entering fullscreen
        this.scale.refresh();
    
        // Give the browser a moment to adjust before repositioning elements
        this.time.delayedCall(200, () => {
            this.repositionElements();
        });
    }

    onLeaveFullScreen() {
        // Force a resize and reposition when exiting fullscreen
        this.scale.refresh();
        
        // Give the browser a moment to adjust before repositioning elements
        this.time.delayedCall(200, () => {
            this.repositionElements();
        });
    }

    repositionElements() {
        // Reposition and resize all your game elements
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Recalculate video dimensions and position
        if (this.video) {
            const videoWidth = width;
            const videoHeight = videoWidth * (9/16); // Assuming 16:9 video
            
            this.video
                .setPosition(width/2, height/2)
                .setDisplaySize(videoWidth, videoHeight);
        }
    
            // Reposition any other UI elements
            // ...
            
            // If you have background elements or containers, update them too
            // ...
            
            // Force the scene to redraw
            this.scene.restart();
        }

    scheduleNextImage() {
        // Get a random delay between 1-5 seconds
        const delay = Phaser.Math.Between(1000, 5000);
        
        // Schedule next image creation
        this.time.delayedCall(delay, () => {
            this.createRandomImage();
            // Schedule the next one
            this.scheduleNextImage();
        });
    }

    createRandomImage() {
        if (this.pendingImages.length === 0) {
            this.pendingImages = [...this.imageConfigs];
        }
        
        // Get a random config from the pending list
        const randomIndex = Phaser.Math.Between(0, this.pendingImages.length - 1);
        const config = this.pendingImages.splice(randomIndex, 1)[0];
        
        // Create the image at a random Y position off-screen
        const screenHeight = this.scale.height;
        const randomY = Math.floor(Math.random() * (screenHeight - 100)) + 50;
        
        // Get a reference to the texture to check its dimensions
        const texture = this.textures.get(config.key);
        const textureWidth = texture.source[0].width;
        const textureHeight = texture.source[0].height;
        
        // Calculate maximum scale based on screen size (50% of screen)
        const maxWidth = this.scale.width * 0.5;
        const maxHeight = this.scale.height * 0.5;
        
        // Calculate scale factor to fit within the max dimensions
        const scaleX = maxWidth / textureWidth;
        const scaleY = maxHeight / textureHeight;
        
        // Use the smaller scale to ensure image fits in both dimensions
        let finalScale = Math.min(scaleX, scaleY);
        
        // Generate a random scale between 0.1 and finalScale
        // This ensures the image is never larger than 50% of screen
        const randomScale = Phaser.Math.FloatBetween(0.1, finalScale);

        const imageObj = new ImageWithLabel(this, -50, randomY,
            config.key,   // name of image
            this.identifier, // unique identifier
        { // options
            scale: randomScale,
            depth: 101,
            labelPrefix: config.label,
            textOffsetY: config.textOffsetY || 0,
            debugMode: this.debugMode
        });

        this.identifier++;
        
        // Store the speed with the image object
        imageObj.speed = config.speed * Phaser.Math.Between(0.5, 2); // Randomize speed between 0.5x and 2x
        
        // Add to active images
        this.activeImages.push(imageObj);
    }

    moveImageWithLabel(imageObj, speed = 2) {
        if (!imageObj) return;
        
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        
        // Initialize starting position if not set
        if (imageObj.image.startX === undefined) {
            // Get the image's half-width for proper off-screen positioning
            const imageHalfWidth = imageObj.image.displayWidth / 2;
            
            // Choose a position that's completely off screen to the left
            const offscreenX = -imageHalfWidth - Math.floor(Math.random() * 40);
            
            // Set the initial position
            imageObj.setPosition(offscreenX, imageObj.y);
            
            // Store original position for reference
            imageObj.image.startX = offscreenX;
            imageObj.image.startY = imageObj.y;
        }
        
        // Move the image and text together
        imageObj.setPosition(imageObj.x + speed, imageObj.y);
        
        // Reset position when it's completely off screen to the right
        const imageHalfWidth = imageObj.image.displayWidth / 2;
        if (imageObj.x > screenWidth + imageHalfWidth) {
            // Remove this image from active images
            const index = this.activeImages.indexOf(imageObj);
            if (index !== -1) {
                this.activeImages.splice(index, 1);
            }

            imageObj.destroy();
        }
    }
}
