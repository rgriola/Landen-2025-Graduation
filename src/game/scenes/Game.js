import { Scene } from 'phaser';
import { ImageWithLabel } from '../gameObjects/ImageWithLabel.js';
import { VideoWithLabel } from '../gameObjects/VideoWithLabel.js';
import { FONTS } from '../config/fonts.js';
import { ElapsedTimeTimer } from '../gameObjects/ElapsedTimeTimer.js';

export class Game extends Scene {
    constructor() {
        super('Game');
        // Instance properties
        this.activeImages = [];
        this.activeVideos = [];
        this.imageConfigs = [];
        this.pendingImages = [];
        this.videoConfigs = [];
        this.pendingVideos = [];
        this.identifier = 0;
        this.fsBtn = null;
        this.debugMode = false;
        this.hasShownInstallPrompt = false;
    }

    create() {
        // DO NOT DELETE -- Layer instructions
        // DEPTHS - Videos: 0, UI Elements: 1000, 
        // Images/Video Snippets: 100's (to layer), Effects: -1 from Image.

        // Always use up-to-date game size
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        // Get manifest from registry
        const manifest = this.registry.get('assetsManifest');
        this.imageConfigs = manifest.images;
        this.pendingImages = [...this.imageConfigs];
        this.videoConfigs = manifest.videos.filter(video => !video.key.toLowerCase().includes('background'));
        this.pendingVideos = [...this.videoConfigs];

        // Set scale mode for responsive fullscreen
        this.scale.scaleMode = Phaser.Scale.FIT;
        this.scale.autoCenter = Phaser.Scale.CENTER_BOTH;

        // PWA install prompt
        const isStandalone = window.navigator.standalone ||
            window.matchMedia('(display-mode: standalone)').matches;
        if (!isStandalone && !this.hasShownInstallPrompt) {
            
            const textPunch = this.add.text(
                width / 2,
                height - 50,
                'Punch F for Fullscreen or Click top Right ⛶',
                FONTS.getStyle('subtitle', { color: FONTS.colors.gold })
            )
                .setOrigin(0.5)
                .setDepth(1000);

            this.tweens.add({
                targets: textPunch,
                alpha: { from: 1, to: 0 },
                duration: 3000,
                ease: 'Power2',
                delay: 5000
            });

            this.hasShownInstallPrompt = true;
        }

        // Background music (avoid double play)
        if (!this.backgroundMusic) {
            this.backgroundMusic = this.sound.add('backgroundMusic', {
                volume: 0.5,
                loop: true
            });
            this.backgroundMusic.play();
        }

        // Fullscreen button
        this.fsBtn = this.add.text(width - 40, 20, '⛶', {
            fontSize: '50px',
            color: '#FFD700',
            align: 'center',
            backgroundColor: '#222222',
            padding: { x: 8, y: 4 }
        })
        .setOrigin(1, 0)
        .setDepth(1000)
        .setInteractive({ useHandCursor: true });
        this.fsBtn.on('pointerup', () => this.switchFullscreen());

        // Fullscreen with F key
        this.input.keyboard.on('keydown-F', () => this.switchFullscreen());

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

        // Phaser's resize event
       this.scale.on('resize', this.onFullScreenChange, this);

        // Background video
        this.video = this.add.video(width / 2, height / 2, 'background_rivertimelapse')
            .setOrigin(0.5)
            .setDepth(0)
            .setMute(true)
            .setScale(1.0);

        // Play the video
        this.video.play(true);

        // Timers (consider making these responsive)
        this.timerText = this.add.text(width * 0.3, height * 0.1, 'Loading timer...', {
            fontSize: '50px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.elapsedTimer = new ElapsedTimeTimer({
            onUpdate: (elapsed, formatted) => {
                this.timerText.setText(`Diploma\ndi scuola superiore:\n${formatted}`);
            }
        });

        this.bDayTimerText = this.add.text(300, 500, 'Loading timer...', {
            ...FONTS.styles.birthday
        }).setOrigin(0);

        this.birthDayTimer = new ElapsedTimeTimer({
            onUpdate: (elapsed, formatted) => {
                this.bDayTimerText.setText(`LAG Compleanno:\n${formatted}`);
            }
        });

        this.elapsedTimer.setStartDate(2025, 6, 17, 12, 1);
        this.birthDayTimer.setStartDate(2007, 6, 17, 7, 0);
        this.elapsedTimer.start();
        this.birthDayTimer.start();

        // Debug key
        this.debugSetup();

        // Schedule first image and video
        this.scheduleNextImage();
        this.scheduleNextVideo();

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

    debugSetup() {
        this.debugKey = this.input.keyboard.addKey('D');
        this.debugMode = false;
        this.input.keyboard.on('keydown-D', () => {
            this.debugMode = !this.debugMode;
            for (const imageObj of this.activeImages) {
                imageObj.setDebugVisible(this.debugMode);
            }
            for (const videoObj of this.activeVideos) {
                videoObj.setDebugVisible(this.debugMode);
            }
        });
    }

    onFullScreenChange() {
        this.wasPlaying = this.backgroundMusic?.isPlaying || false;
        this.storeVideoStates();
        this.time.delayedCall(800, () => {
            this.scale.refresh();
            this.restoreVideoStates();
        });
    }

    storeVideoStates() {
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
        } else if (this.video) {
            this.videoStates = [
                {
                    isPlaying: this.video.isPlaying(),
                    currentTime: this.video.getCurrentTime(),
                    alpha: this.video.alpha
                }
            ];
        }
    }

