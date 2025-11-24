/**
 * Centralized Configuration
 * Handles paths, viewport settings, and environment detection
 */

// Detect environment based on hostname
const isGitHubPages = window.location.hostname === 'rgriola.github.io';
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Base path configuration
export const BASE_PATHS = {
    // GitHub Pages subdirectory path
    GITHUB_PAGES: '/Landen-2025-Graduation',
    // Local development (no subdirectory)
    LOCAL_DEV: '',
    // Get current base path
    get CURRENT() {
        if (isGitHubPages) {
            return this.GITHUB_PAGES;
        } else if (isLocalDev) {
            return this.LOCAL_DEV;
        } else {
            // Fallback for other environments
            return '';
        }
    }
};

// Asset paths
export const ASSET_PATHS = {
    // Root assets (bg.png, logo.png, etc.)
    get ROOT() {
        return BASE_PATHS.CURRENT;
    },
    // Gallery assets (photos, videos, etc.)
    get ASSETS() {
      //  return `${BASE_PATHS.CURRENT}/assets`;
      return `https://media.githubusercontent.com/media/rgriola/Landen-2025-Graduation/refs/heads/main/docs/assets`
    },
    // Icons for PWA manifest
    get ICONS() {
        return `${BASE_PATHS.CURRENT}/icons`;
    }
};

// Viewport configuration
export const VIEWPORT_CONFIG = {
    // Default game resolution
    WIDTH: 1920,
    HEIGHT: 1080,
    
    // Scale settings
    SCALE_MODE: 'FIT', // Options: FIT, RESIZE, NONE, etc.
    AUTO_CENTER: 'CENTER_BOTH', // Options: CENTER_BOTH, CENTER_HORIZONTALLY, CENTER_VERTICALLY, NO_CENTER
    ZOOM: 1.0,
    
    // Parent container
    PARENT_ELEMENT: 'game-container',
    FULLSCREEN_TARGET: 'game-container',
    
    // Helper methods
    getAspectRatio() {
        return this.WIDTH / this.HEIGHT;
    },
    
    isLandscape() {
        return this.WIDTH > this.HEIGHT;
    },
    
    // Get responsive dimensions (for future use)
    getResponsiveDimensions() {
        const windowRatio = window.innerWidth / window.innerHeight;
        const gameRatio = this.getAspectRatio();
        
        if (windowRatio > gameRatio) {
            // Window is wider than game ratio
            return {
                width: window.innerHeight * gameRatio,
                height: window.innerHeight
            };
        } else {
            // Window is taller than game ratio
            return {
                width: window.innerWidth,
                height: window.innerWidth / gameRatio
            };
        }
    }
};

// Helper functions
export const PATH_UTILS = {
    // Get full URL for root asset
    getRootAssetUrl(filename) {
        // Use GitHub LFS URL for production, regular path for development  
        if (isGitHubPages) {
            return `https://media.githubusercontent.com/media/rgriola/Landen-2025-Graduation/refs/heads/main/docs/${filename}`;
        } else {
            // Local development - use regular path
            const cacheBuster = `?v=${Date.now()}`;
            return BASE_PATHS.CURRENT ? `${BASE_PATHS.CURRENT}/${filename}${cacheBuster}` : `${filename}${cacheBuster}`;
        }
    },
    
    // Get full URL for gallery asset
    getGalleryAssetUrl(filename) {
        if (isGitHubPages) {
            // Use GitHub LFS for all assets (images and videos)
            return `https://media.githubusercontent.com/media/rgriola/Landen-2025-Graduation/refs/heads/main/docs/assets/${filename}`;
        } else {
            // Local development - use regular path
            const assetPath = `assets/${filename}`;
            const cacheBuster = `?v=${Date.now()}`;
            return `${assetPath}${cacheBuster}`;
        }
    },
    
    // Check if we're in development
    isDevelopment() {
        return isLocalDev;
    },
    
    // Check if we're on GitHub Pages
    isProduction() {
        return isGitHubPages;
    }
};

console.log('Path Configuration:', {
    environment: isGitHubPages ? 'GitHub Pages' : isLocalDev ? 'Local Dev' : 'Unknown',
    basePath: BASE_PATHS.CURRENT,
    assetPath: ASSET_PATHS.ASSETS
});

// https://media.githubusercontent.com/media/rgriola/Landen-2025-Graduation/refs/heads/main/public/assets/1974.jpg
// https://media.githubusercontent.com/media/rgriola/Landen-2025-Graduation/refs/heads/main/docs/assets/1974.jpg
// https://media.githubusercontent.com/media/rgriola/Landen-2025-Graduation/raw/refs/heads/main/docs/assets/i-Love-you-dakota.webm

// docs/assets/1974.jpg
// public/assets/1974.jpg
