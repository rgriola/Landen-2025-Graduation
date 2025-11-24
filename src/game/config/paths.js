/**
 * Centralized Path Configuration
 * Handles base URLs for development and production environments
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

// Helper functions
export const PATH_UTILS = {
    // Get full URL for root asset
    getRootAssetUrl(filename) {
        const cacheBuster = `?v=${Date.now()}`;
        return BASE_PATHS.CURRENT ? `${BASE_PATHS.CURRENT}/${filename}${cacheBuster}` : `${filename}${cacheBuster}`;
    },
    
    // Get full URL for gallery asset
    getGalleryAssetUrl(filename) {
        // Assets are stored in the assets/ directory, but the JSON paths don't include this prefix
        const assetPath = `assets/${filename}`;
        const cacheBuster = `?v=${Date.now()}`;
        return BASE_PATHS.CURRENT 
            ? `${BASE_PATHS.CURRENT}/${assetPath}${cacheBuster}` 
            : `${assetPath}${cacheBuster}`;
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
// docs/assets/1974.jpg
// public/assets/1974.jpg
