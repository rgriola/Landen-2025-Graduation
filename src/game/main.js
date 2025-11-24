import { PATH_UTILS, VIEWPORT_CONFIG } from './config/paths.js';

import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game as MainGame } from './scenes/Game';
import { AssetGallery } from './scenes/AssetGallery';
import { GameOver } from './scenes/GameOver';
import { Fishbowl } from './scenes/Fishbowl';
import { AUTO, Game } from 'phaser';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    title: 'Landen 2025 Grad',
    backgroundColor: '#0088FF',
    scale: {
        mode: Phaser.Scale[VIEWPORT_CONFIG.SCALE_MODE], // Centralized scale mode
        autoCenter: Phaser.Scale[VIEWPORT_CONFIG.AUTO_CENTER], // Centralized auto center
        parent: VIEWPORT_CONFIG.PARENT_ELEMENT, // Centralized parent element
        width: VIEWPORT_CONFIG.WIDTH, // Centralized viewport width
        height: VIEWPORT_CONFIG.HEIGHT, // Centralized viewport height
        zoom: VIEWPORT_CONFIG.ZOOM, // Centralized zoom level
        fullscreenTarget: VIEWPORT_CONFIG.FULLSCREEN_TARGET // Centralized fullscreen target
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame, // GAME
        AssetGallery,
        Fishbowl,
        GameOver
    ]
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
}

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    StartGame('game-container');
});

export default StartGame;
