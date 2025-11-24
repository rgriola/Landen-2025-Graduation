import { Scene } from 'phaser';
import { PATH_UTILS } from '../config/paths.js';

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
        // Load the manifest first (essential assets already loaded in Boot scene)
        this.load.json('assetsManifest', PATH_UTILS.getRootAssetUrl('assets.json'));
    }

    create () {
        const manifest = this.cache.json.get('assetsManifest');
        if (!manifest) {
            console.error('assetsManifest not loaded!');
            return;
        }

        // Load all images using centralized path configuration
        manifest.images.forEach(img => {
            const path = img.path || `${img.key}.png`;
            const fullPath = PATH_UTILS.getGalleryAssetUrl(path);
            console.log(`Loading image: ${img.key} from ${fullPath}`);
            this.load.image(img.key, fullPath);
        });
        
        // Load all particles using centralized path configuration
        manifest.particles.forEach(p => {
            const path = p.path || `${p.key}.png`;
            this.load.image(p.key, PATH_UTILS.getGalleryAssetUrl(path));
        });
        
        // Load all audio using centralized path configuration
        manifest.audio.forEach(audio => {
            this.load.audio(audio.key, PATH_UTILS.getGalleryAssetUrl(audio.path));
        });
        
        // Load all videos using centralized path configuration
        manifest.videos.forEach(vid => {
            this.load.video(vid.key, PATH_UTILS.getGalleryAssetUrl(vid.path), vid.loop || false, vid.muted || false);
        });

        // Add error handling for failed loads
        this.load.on('loaderror', (file) => {
            console.error(`Failed to load file: ${file.type} "${file.key}" from URL: ${file.url}`);
        });

        // Start loading the queued assets
        this.load.once('complete', () => {
            // Store manifest globally
            this.registry.set('assetsManifest', manifest);
            console.log('All assets loaded successfully. Starting MainMenu...');
            this.scene.start('MainMenu');
        });
        this.load.start();
    }
}
