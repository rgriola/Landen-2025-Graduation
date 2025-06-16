import { FONTS } from '../config/fonts.js';

export class ImageWithLabel extends Phaser.GameObjects.Container {
    constructor(scene, x, y, texture, imageWithLabelId, options = {}) {
        super(scene, x, y);

        this.id = imageWithLabelId;

        // Create the image
        this.image = scene.add.image(0, 0, texture);
        if (options.scale) this.image.setScale(options.scale);

        // Create the label text
        this.nameText = scene.add.text(
            0,
            this.image.displayHeight / 2 -10 + (options.textOffsetY || 0),
            options.labelPrefix || texture,
            FONTS.styles.imageLabelA
        ).setOrigin(0.5, 0);

        // DEBUG TEXT
        this.debugText = scene.add.text(
            0,
            this.image.displayHeight / 2 + 60 + (options.textOffsetY || 0),
            '',
            FONTS.styles.debug
        ).setOrigin(0.5, 0).setVisible(!!options.debugMode);
        // Add all to the container
        this.add([this.image, this.nameText, this.debugText]);

        this.particles = scene.add.particles( 0,
                        this.image.displayHeight / 2 - 50,
                        'red_particle', {
                            color: [ 0x040d61, 0xfacc22, 0xf89800, 0xf83600, 0x9f0404, 0x4b4a4f, 0x353438, 0x040404 ],
                           // lifespan: 1500,
                            angle: { min: -100, max: -300 },
                            scale: 1,
                            speed: { min: 25, max: 200},
                            advance: 5000,
                            blendMode: 'ADD'
                        });
        
        // ADDS THE PARTICLES TO THE BOTTOM
        this.addAt(this.particles, 0);
    
        // Add the container to the scene
        scene.add.existing(this);

        // Store speed if needed
        this.speed = options.speed || 2;
        // DO NOT REMOVE
        console.log(`ImageWithLabel ${this.id} created at (${x}, ${y}) with texture ${texture}`);
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
        return this;
    }

    destroy(fromScene) {
        // This will destroy the container and all its children
        super.destroy(fromScene);
        console.log(`ImageWithLabel ${this.id} destroyed`);
        if (this.particles) {
            this.particles.destroy();
        }
    }

    // Optionally, add methods for updating debug text, etc.
}