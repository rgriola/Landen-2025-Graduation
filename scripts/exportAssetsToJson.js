const fs = require('fs');
const path = require('path');

// Path to your assets.js file
const assetsJsPath = path.join(__dirname, '../src/game/assets.js');
const assetsJsonPath = path.join(__dirname, '../src/game/assets.json');

const file = fs.readFileSync(assetsJsPath, 'utf8');

// Helper to extract array from export
function extractArray(name) {
    const regex = new RegExp(`export const ${name} = (\\[[\\s\\S]*?\\]);`);
    const match = file.match(regex);
    if (!match) return [];
    try {
        return JSON.parse(match[1]);
    } catch (e) {
        console.error(`Failed to parse ${name}:`, e);
        return [];
    }
}

const images = extractArray('images');
const videos = extractArray('videos');
const audio = extractArray('audio');
const particles = extractArray('particles');

const manifest = { images, videos, audio, particles };

fs.writeFileSync(assetsJsonPath, JSON.stringify(manifest, null, 2));
console.log('Exported assets.json!');