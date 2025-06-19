/**
 * Asset Manager for Phaser Game
 * 
 * This script scans the assets directory and updates the assets.js file.
 * It preserves all values for existing assets and only adds/removes assets as needed.
 * Uses base paths without "assets/" prefix for consistency with Phaser loading.
 * Handles "particle" assets in a dedicated array, with no duplication in other arrays.
 * Preserves ALL fields for existing assets (including custom fields).
 */

const fs = require('fs');
const path = require('path');

// === CONFIGURATION ===
const config = {
    assetDir: path.join(__dirname, 'public', 'assets'),
    outputFile: path.join(__dirname, 'src', 'game', 'assets.js'),
    extensions: {
        images: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
        audio: ['.mp3', '.ogg', '.wav', '.m4a'],
        video: ['.mp4', '.webm', '.ogg']
    },
    markerComment: '// === MANUAL ASSETS CODE BELOW ==='
};

// === DEBUG HELPERS ===
function logAsset(action, type, asset) {
    console.log(`[${action}] (${type}) ${asset.key}: ${asset.path} - Label: "${asset.label}"`);
}

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
    
    // Log existing assets
    logCurrentAssets(assetCollections.existing);
    
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
        console.log(`Warning: Output file not found: ${config.outputFile}`);
        return existingAssets;
    }
    
    try {
        const fileContent = fs.readFileSync(config.outputFile, 'utf8');
        
        // Direct method: extract assets using regex for better reliability
        for (const type of Object.keys(existingAssets)) {
            const regex = new RegExp(`export const ${type} = (\\[[\\s\\S]*?\\]);`);
            const match = fileContent.match(regex);
            
            if (match) {
                try {
                    // Clean up JSON for parsing
                    const cleaned = match[1].replace(/,(\s*[\]}])/g, '$1');
                    existingAssets[type] = JSON.parse(cleaned);
                    
                    // Debug: Check if all assets have labels
                    existingAssets[type].forEach(asset => {
                        if (!asset.label) {
                            console.log(`Warning: Asset missing label: ${asset.path}`);
                        }
                    });
                } catch (e) {
                    console.error(`ERROR parsing ${type} JSON: ${e.message}`);
                }
            }
        }
        
        return existingAssets;
    } catch (error) {
        console.error(`Error reading existing file: ${error.message}`);
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

function logCurrentAssets(existingAssets) {
    console.log('\n--- Current assets.js content ---');
    for (const [type, assets] of Object.entries(existingAssets)) {
        console.log(`${type.charAt(0).toUpperCase() + type.slice(1)}: ${assets.length} items`);
        
        // Log a sample of assets with their labels
        if (assets.length > 0) {
            console.log(`  Sample: ${assets[0].path} - Label: "${assets[0].label}"`);
            if (assets.length > 1) {
                console.log(`  Sample: ${assets[1].path} - Label: "${assets[1].label}"`);
            }
        }
    }
    console.log('--- End of current assets.js content ---\n');
}

// Normalize path to remove "assets/" prefix
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

    // Debug: Show all found and existing video paths/keys
    if (type === 'videos') {
        console.log('\n--- DEBUG: Found video files in directory ---');
        foundSet.forEach(path => {
            console.log('Found:', path);
        });
        console.log('--- DEBUG: Existing video manifest entries ---');
        existingList.forEach(asset => {
            console.log('Manifest:', asset.path, '| key:', asset.key);
        });
        console.log('---------------------------------------------\n');
    }

    // Process found assets
    foundSet.forEach(path => {
        if (existingMap.has(path)) {
            const original = existingMap.get(path);
            const preserved = JSON.parse(JSON.stringify(original));
            preserved.path = path;
            updated.push(preserved);
            if (type === 'videos') {
                console.log(`[KEPT] (video) ${preserved.key}: ${preserved.path} - All fields:`, preserved);
            }
            // else if (type === 'images' || type === 'particles' || type === 'audio') {
            //     logAsset('KEPT', type, preserved);
            // }
        } else {
            const base = path.split('/').pop().replace(/\.[^/.]+$/, "");
            const newAsset = {
                key: base,
                path: path,
                label: 'NEED LABEL'
            };
            updated.push(newAsset);
            if (type === 'videos') {
                console.log(`[ADDED/RESET] (video) ${base}: ${path} - New asset object:`, newAsset);
                // Try to find a close match by filename only
                const foundByFilename = existingList.find(a => path.split('/').pop() === a.path.split('/').pop());
                if (foundByFilename) {
                    console.log('  Close match by filename only:', foundByFilename);
                }
            }
            // else if (type === 'images' || type === 'particles' || type === 'audio') {
            //     logAsset('ADDED', type, newAsset);
            // }
        }
    });

    // Log removed assets
    existingList.forEach(asset => {
        const normalizedPath = normalizePath(asset.path);
        if (!foundSet.has(normalizedPath)) {
            if (type === 'videos') {
                console.log(`[REMOVED] (video) ${asset.key}: ${asset.path}`);
            }
            // else if (type === 'images' || type === 'particles' || type === 'audio') {
            //     logAsset('REMOVED', type, asset);
            // }
        }
    });

    // Debug: verify no labels were changed
    updated.forEach(asset => {
        const normalizedPath = normalizePath(asset.path);
        const original = before.get(normalizedPath);
        if (original && original.label !== asset.label && type === 'videos') {
            console.log(`CRITICAL ERROR: Label changed for ${asset.path}`);
            console.log(`  OLD: "${original.label}"`);
            console.log(`  NEW: "${asset.label}"`);
        }
    });

    // Debug: List unmatched foundSet and existingList paths for videos only
    if (type === 'videos') {
        const unmatchedFound = Array.from(foundSet).filter(path => !existingMap.has(path));
        const unmatchedExisting = existingList.map(a => normalizePath(a.path)).filter(path => !foundSet.has(path));
        if (unmatchedFound.length > 0) {
            console.log(`Unmatched foundSet paths for videos:`, unmatchedFound);
        }
        if (unmatchedExisting.length > 0) {
            console.log(`Unmatched existingList paths for videos:`, unmatchedExisting);
        }
    }

    return updated;
}

