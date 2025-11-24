import { Scene } from 'phaser';
import { images, videos, audio, particles } from '../assets.js';
import { PATH_UTILS } from '../config/paths.js';

export class AssetGallery extends Scene {
    constructor() {
        super('AssetGallery');
        this.scrollY = 0;
        this.popup = null;
        this.currentTab = 'images'; // Default tab
        this.tabs = ['images', 'videos', 'audio', 'particles'];
        this.tabButtons = [];
        this.galleryContainer = null;
        this.tabContentContainers = {};
    }

    create() {
        // Get assets from manifest
        const manifest = this.registry.get('assetsManifest');
        this.manifest = manifest;

        const halfX = this.scale.width / 2;
        const halfY = this.scale.height / 2;

        // BACKGROUND
        this.add.image(halfX, halfY, 'background')
            .setOrigin(0.5, 0.5)
            .setScale(3);

        // Create UI elements
        this.createHeader();
        this.createTabs();
        this.createScrollableArea();
        
        // Create content for all tabs
        this.createTabContent();
        
        // Show initial tab
        this.switchTab('images');

        // Setup input handling
        this.setupInputHandling();
    }

    createHeader() {
        const margin = 20;
        
        // Title
        this.add.text(this.scale.width / 2, margin + 20, 'Asset Gallery', {
            fontSize: '36px',
            color: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(1000);

        // Main Menu button (top right)
        const mainMenuBtn = this.add.text(this.scale.width - margin, margin, 'Main Menu', {
            fontSize: '24px',
            color: '#FFD700',
            backgroundColor: '#222',
            padding: { x: 16, y: 8 }
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(1000);

        mainMenuBtn.on('pointerup', () => {
            this.scene.start('MainMenu');
        });
    }

    createTabs() {
        const tabY = 80;
        const tabWidth = 150;
        const tabHeight = 40;
        const spacing = 10;
        const totalWidth = (tabWidth * this.tabs.length) + (spacing * (this.tabs.length - 1));
        const startX = (this.scale.width - totalWidth) / 2;

        this.tabButtons = [];

        this.tabs.forEach((tabName, index) => {
            const x = startX + (index * (tabWidth + spacing));
            
            // Tab background
            const tabBg = this.add.rectangle(x + tabWidth/2, tabY, tabWidth, tabHeight, 0x444444)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .setDepth(1000);

            // Tab text
            const tabText = this.add.text(x + tabWidth/2, tabY, tabName.toUpperCase(), {
                fontSize: '18px',
                color: '#fff',
                fontWeight: 'bold'
            }).setOrigin(0.5).setDepth(1001);

            // Store references
            const tabButton = { bg: tabBg, text: tabText, name: tabName };
            this.tabButtons.push(tabButton);

            // Click handler
            tabBg.on('pointerup', () => this.switchTab(tabName));
        });
    }

    createScrollableArea() {
        // Create main container for scrollable content
        this.galleryContainer = this.add.container(0, 120); // Start below tabs
        
        // Create individual containers for each tab content
        this.tabs.forEach(tabName => {
            this.tabContentContainers[tabName] = this.add.container(0, 0);
            this.galleryContainer.add(this.tabContentContainers[tabName]);
        });
    }

    createTabContent() {
        // Grid layout settings
        const margin = 32;
        const columns = 5;
        const cellSize = 200;
        const cellPadding = 10;
        const gridSpacingX = cellSize + cellPadding;
        const gridSpacingY = cellSize + 30 + cellPadding;

        // Calculate grid positioning
        const gridWidth = columns * gridSpacingX - cellPadding;
        const leftOffset = Math.floor((this.scale.width - gridWidth) / 2);

        // Create Images content
        this.createImagesTab(this.manifest.images, leftOffset, gridSpacingX, gridSpacingY, cellSize);
        
        // Create Videos content
        this.createVideosTab(this.manifest.videos, leftOffset, gridSpacingX, gridSpacingY, cellSize);
        
        // Create Audio content
        this.createAudioTab(this.manifest.audio, leftOffset, gridSpacingX, gridSpacingY, cellSize);
        
        // Create Particles content
        this.createParticlesTab(this.manifest.particles, leftOffset, gridSpacingX, gridSpacingY, cellSize);
    }

    createImagesTab(images, leftOffset, gridSpacingX, gridSpacingY, cellSize) {
        const container = this.tabContentContainers['images'];
        let y = 20;
        
        images.forEach((img, idx) => {
            const col = idx % 5;
            const row = Math.floor(idx / 5);
            const x = leftOffset + col * gridSpacingX;
            const yPos = y + row * gridSpacingY;

            // Background rectangle
            const bg = this.add.rectangle(x + cellSize / 2, yPos + cellSize / 2, cellSize, cellSize, 0xF26BA1)
                .setOrigin(0.5);
            container.add(bg);

            // Image
            const image = this.add.image(x + cellSize / 2, yPos + cellSize / 2, img.key)
                .setOrigin(0.5);
            image.setScale(Math.min(cellSize / image.width, cellSize / image.height, 1));
            image.setInteractive({ useHandCursor: true });
            image.on('pointerup', () => this.showPopupImage(img.key));
            container.add(image);

            // Label
            const label = this.add.text(x + cellSize / 2, yPos + cellSize + 4, img.key, {
                fontSize: '16px',
                color: '#fff'
            }).setOrigin(0.5, 0);
            container.add(label);
        });

        // Store content height for this tab
        this.tabContentContainers['images'].contentHeight = y + Math.ceil(images.length / 5) * gridSpacingY + 50;
    }

    createVideosTab(videos, leftOffset, gridSpacingX, gridSpacingY, cellSize) {
        const container = this.tabContentContainers['videos'];
        let y = 20;
        
        videos.forEach((vid, idx) => {
            const col = idx % 5;
            const row = Math.floor(idx / 5);
            const x = leftOffset + col * gridSpacingX;
            const yPos = y + row * gridSpacingY;

            // Background rectangle
            const bg = this.add.rectangle(x + cellSize / 2, yPos + cellSize / 2, cellSize, cellSize, 0x222222)
                .setOrigin(0.5);
            container.add(bg);

            // Try to create video thumbnail or use fallback
            try {
                createVideoThumbnail(this, vid.path, vid.key).then((thumbKey) => {
                    const thumb = this.add.image(x + cellSize / 2, yPos + cellSize / 2, thumbKey)
                        .setDisplaySize(80, 45)
                        .setOrigin(0.5)
                        .setInteractive({ useHandCursor: true })
                        .on('pointerup', () => this.showPopupVideo(vid.key));
                    container.add(thumb);
                }).catch(() => {
                    // Fallback rectangle
                    const fallback = this.add.rectangle(x + cellSize / 2, yPos + cellSize / 2, 80, 45, 0x444444)
                        .setOrigin(0.5)
                        .setInteractive({ useHandCursor: true })
                        .on('pointerup', () => this.showPopupVideo(vid.key));
                    container.add(fallback);
                });
            } catch (err) {
                console.error(`Error in video grid section for ${vid.key}:`, err);
            }

            // Label
            const label = this.add.text(x + cellSize / 2, yPos + cellSize + 4, vid.key, {
                fontSize: '12px',
                color: '#fff'
            }).setOrigin(0.5, 0);
            container.add(label);
        });

        this.tabContentContainers['videos'].contentHeight = y + Math.ceil(videos.length / 5) * gridSpacingY + 50;
    }

    createAudioTab(audio, leftOffset, gridSpacingX, gridSpacingY, cellSize) {
        const container = this.tabContentContainers['audio'];
        let y = 20;
        
        audio.forEach((aud, idx) => {
            const col = idx % 5;
            const row = Math.floor(idx / 5);
            const x = leftOffset + col * gridSpacingX;
            const yPos = y + row * gridSpacingY;

            // Background rectangle
            const bg = this.add.rectangle(x + cellSize / 2, yPos + cellSize / 2, cellSize, cellSize, 0x222222)
                .setOrigin(0.5);
            container.add(bg);

            // Audio text
            const audioText = this.add.text(x + cellSize / 2, yPos + cellSize / 2, aud.key, {
                fontSize: '12px',
                color: '#fff',
                wordWrap: { width: cellSize - 8 }
            }).setOrigin(0.5);
            audioText.setInteractive({ useHandCursor: true });
            audioText.on('pointerup', () => this.showPopupAudio(aud.key));
            container.add(audioText);
        });

        this.tabContentContainers['audio'].contentHeight = y + Math.ceil(audio.length / 5) * gridSpacingY + 50;
    }

    createParticlesTab(particles, leftOffset, gridSpacingX, gridSpacingY, cellSize) {
        const container = this.tabContentContainers['particles'];
        let y = 20;
        
        particles.forEach((part, idx) => {
            const col = idx % 5;
            const row = Math.floor(idx / 5);
            const x = leftOffset + col * gridSpacingX;
            const yPos = y + row * gridSpacingY;

            // Background rectangle
            const bg = this.add.rectangle(x + cellSize / 2, yPos + cellSize / 2, cellSize, cellSize, 0x222222)
                .setOrigin(0.5);
            container.add(bg);

            // Particle image
            const particleImg = this.add.image(x + cellSize / 2, yPos + cellSize / 2, part.key)
                .setOrigin(0.5);
            particleImg.setScale(Math.min(cellSize / particleImg.width, cellSize / particleImg.height, 1));
            particleImg.setInteractive({ useHandCursor: true });
            particleImg.on('pointerup', () => this.showPopupParticle(part.key));
            container.add(particleImg);

            // Label
            const label = this.add.text(x + cellSize / 2, yPos + cellSize + 4, part.key, {
                fontSize: '12px',
                color: '#fff'
            }).setOrigin(0.5, 0);
            container.add(label);
        });

        this.tabContentContainers['particles'].contentHeight = y + Math.ceil(particles.length / 5) * gridSpacingY + 50;
    }

    switchTab(tabName) {
        // Update current tab
        this.currentTab = tabName;

        // Reset scroll position
        this.scrollY = 0;
        this.galleryContainer.y = 120; // Reset to just below tabs

        // Update tab button appearances
        this.tabButtons.forEach(tab => {
            if (tab.name === tabName) {
                tab.bg.setFillStyle(0x666666); // Active color
                tab.text.setColor('#FFD700'); // Active text color
            } else {
                tab.bg.setFillStyle(0x444444); // Inactive color
                tab.text.setColor('#fff'); // Inactive text color
            }
        });

        // Show/hide tab content
        this.tabs.forEach(name => {
            this.tabContentContainers[name].setVisible(name === tabName);
        });

        // Update gallery height for scrolling
        const activeContainer = this.tabContentContainers[tabName];
        this.galleryHeight = activeContainer.contentHeight || 500;
    }

    setupInputHandling() {
        // Enable mouse wheel scrolling
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            this.scrollGallery(deltaY);
        });

        // Enable drag-to-scroll
        let isDragging = false;
        let lastY = 0;
        
        this.input.on('pointerdown', (pointer) => {
            // Don't start dragging if clicking on a tab or the main menu button
            if (pointer.y > 100) { // Only below the tab area
                isDragging = true;
                lastY = pointer.y;
            }
        });

        this.input.on('pointerup', () => {
            isDragging = false;
        });

        this.input.on('pointermove', (pointer) => {
            if (isDragging && pointer.y > 100) {
                this.scrollGallery(lastY - pointer.y);
                lastY = pointer.y;
            }
        });
    }

    // POPUP for Images
    showPopupImage(key) {
        this.closePopup();
        const tex = this.textures.get(key);
        const img = tex.getSourceImage();
        const { width, height } = img;
        const maxW = this.scale.width * 0.9;
        const maxH = this.scale.height * 0.9;
        const scale = Math.min(maxW / width, maxH / height, 1);

        // Find asset from manifest for label and filename
        const asset = images.find(i => i.key === key);
        const label = asset && asset.label ? asset.label : '(no label)';
        const filename = asset && asset.path ? asset.path : '(unknown)';

        this.popup = this.add.container(this.scale.width / 2, this.scale.height / 2);

        // Dim background
        const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8)
            .setOrigin(0.5)
            .setInteractive();
        bg.on('pointerup', () => this.closePopup());

        // Centered full-size image
        const imgObj = this.add.image(0, 0, key)
            .setOrigin(0.5)
            .setScale(scale);

        // Image data (top right corner of the screen)
        const infoText = [
            `Key: ${key}`,
            `Label: ${label}`,
            `Width: ${width}`,
            `Height: ${height}`,
            `Scale: ${scale.toFixed(2)}`,
            `Filename:`,
            `${filename}`
        ].join('\n');
        const info = this.add.text(this.scale.width / 2 - 20, -this.scale.height / 2 + 20, infoText, {
            fontSize: '18px',
            color: '#FFD700',
            backgroundColor: '#222',
            padding: { x: 12, y: 8 },
            wordWrap: { width: this.scale.width / 3 },
            align: 'left'
        }).setOrigin(1, 0);

        // Close text
        const closeText = this.add.text(0, (height * scale) / 2 + 40, 'Click to Close', {
            fontSize: '24px',
            color: '#FFD700',
            backgroundColor: '#222',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5, 0);

        closeText.setInteractive({ useHandCursor: true });
        closeText.on('pointerup', () => this.closePopup());

        this.popup.add([bg, imgObj, info, closeText]);
    }

    // POPUP for Videos
    showPopupVideo(key) {
        this.closePopup();

        const manifest = this.registry.get('assetsManifest');
        const videoAsset = manifest && manifest.videos ? manifest.videos.find(v => v.key === key) : null;
        const label = videoAsset && videoAsset.label ? videoAsset.label : '(no label)';
        const filename = videoAsset && videoAsset.path ? videoAsset.path : '(unknown)';

        this.popup = this.add.container(this.scale.width / 2, this.scale.height / 2);

        // Dim background
        const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8)
            .setOrigin(0.5)
            .setInteractive();
        bg.on('pointerup', () => this.closePopup());

        // Phaser video object (centered)
        const video = this.add.video(0, 0, key)
            .setOrigin(0.5)
            .setInteractive();

        // Wait for video metadata to load to get natural size
        video.once('play', () => {
            const vidW = video.video.videoWidth;
            const vidH = video.video.videoHeight;
            const maxW = this.scale.width * 0.8;
            const maxH = this.scale.height * 0.6;
            const scale = Math.min(maxW / vidW, maxH / vidH, 1);
            video.setDisplaySize(vidW * scale, vidH * scale);

            // Move controls and close text below the video
            playBtn.setY(vidH * scale / 2 + 40);
            pauseBtn.setY(vidH * scale / 2 + 40);
            stopBtn.setY(vidH * scale / 2 + 40);
            closeText.setY(vidH * scale / 2 + 90);
        });

        // Player controls
        const btnStyle = {
            fontSize: '20px',
            color: '#222',
            backgroundColor: '#FFD700',
            padding: { x: 12, y: 6 }
        };

        const playBtn = this.add.text(-60, 120, 'Play', btnStyle).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const pauseBtn = this.add.text(0, 120, 'Pause', btnStyle).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const stopBtn = this.add.text(60, 120, 'Stop', btnStyle).setOrigin(0.5).setInteractive({ useHandCursor: true });

        playBtn.on('pointerup', () => {
            if (!video.isPlaying()) video.play(true);
        });
        pauseBtn.on('pointerup', () => {
            if (video.isPlaying()) video.pause();
        });
        stopBtn.on('pointerup', () => {
            if (video.isPlaying() || video.isPaused()) video.stop();
        });

        // Video info (top right)
        const infoText = [
            `Key: ${key}`,
            `Label: ${label}`,
            `Filename:`,
            `${filename}`
        ].join('\n');
        const info = this.add.text(this.scale.width / 2 - 20, -this.scale.height / 2 + 20, infoText, {
            fontSize: '18px',
            color: '#FFD700',
            backgroundColor: '#222',
            padding: { x: 12, y: 8 },
            wordWrap: { width: this.scale.width / 3 },
            align: 'left'
        }).setOrigin(1, 0);

        // Close text
        const closeText = this.add.text(0, 170, 'Click to Close', {
            fontSize: '24px',
            color: '#FFD700',
            backgroundColor: '#222',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5, 0);

        closeText.setInteractive({ useHandCursor: true });
        closeText.on('pointerup', () => {
            video.stop();
            this.closePopup();
        });

        this.popup.add([bg, video, playBtn, pauseBtn, stopBtn, info, closeText]);
    }

    // POPUP for Audio
    showPopupAudio(key) {
        this.closePopup();
        this.popup = this.add.container(this.scale.width / 2, this.scale.height / 2);

        // Dim background
        const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8)
            .setOrigin(0.5)
            .setInteractive();
        bg.on('pointerup', () => this.closePopup());

        // Play audio
        const sound = this.sound.add(key);

        // Audio label
        const label = this.add.text(0, -40, `Audio: ${key}`, {
            fontSize: '24px',
            color: '#FFD700',
            backgroundColor: '#222',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);

        // Player controls
        const btnStyle = {
            fontSize: '20px',
            color: '#222',
            backgroundColor: '#FFD700',
            padding: { x: 10, y: 6 }
        };
        
        const playBtn = this.add.text(-80, 20, 'Play', btnStyle).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const pauseBtn = this.add.text(0, 20, 'Pause', btnStyle).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const stopBtn = this.add.text(80, 20, 'Stop', btnStyle).setOrigin(0.5).setInteractive({ useHandCursor: true });

        playBtn.on('pointerup', () => {
            if (!sound.isPlaying) sound.play();
        });
        pauseBtn.on('pointerup', () => {
            if (sound.isPlaying) sound.pause();
        });
        stopBtn.on('pointerup', () => {
            if (sound.isPlaying() || sound.isPaused()) sound.stop();
        });

        // Close text
        const closeText = this.add.text(0, 80, 'Click to Close', {
            fontSize: '24px',
            color: '#FFD700',
            backgroundColor: '#222',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5, 0);

        closeText.setInteractive({ useHandCursor: true });
        closeText.on('pointerup', () => {
            sound.stop();
            this.closePopup();
        });

        this.popup.add([bg, label, playBtn, pauseBtn, stopBtn, closeText]);
    }

    // POPUP for Particles (just show key)
    showPopupParticle(key) {
        this.closePopup();
        this.popup = this.add.container(this.scale.width / 2, this.scale.height / 2);

        // Dim background
        const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8)
            .setOrigin(0.5)
            .setInteractive();
        bg.on('pointerup', () => this.closePopup());

        // Particle label
        const label = this.add.text(0, 0, `Particle: ${key}`, {
            fontSize: '24px',
            color: '#FFD700',
            backgroundColor: '#222',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);

        // Close text
        const closeText = this.add.text(0, 60, 'Click to Close', {
            fontSize: '24px',
            color: '#FFD700',
            backgroundColor: '#222',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5, 0);

        closeText.setInteractive({ useHandCursor: true });
        closeText.on('pointerup', () => this.closePopup());

        this.popup.add([bg, label, closeText]);
    }

    closePopup() {
        if (this.popup) {
            this.popup.destroy();
            this.popup = null;
        }
    }

    scrollGallery(deltaY) {
        const viewHeight = this.scale.height - 120; // Account for header and tabs
        const maxScroll = Math.max(0, this.galleryHeight - viewHeight);
        this.scrollY = Phaser.Math.Clamp(this.scrollY + deltaY, 0, maxScroll);
        this.galleryContainer.y = 120 - this.scrollY; // Keep tabs visible at top
    }
}

// This function grabs a frame and adds it as a Phaser texture
function createVideoThumbnail(scene, videoPath, key, seekTime = 1) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        // Use centralized path configuration for video URLs
        const fullVideoPath = PATH_UTILS.getGalleryAssetUrl(videoPath);
        console.log(`Creating video thumbnail for ${key} from ${fullVideoPath}`);
        video.src = fullVideoPath;
        video.crossOrigin = 'anonymous';
        video.currentTime = seekTime;
        video.muted = true;
        video.playsInline = true;

        video.addEventListener('loadeddata', () => {
            // Wait for seek to complete
            video.currentTime = seekTime;
        });

        video.addEventListener('seeked', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL('image/png');

            // Add as Phaser texture
            scene.textures.addBase64(key + '_thumb', dataURL);
            resolve(key + '_thumb');
        });

        video.addEventListener('error', (e) => {
            reject(e);
        });
    });
}