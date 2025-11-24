/**
 * Asset Manager for Phaser Game (JSON version)
 * 
 * This script scans the assets directory and updates the assets.json file.
 * It preserves all values for existing assets and only adds/removes assets as needed.
 * Handles "particle" assets in a dedicated array, with no duplication in other arrays.
 * Preserves ALL fields for existing assets (including custom fields).
 * 
 * Usage:
 *   node generateAssetsJson.js [relative/path/to/assets/folder] [output/path/assets.json]
 *
 *   node generateAssetsJson.js ./public/assets ./public/assets.json
 * */

const fs = require('fs');
const path = require('path');

// === CONFIGURATION ===
const assetDirArg = process.argv[2];
const outputFileArg = process.argv[3];

const config = {
    assetDir: assetDirArg ? path.resolve(assetDirArg) : path.join(__dirname, 'public', 'assets'),
    outputFile: outputFileArg ? path.resolve(outputFileArg) : path.join(__dirname, 'src', 'game', 'assets.json'),
    extensions: {
        images: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
        audio: ['.mp3', '.ogg', '.wav', '.m4a'],
        video: ['.mp4', '.webm', '.ogg']
    }
};

// === FILE SCANNER ===
function scanAssetDirectory() {
    console.log(`Scanning asset directory: ${config.assetDir}`);
    
    // Setup asset collections
    const assetCollections = {
        found: {
            images: new Set(),
            particles: new Set(),
            audio: new Set(),
            videos: new Set()
        },
        existing: readExistingAssets()
    };
    
    // Scan for files
    walkDirectory(config.assetDir, filepath => {
        // Get path RELATIVE TO assets directory (not public)
        const relPath = path.relative(config.assetDir, filepath).replace(/\\/g, '/');
        const ext = path.extname(filepath).toLowerCase();
        const lowerRelPath = relPath.toLowerCase();

        // Handle "particle" assets in a dedicated array
        if (lowerRelPath.includes('particle')) {
            assetCollections.found.particles.add(relPath);
            return; // Do not add to any other array!
        }

        if (config.extensions.images.includes(ext)) {
            assetCollections.found.images.add(relPath);
        } else if (config.extensions.audio.includes(ext)) {
            assetCollections.found.audio.add(relPath);
        } else if (config.extensions.video.includes(ext)) {
            assetCollections.found.videos.add(relPath);
        }
    });
    
    return assetCollections;
}

// === READ EXISTING ASSETS ===
function readExistingAssets() {
    const existingAssets = {
        images: [],
        particles: [],
        audio: [],
        videos: []
    };
    
    if (!fs.existsSync(config.outputFile)) {
        return existingAssets;
    }
    
    try {
        const fileContent = fs.readFileSync(config.outputFile, 'utf8');
        const json = JSON.parse(fileContent);
        for (const type of Object.keys(existingAssets)) {
            if (Array.isArray(json[type])) {
                existingAssets[type] = json[type];
            }
        }
        return existingAssets;
    } catch (error) {
        console.error(`Error reading existing JSON file: ${error.message}`);
        return existingAssets;
    }
}

// === HELPER FUNCTIONS ===
function walkDirectory(dir, callback) {
    if (!fs.existsSync(dir)) {
        console.error(`Directory not found: ${dir}`);
        return;
    }
    
    fs.readdirSync(dir).forEach(file => {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walkDirectory(filepath, callback);
        } else {
            callback(filepath);
        }
    });
}

function normalizePath(assetPath) {
    if (assetPath.startsWith('assets/')) {
        return assetPath.replace('assets/', '');
    }
    return assetPath;
}

function updateAssetLists(assetCollections) {
    const { found, existing } = assetCollections;
    const updated = {};
    
    for (const [type, foundSet] of Object.entries(found)) {
        const existingList = existing[type] || [];
        updated[type] = updateAssetList(existingList, foundSet, type);
    }
    
    return updated;
}

function updateAssetList(existingList, foundSet, type) {
    // Normalize existing assets - create lookup map without "assets/" prefix
    const existingMap = new Map();
    existingList.forEach(asset => {
        const normalizedPath = normalizePath(asset.path);
        existingMap.set(normalizedPath, asset);
    });

    const updated = [];
    const before = new Map(existingList.map(a => [normalizePath(a.path), {...a}]));

    // Process found assets
    foundSet.forEach(path => {
        if (existingMap.has(path)) {
            const original = existingMap.get(path);
            const preserved = JSON.parse(JSON.stringify(original));
            preserved.path = path;
            updated.push(preserved);
        } else {
            const base = path.split('/').pop().replace(/\.[^/.]+$/, "");
            const newAsset = {
                key: base,
                path: path,
                label: 'NEED LABEL'
            };
            updated.push(newAsset);
        }
    });

    return updated;
}

// === MAIN EXECUTION ===
function main() {
    try {
        console.log('Starting asset generation...');
        
        // Scan assets directory
        const assetCollections = scanAssetDirectory();
        
        // Update asset lists
        const updatedAssets = updateAssetLists(assetCollections);
        
        // Generate output (pure JSON)
        const output = JSON.stringify(updatedAssets, null, 2);
        
        // Write to file
        fs.writeFileSync(config.outputFile, output);
        
        // Log summary
        console.log('\nAsset Generation Summary:');
        for (const [type, assets] of Object.entries(updatedAssets)) {
            console.log(`- ${type}: ${assets.length} assets`);
        }
        console.log(`\nGenerated ${config.outputFile} successfully!`);
    } catch (error) {
        console.error('Error generating assets:', error);
    }
}

// Execute the main function
main();