import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

     init() {
            const halfX = this.scale.width / 2;
            const halfY = this.scale.height / 2;

            // BACKGROUND
            this.add.image(halfX, halfY, 'background')
                .setOrigin(0.5, 0.5)
                .setScale(3);

            //  Progress bar setup
            this.add.rectangle(halfX, halfY, 468, 32).setStrokeStyle(1, 0xffffff);
            
            const bar = this.add.rectangle(halfX - 230, halfY, 4, 28, 0xffffff);
            
            this.load.on('progress', (progress) => {
                bar.width = 4 + (460 * progress);
            });
        }

    preload() {
        // Load the manifest first
        this.load.json('assetsManifest', 'assets.json');

        // Any additional assets not in the configuration
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
        this.load.image('fullscreen', 'full-screen.png');
    }

    create () {

        const manifest = this.cache.json.get('assetsManifest');
            if (!manifest) {
                console.error('assetsManifest not loaded!');
                return;
                }

        // Set path if needed (adjust if your assets are in a subfolder)
        this.load.setPath('assets');
        
        // Load all images
        manifest.images.forEach(img => this.load.image(img.key, img.path || `${img.key}.png`));
        // Load all particles
        manifest.particles.forEach(p => this.load.image(p.key, p.path || `${p.key}.png`));
        // Load all audio
        manifest.audio.forEach(audio => this.load.audio(audio.key, audio.path));
        // Load all videos
        manifest.videos.forEach(vid => this.load.video(vid.key, vid.path, vid.loop || false, vid.muted || false));

        // Start loading the queued assets
        this.load.once('complete', () => {
            // Optionally store manifest globally
            this.registry.set('assetsManifest', manifest);
            this.scene.start('MainMenu');
        });
        this.load.start();
    }
}