    restoreVideoStates() {
        if (!this.videoStates || this.videoStates.length === 0) return;
        if (this.videoObjects) {
            this.videoObjects.forEach((video, index) => {
                if (video && this.videoStates[index]) {
                    const state = this.videoStates[index];
                    video.setAlpha(state.alpha);
                    try {
                        if (typeof video.seekTo === 'function') {
                            video.seekTo(state.currentTime);
                        }
                    } catch (e) {}
                    if (state.isPlaying && !video.isPlaying()) {
                        video.play(true);
                    } else if (!state.isPlaying && video.isPlaying()) {
                        video.stop();
                    }
                }
            });
        } else if (this.video && this.videoStates.length >= 1) {
            const state = this.videoStates[0];
            if (state) {
                this.video.setAlpha(state.alpha);
                try {
                    if (typeof this.video.seekTo === 'function') {
                        this.video.seekTo(state.currentTime);
                    }
                } catch (e) {}
                if (state.isPlaying && !this.video.isPlaying()) {
                    this.video.play(true);
                } else if (!state.isPlaying && this.video.isPlaying()) {
                    this.video.stop();
                }
            }
        }
    }

    scheduleNextImage() {
        const delay = Phaser.Math.Between(1000, 5000);
        this.time.delayedCall(delay, () => {
            this.createRandomImage();
            this.scheduleNextImage();
        });
    }

    scheduleNextVideo() {
        if (this.videoConfigs.length === 0) return;
        const delay = Phaser.Math.Between(10000, 20000);
        this.time.delayedCall(delay, () => {
            this.createRandomVideo();
            this.scheduleNextVideo();
        });
    }

    createRandomImage() {
        if (this.pendingImages.length === 0) {
            this.pendingImages = [...this.imageConfigs];
        }
        const randomIndex = Phaser.Math.Between(0, this.pendingImages.length - 1);
        const config = this.pendingImages.splice(randomIndex, 1)[0];
        const screenHeight = this.scale.gameSize.height;
        const randomY = Math.floor(Math.random() * (screenHeight - 100)) + 50;
        const texture = this.textures.get(config.key);
        const textureWidth = texture.source[0].width;
        const textureHeight = texture.source[0].height;
        const maxWidth = this.scale.gameSize.width * 0.4;
        const maxHeight = this.scale.gameSize.height * 0.4;
        const scaleX = maxWidth / textureWidth;
        const scaleY = maxHeight / textureHeight;
        let finalScale = Math.min(scaleX, scaleY);
        const randomScale = Phaser.Math.FloatBetween(0.1, finalScale);

        const imageObj = new ImageWithLabel(this, -50, randomY + 50,
            config.key,
            this.identifier,
            {
                scale: randomScale,
                depth: 101,
                labelPrefix: config.label,
                textOffsetY: config.textOffsetY || 0,
                debugMode: this.debugMode
            });

        this.identifier++;
        imageObj.speed = config.speed * Phaser.Math.Between(0.4, 1.75);
        this.activeImages.push(imageObj);
    }

    createRandomVideo() {
        if (this.videoConfigs.length === 0) return;
        if (this.pendingVideos.length === 0) {
            this.pendingVideos = [...this.videoConfigs];
        }
        const randomIndex = Phaser.Math.Between(0, this.pendingVideos.length - 1);
        const config = this.pendingVideos.splice(randomIndex, 1)[0];
        const screenHeight = this.scale.gameSize.height;
        const randomY = Math.floor(Math.random() * (screenHeight - 100)) + 50;
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

        const phaserVideo = videoObj.video;
        const htmlVideo = phaserVideo.video;

        const adjustScale = () => {
            const videoWidth = htmlVideo.videoWidth;
            const videoHeight = htmlVideo.videoHeight;
            const maxWidth = this.scale.gameSize.width * 0.5;
            const maxHeight = this.scale.gameSize.height * 0.5;
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
        const screenWidth = this.scale.gameSize.width;
        // Initialize starting position if not set
        if (imageObj.image.startX === undefined) {
            const imageHalfWidth = imageObj.image.displayWidth / 2;
            const offscreenX = -imageHalfWidth - Math.floor(Math.random() * 40);
            imageObj.setPosition(offscreenX, imageObj.y);
            imageObj.image.startX = offscreenX;
            imageObj.image.startY = imageObj.y;
        }
        imageObj.setPosition(imageObj.x + speed, imageObj.y);
        const imageHalfWidth = imageObj.image.displayWidth / 2;
        if (imageObj.x > screenWidth + imageHalfWidth) {
            const index = this.activeImages.indexOf(imageObj);
            if (index !== -1) {
                this.activeImages.splice(index, 1);
            }
            imageObj.destroy();
        }
    }

    moveVideoWithLabel(videoObj, speed = 1.5) {
        if (!videoObj) return;
        const screenWidth = this.scale.gameSize.width;
        if (!videoObj._startPosInitialized) {
            const videoHalfWidth = videoObj.video.displayWidth / 2;
            const offscreenX = -videoHalfWidth - Math.floor(Math.random() * 40);
            videoObj.setPosition(offscreenX, videoObj.y);
            videoObj._startPosInitialized = true;
        }
        videoObj.setPosition(videoObj.x + speed, videoObj.y);
        const videoHalfWidth = videoObj.video.displayWidth / 2;
        if (videoObj.x > screenWidth + videoHalfWidth) {
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
