import { Scene } from 'phaser';
import { ImageWithLabel } from '../gameObjects/ImageWithLabel.js';
import { VideoWithLabel } from '../gameObjects/VideoWithLabel.js';
import { FONTS } from '../config/fonts.js';
import { ElapsedTimeTimer} from '../gameObjects/ElapsedTimeTimer.js';

export class Game extends Scene {
    constructor() {
        super('Game');
        // Size of Phase Game World - Current Size
        // of the Canvas.  Screen Dimensions 
        this.width = this.scale.gameSize.width;
        this.height = this.scale.gameSize.height;

        this.activeImages = [];
        this.activeVideos = [];
        this.imageConfigs = [];
        this.pendingImages = [];
        this.videoConfigs = [];
        this.pendingVideos = [];
        this.identifier = 0; // Unique identifier for images and videos
    
    }

    create() {
        // Get the manifest from the registry (set in Preloader)
        const manifest = this.registry.get('assetsManifest');
        const images = manifest.images;
        const videos = manifest.videos;
        const audio = manifest.audio;
        const particles = manifest.particles;

        this.imageConfigs = images; // Use the image configurations from the manifest
        this.pendingImages = [...this.imageConfigs]; // Make a copy to work with
        
        // Filter videos to exclude those with "background" in the key
        this.videoConfigs = videos.filter(video => !video.key.toLowerCase().includes('background'));
        // this.videoConfigs = ASSETS.videos.filter(video => !video.key.toLowerCase().includes('background'));
        this.pendingVideos = [...this.videoConfigs];
        
        this.identifier = 0; // Unique identifier for images and videos

        // Set up proper scale mode for better fullscreen handling
        this.scale.scaleMode = Phaser.Scale.FIT;
        this.scale.autoCenter = Phaser.Scale.CENTER_BOTH;
        
        // Get initial dimensions
        console.log(`Initial game dimensions: ${this.width} x ${this.height}`);

         // PWA INSTALL RUNNING CHECK
        const isStandalone = window.navigator.standalone || 
                            window.matchMedia('(display-mode: standalone)').matches;
        

        if (!isStandalone && !this.hasShownInstallPrompt) {
            // Show instruction to add to home screen
            const text = this.add.text(
                this.scale.width / 2,
                this.scale.width / 2 - 50, 
                'Add to Home Screen for fullscreen experience',
                 FONTS.getStyle('subtitle', { color: FONTS.colors.gold })
                )
                .setOrigin(0.5)
                .setDepth(1000);
            
                this.tweens.add({
                    targets: text,
                    alpha: { from: 1, to: 0 },
                    duration: 3000,
                    ease: 'Power2',
                    delay: 5000
                });
            
            this.hasShownInstallPrompt = true;
        }

        // BACKGROUND MUSIC
        this.backgroundMusic = this.sound.add('backgroundMusic', {
            volume: 0.5,
            loop: true
        });
        this.backgroundMusic.play();

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

        //RESIZE ON WINDOW RESIZE
        window.addEventListener('resize', () => {
            this.scale.refresh();
        });

        // Improved full screen handling
        this.input.keyboard.on('keydown-F', () => {
            this.switchFullscreen();
        });

        // Listen for both entering and exiting fullscreen
        this.scale.on('enterfullscreen', this.onEnterFullScreen, this);
        this.scale.on('leavefullscreen', this.onLeaveFullScreen, this);

        
        // LOAD VIDEO BACKGROUNDS
        this.video = this.add.video(this.width / 2, this.height / 2, 'background_rivertimelapse')
            .setOrigin(0.5)
            .setDepth(0)
            .setMute(true)
            .setScale(1.0);

        const htmlVideo = this.video.video;

        // Helper to resize background video using metadata
        this.resizeBackgroundVideo = () => {
            if (!htmlVideo.videoWidth || !htmlVideo.videoHeight) return;
            const { width: videoWidth, height: videoHeight } = this.getOptimalVideoSize(
                this.width,
                this.height,
                htmlVideo.videoWidth / htmlVideo.videoHeight
            );
            this.video.setPosition(this.width / 2, this.height / 2)
                .setDisplaySize(videoWidth, videoHeight);
            console.log(`Background video resized to: ${videoWidth}x${videoHeight}`);
        };

        // Only resize after metadata is loaded
        htmlVideo.addEventListener('loadedmetadata', this.resizeBackgroundVideo);

        // Play the video
        this.video.play(true);


            // TIMERS
            this.timerText = this.add.text(500, 60, 'Loading timer...', {
                fontSize: '50px',
                color: '#ffffff'
            }).setOrigin(0.5);

            this.elapsedTimer = new ElapsedTimeTimer({
                onUpdate: (elapsed, formatted) => {
                    this.timerText.setText(`Diploma di scuola superiore:\n ${formatted}`);
                }
            });

             // Create timer text
            this.bDayTimerText = this.add.text(800, 500, 'Loading timer...', {
                ...FONTS.styles.birthday
            }).setOrigin(0.5);
        
             // Initialize timer
            this.birthDayTimer = new ElapsedTimeTimer({
                onUpdate: (elapsed, formatted) => {
                    this.bDayTimerText.setText(`LAG Compleanno : ${formatted}`);
                }
            });
        
        // Set graduation date
        this.elapsedTimer.setStartDate(2025, 6, 17, 12, 1); // June 17, 2025, 12:01 PM

        this.birthDayTimer.setStartDate(2007, 6, 17, 7, 0); // June 17, 2007, 7:00 AM

        // Start the timer
        this.elapsedTimer.start();
        this.birthDayTimer.start();

        // Add space bar to navigate to GameOver scene - no visual hint
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        
        //TRANSITION TO GAME OVER SCENE
        this.input.once('pointerdown', () => {
            this.scene.start('GameOver');
        });

        // D KEY 
        this.debugSetup();

        // Schedule the first image and video
        this.scheduleNextImage();
        this.scheduleNextVideo();
        this.scale.refresh();
        console.log(`Video 1 (rivertimelapse) resize: 
            ${this.video.displayWidth.toFixed(0)}x${this.video.displayHeight.toFixed(0)}, 
            position: ${this.width/2}, ${this.height/2}, 
            scale: ${this.video.scaleX.toFixed(2)}`);

    }

