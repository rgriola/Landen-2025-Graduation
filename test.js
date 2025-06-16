const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'public', 'assets');
const outputFile = path.join(__dirname, 'src', 'game', 'assets.js');

const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const audioExtensions = ['.mp3', '.ogg', '.wav', '.m4a'];
const videoExtensions = ['.mp4', '.webm', '.ogg'];

const images = [];
const particles = [];
const audio = [];
const videos = [];

// Helper to walk directories recursively
function walk(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            walk(filepath, callback);
        } else {
            callback(filepath);
        }
    });
}

// --- NEW: Read existing arrays to preserve labels and special audio/video entries ---
let existingLabels = {
    images: {},
    particles: {},
    audio: {},
    videos: {}
};
let preservedAudio = {};
let preservedVideos = {};

if (fs.existsSync(outputFile)) {
    const content = fs.readFileSync(outputFile, 'utf8');
    // Use regex to extract the arrays
    const extractArray = (name) => {
        const match = content.match(new RegExp(`export const ${name} = (\\[[\\s\\S]*?\\]);`));
        if (match) {
            try {
                return JSON.parse(match[1]);
            } catch (e) {}
        }
        return [];
    };
    const oldImages = extractArray('images');
    const oldParticles = extractArray('particles');
    const oldAudio = extractArray('audio');
    const oldVideos = extractArray('videos');

    oldImages.forEach(img => {
        if (img.path) existingLabels.images[img.path] = img.label;
    });
    oldParticles.forEach(p => {
        if (p.path) existingLabels.particles[p.path] = p.label;
    });
    oldAudio.forEach(a => {
        if (a.key === 'backgroundMusic') preservedAudio[a.key] = a;
    });
    oldVideos.forEach(v => {
        if (v.key && v.key.includes('background_')) preservedVideos[v.key] = v;
    });
}

// Helper function to determine label
function getLabel(existing, relPath, base) {
    const prev = existing[relPath];
    if (!prev || prev === base) {
        return 'NEED LABEL';
    }
    return prev;
}

// Scan assets directory
walk(assetsDir, (filepath) => {
    const relPath = path.relative(assetsDir, filepath).replace(/\\/g, '/');
    const ext = path.extname(filepath).toLowerCase();
    const base = path.basename(filepath, ext);

    if (imageExtensions.includes(ext)) {
        if (relPath.includes('particle')) {
            particles.push({
                key: base,
                path: relPath,
                label: getLabel(existingLabels.particles, relPath, base),
                scale: 1
            });
        } else {
            images.push({
                key: base,
                path: relPath,
                label: getLabel(existingLabels.images, relPath, base),
                scale: 1,
                speed: 1
            });
        }
    } else if (audioExtensions.includes(ext)) {
        // Only add if not backgroundMusic, which is preserved
        if (base === 'backgroundMusic' && preservedAudio['backgroundMusic']) {
            audio.push(preservedAudio['backgroundMusic']);
        } else {
            audio.push({
                key: base,
                path: relPath
            });
        }
    } else if (videoExtensions.includes(ext)) {
        // Only add if not a background_ video, which is preserved
        if (base.startsWith('background_') && preservedVideos[base]) {
            videos.push(preservedVideos[base]);
        } else {
            videos.push({
                key: base,
                path: relPath,
                scale: 1,
                loop: false,
                muted: false,
                autoplay: false
            });
        }
    }
});

// Read the existing file (if it exists)
let existing = '';
if (fs.existsSync(outputFile)) {
    existing = fs.readFileSync(outputFile, 'utf8');
}

// Find the marker for where to preserve the manual code
const marker = '// === MANUAL ASSETS CODE BELOW ===';
let manualCode = '';
if (existing.includes(marker)) {
    manualCode = existing.substring(existing.indexOf(marker));
} else {
    // If marker not found, add a default ASSETS object and marker
    manualCode = `
${marker}
export const ASSETS = {
    images,
    particle: particles,
    audio,
    videos,
    preloadAll: function(scene) {
        // ...your existing preloadAll function...
    }
};
`;
}

// Write the new file: generated arrays + preserved manual code
const output = `// AUTO-GENERATED FILE. Edit only with generateAssetsJson.js!
export const images = ${JSON.stringify(images, null, 4)};
export const particles = ${JSON.stringify(particles, null, 4)};
export const audio = ${JSON.stringify(audio, null, 4)};
export const videos = ${JSON.stringify(videos, null, 4)};

${manualCode.trimStart()}
`;

fs.writeFileSync(outputFile, output);
console.log(`Generated ${outputFile} with ${images.length} images, ${particles.length} particles, ${audio.length} audio, ${videos.length} videos.`);


/*

node generateAssetsJson.js

// Load all images in the Preloader
    preloadAll: function(scene) {
        // Set path
        scene.load.setPath('assets');
        console.log('Assets PreloadALL loaded!');

        // Load all images
        this.images.forEach(img => {
            scene.load.image(img.key, img.path || `${img.key}.png`);
        });
            // Load all particle images
        if (this.particle) {
            this.particle.forEach(particle => {
                scene.load.image(particle.key, particle.path || `${particle.key}.png`);
            });
        }
        // Load all audio
        this.audio.forEach(audio => {
            scene.load.audio(audio.key, audio.path);
        });
        
        // Load all videos with proper settings
        this.videos.forEach(video => {
            scene.load.video(video.key, video.path, video.loop || false, video.muted || false);
        });
    }
};

*/