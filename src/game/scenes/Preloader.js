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

        // Load root-level assets (these don't need assets/ prefix)
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

        // Load all images with assets/ prefix
        manifest.images.forEach(img => {
            const path = img.path || `${img.key}.png`;
            this.load.image(img.key, `assets/${path}`);
        });
        
        // Load all particles with assets/ prefix
        manifest.particles.forEach(p => {
            const path = p.path || `${p.key}.png`;
            this.load.image(p.key, `assets/${path}`);
        });
        
        // Load all audio with assets/ prefix
        manifest.audio.forEach(audio => {
            this.load.audio(audio.key, `assets/${audio.path}`);
        });
        
        // Load all videos with assets/ prefix
        manifest.videos.forEach(vid => {
            this.load.video(vid.key, `assets/${vid.path}`, vid.loop || false, vid.muted || false);
        });

        // Start loading the queued assets
        this.load.once('complete', () => {
            // Store manifest globally
            this.registry.set('assetsManifest', manifest);
            this.scene.start('MainMenu');
        });
        this.load.start();
    }
}