function preserveManualCode() {
    if (!fs.existsSync(config.outputFile)) {
        return `\n${config.markerComment}\n`;
    }
    
    try {
        const existing = fs.readFileSync(config.outputFile, 'utf8');
        if (existing.includes(config.markerComment)) {
            return existing.substring(existing.indexOf(config.markerComment));
        }
    } catch (error) {
        console.error(`Error reading file for manual code: ${error.message}`);
    }
    
    return `\n${config.markerComment}\n`;
}

function generateOutputFile(updatedAssets, manualCode) {
    // Spacing for better readability
    const jsonSpacing = 4;
    
    const output = `// AUTO-GENERATED FILE. Edit only with generateAssetsJson.js!
export const images = ${JSON.stringify(updatedAssets.images, null, jsonSpacing)};
export const particles = ${JSON.stringify(updatedAssets.particles, null, jsonSpacing)};
export const audio = ${JSON.stringify(updatedAssets.audio, null, jsonSpacing)};
export const videos = ${JSON.stringify(updatedAssets.videos, null, jsonSpacing)};

${manualCode.trimStart()}
`;
    return output;
}

// === MAIN EXECUTION ===
function main() {
    try {
        console.log('Starting asset generation...');
        
        // Scan assets directory
        const assetCollections = scanAssetDirectory();
        
        // Update asset lists
        const updatedAssets = updateAssetLists(assetCollections);
        
        // Preserve manual code
        const manualCode = preserveManualCode();
        
        // Generate output
        const output = generateOutputFile(updatedAssets, manualCode);
        
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

/*
--------------------------------------------------------------------------------
How this script works:
- Scans the assets directory for images, particles, audio, and videos.
- Uses base paths (no "assets/" prefix) for all assets.
- Handles "particle" assets in a dedicated array, with no duplication in other arrays.
- Reads the existing assets.js file to preserve ALL values for existing assets.
- Only adds new assets if they are new to the directory, and only removes assets if the file no longer exists.
- Does NOT modify or change any values for existing assets (including label and custom fields).
- Logs which assets were added or removed.
- Logs the current list in assets.js before making changes.
- Preserves any manual code below the marker in assets.js.
--------------------------------------------------------------------------------
*/