    update() {
        // Move all active images
        for (const imageObj of this.activeImages) {
            this.moveImageWithLabel(imageObj, imageObj.speed);
        }
        
        // Move all active videos
        for (const videoObj of this.activeVideos) {
            this.moveVideoWithLabel(videoObj, videoObj.speed);
        }
    }

    getOptimalVideoSize(width, height, videoRatio = 16 / 9) {
        const screenRatio = width / height;
        let videoWidth, videoHeight;
        if (screenRatio > videoRatio) {
            videoHeight = height;
            videoWidth = height * videoRatio;
        } else {
            videoWidth = width;
            videoHeight = width / videoRatio;
        }
        return { width: videoWidth, height: videoHeight };
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
            
            // Update all existing videos
            for (const videoObj of this.activeVideos) {
                videoObj.setDebugVisible(this.debugMode);
            }
        });
    }

    onEnterFullScreen() {
        console.log("Entering fullscreen mode");
        
        // Store current music state
        this.wasPlaying = this.backgroundMusic?.isPlaying || false;
        
        // Store current video states
        this.storeVideoStates();
        
        // Give the browser more time to adjust before repositioning elements
        // Increase the delay to ensure the browser has time to transition
        this.time.delayedCall(800, () => {
            this.scale.refresh();
            this.repositionElements();
            
            // Restore video states after repositioning
            this.restoreVideoStates();
            
            console.log(`Fullscreen dimensions: ${this.width} x ${this.height}`);
        });
    }

    onLeaveFullScreen() {
        console.log("Exiting fullscreen mode");
        
        // Store current music state
        this.wasPlaying = this.backgroundMusic?.isPlaying || false;
        
        // Store current video states
        this.storeVideoStates();
        
        // Give the browser more time to adjust
        this.time.delayedCall(800, () => {
            this.scale.refresh();
           // this.cameras.resize(this.scale.gameSize.width, this.scale.gameSize.height);
            this.repositionElements();
            
            // Restore video states after repositioning
            this.restoreVideoStates();
            
            console.log(`Window dimensions: ${this.width} x ${this.height}`);
        });
    }

    storeVideoStates() {
        // Store which videos are playing and their current time
        this.videoStates = [];
        
        if (this.videoObjects) {
            this.videoObjects.forEach((video, index) => {
                if (video) {
                    this.videoStates[index] = {
                        isPlaying: video.isPlaying(),
                        currentTime: video.getCurrentTime(),
                        alpha: video.alpha
                    };
                }
            });
        } else if (this.video && this.video1) {
            // Fallback if videoObjects array isn't available
            this.videoStates = [
                {
                    isPlaying: this.video.isPlaying(),
                    currentTime: this.video.getCurrentTime(),
                    alpha: this.video.alpha
                },
                {
                    isPlaying: this.video1.isPlaying(),
                    currentTime: this.video1.getCurrentTime(),
                    alpha: this.video1.alpha
                }
            ];
        }
        
        console.log('Stored video states:', this.videoStates);
    }
    
    restoreVideoStates() {
        // Restore video playing states
        if (!this.videoStates || this.videoStates.length === 0) {
            console.log('No video states to restore');
            return;
        }
        
        if (this.videoObjects) {
            this.videoObjects.forEach((video, index) => {
                if (video && this.videoStates[index]) {
                    const state = this.videoStates[index];
                    
                    // Restore alpha value
                    video.setAlpha(state.alpha);
                    
                    // Restore time position if possible
                    try {
                        if (typeof video.seekTo === 'function') {
                            video.seekTo(state.currentTime);
                        }
                    } catch (e) {
                        console.warn('Could not seek video:', e);
                    }
                    
                    
                    // Restore play state
                    if (state.isPlaying && !video.isPlaying()) {
                        video.play(true); // Loop
                    } else if (!state.isPlaying && video.isPlaying()) {
                        video.stop();
                        }
                        
                }
            });
        } else if (this.video && this.video1 && this.videoStates.length >= 2) {
            // Fallback handling
            [this.video, this.video1].forEach((video, index) => {
                const state = this.videoStates[index];
                if (state) {
                    video.setAlpha(state.alpha);
                    
                    try {
                        if (typeof video.seekTo === 'function') {
                            video.seekTo(state.currentTime);
                        }
                    } catch (e) {
                        console.warn('Could not seek video:', e);
                    }
                    
                    if (state.isPlaying && !video.isPlaying()) {
                        video.play(true);
                    } else if (!state.isPlaying && video.isPlaying()) {
                        video.stop();
                    }
                }
            });
        }
        
        console.log('Restored video states');
    }

    repositionElements() {
        console.log(`Repositioning elements to width: ${this.width}, height: ${this.height}, fullscreen: ${this.scale.isFullscreen}`);

        // Resize background video if it exists and metadata is loaded
        if (this.video && this.video.video && this.video.video.videoWidth) {
            const videoRatio = this.video.video.videoWidth / this.video.video.videoHeight;
            const { width: videoWidth, height: videoHeight } = this.getOptimalVideoSize(this.width, this.height, videoRatio);
            this.video.setPosition(this.width / 2, this.height / 2)
                      .setDisplaySize(videoWidth, videoHeight);
            console.log(`Background video resized to: ${videoWidth}x${videoHeight}`);
        }

        // If you have a second background video (e.g., this.video1), resize it the same way:
        if (this.video1 && this.video1.video && this.video1.video.videoWidth) {
            const video1Ratio = this.video1.video.videoWidth / this.video1.video.videoHeight;
            const { width: video1Width, height: video1Height } = this.getOptimalVideoSize(this.width, this.height, video1Ratio);
            this.video1.setPosition(this.width / 2, this.height / 2)
                       .setDisplaySize(video1Width, video1Height)
                       .setScale(1.0);
            console.log(`Video 2 (Puffins) size: ${video1Width.toFixed(0)}x${video1Height.toFixed(0)}, position: ${this.width/2}, ${this.height/2}`);
        }

        // Reposition fullscreen button if it exists - keep at top of screen
        if (this.fsBtn) {
            this.fsBtn.setPosition(this.width - 40, 20);
        }
    }

    setupVideoTransitions() {
        // Keep track of which video is currently active
        this.activeVideoIndex = 0; // 0 = this.video, 1 = this.video1
        this.videoObjects = [this.video, this.video1];
        
        // Configure both videos to loop
        this.videoObjects.forEach(video => {
            if (video && video.setLoop) {
                video.setLoop(true);
            }
        });
        
        console.log('Video transitions have been set up');
    }
    
    transitionToNextVideo() {
        // Get current and next videos
        const currentVideo = this.videoObjects[this.activeVideoIndex];
        this.activeVideoIndex = (this.activeVideoIndex + 1) % this.videoObjects.length;
        const nextVideo = this.videoObjects[this.activeVideoIndex];
        
        console.log(`Transitioning from video ${this.activeVideoIndex === 0 ? 1 : 0} to video ${this.activeVideoIndex}`);
        
        if (!currentVideo || !nextVideo) {
            console.error('Video objects not available for transition');
            return;
        }
        
        // Make sure the next video is playing and ready
        if (!nextVideo.isPlaying()) {
            nextVideo.play(true); // Start with looping enabled
        }
        nextVideo.setAlpha(0); // Start invisible
        
        // Fade out current video while fading in next video
        this.tweens.add({
            targets: currentVideo,
            alpha: 0,
            duration: 2000,
            ease: 'Linear'
        });
        
        this.tweens.add({
            targets: nextVideo,
            alpha: 0.8, // Match the initial alpha of 0.8
            duration: 2000,
            ease: 'Linear',
            onComplete: () => {
                // Optionally pause the previous video to save resources
                if (currentVideo.isPlaying()) {
                    currentVideo.stop();
                }
                
                // Schedule the next transition
                this.videoTransitionTimer = this.time.delayedCall(15000, () => { // 15 seconds between transitions
                    this.transitionToNextVideo();
                });
            }
        });
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
    
    scheduleNextVideo() {
        // Only schedule if we have non-background videos
        if (this.videoConfigs.length === 0) return;
        
        // Videos should be more rare - use longer delay
        const delay = Phaser.Math.Between(10000, 20000);
        
        // Schedule next video creation
        this.time.delayedCall(delay, () => {
            this.createRandomVideo();
            // Schedule the next one
            this.scheduleNextVideo();
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
        
        // Calculate maximum scale based on screen size (40% of screen)
        const maxWidth = this.scale.width * 0.4;
        const maxHeight = this.scale.height * 0.4;
        
        // Calculate scale factor to fit within the max dimensions
        const scaleX = maxWidth / textureWidth;
        const scaleY = maxHeight / textureHeight;
        
        // Use the smaller scale to ensure image fits in both dimensions
        let finalScale = Math.min(scaleX, scaleY);
        
        // Generate a random scale between 0.1 and finalScale
        // This ensures the image is never larger than 40% of screen
        const randomScale = Phaser.Math.FloatBetween(0.1, finalScale);

        const imageObj = new ImageWithLabel(this, -50, randomY + 50,
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
        imageObj.speed = config.speed * Phaser.Math.Between(0.4, 1.75); // Randomize speed between 0.5x and 2x
        
        // Add to active images
        this.activeImages.push(imageObj);
    }
    
    createRandomVideo() {
        if (this.videoConfigs.length === 0) return;

        if (this.pendingVideos.length === 0) {
            this.pendingVideos = [...this.videoConfigs];
        }

        const randomIndex = Phaser.Math.Between(0, this.pendingVideos.length - 1);
        const config = this.pendingVideos.splice(randomIndex, 1)[0];

        const screenHeight = this.scale.height;
        const randomY = Math.floor(Math.random() * (screenHeight - 100)) + 50;

        // Use a temporary scale
        const tempScale = Phaser.Math.FloatBetween(0.25, 0.5);

        const videoObj = new VideoWithLabel(this, -100, randomY,
            config.key,
            `video-${this.identifier}`,
            {
                scale: tempScale,
                depth: 102,
                labelPrefix: config.label,
                textOffsetY: config.textOffsetY || 0,
                debugMode: this.debugMode,
                loop: true,
                mute: false,
                autoPlay: true
            }
        );

        this.identifier++;
        videoObj.speed = (config.speed || 1) * Phaser.Math.FloatBetween(0.5, 1.2);
        this.activeVideos.push(videoObj);

        // --- NEW: Wait for metadata and adjust scale ---
        const phaserVideo = videoObj.video; // Phaser Video object
        const htmlVideo = phaserVideo.video; // Underlying HTML5 video element

        const adjustScale = () => {
            const videoWidth = htmlVideo.videoWidth;
            const videoHeight = htmlVideo.videoHeight;
            const maxWidth = this.scale.width * 0.5;
            const maxHeight = this.scale.height * 0.5;
            const scaleX = maxWidth / videoWidth;
            const scaleY = maxHeight / videoHeight;
            const finalScale = Math.min(scaleX, scaleY, 1);
            phaserVideo.setScale(finalScale);
            if (videoObj.nameText) {
                videoObj.nameText.y = phaserVideo.displayHeight / 2 - 10 + (config.textOffsetY || 0);
            }
            htmlVideo.removeEventListener('loadedmetadata', adjustScale);
        };
          if (htmlVideo.readyState >= 1) {
            adjustScale();
        } else {
            htmlVideo.addEventListener('loadedmetadata', adjustScale);
            }
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
    
    moveVideoWithLabel(videoObj, speed = 1.5) {
        if (!videoObj) return;
        
        const screenWidth = this.scale.width;
        
        // Initialize starting position if not set
        if (!videoObj._startPosInitialized) {
            // Use video's displayWidth for positioning
            const videoHalfWidth = videoObj.video.displayWidth / 2;
            
            // Choose a position that's completely off screen to the left
            const offscreenX = -videoHalfWidth - Math.floor(Math.random() * 40);
            
            // Set the initial position
            videoObj.setPosition(offscreenX, videoObj.y);
            
            // Mark as initialized
            videoObj._startPosInitialized = true;
        }
        
        // Move the video and text together
        videoObj.setPosition(videoObj.x + speed, videoObj.y);
        
        // Reset position when it's completely off screen to the right
        const videoHalfWidth = videoObj.video.displayWidth / 2;
        if (videoObj.x > screenWidth + videoHalfWidth) {
            // Remove this video from active videos
            const index = this.activeVideos.indexOf(videoObj);
            if (index !== -1) {
                this.activeVideos.splice(index, 1);
            }

            videoObj.destroy();
        }
    }

    switchFullscreen() {
        if (!this.scale.isFullscreen) {
            this.scale.startFullscreen();
        } else {
            this.scale.stopFullscreen();
            }
    }
}
