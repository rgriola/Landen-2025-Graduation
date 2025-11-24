import { PATH_UTILS } from './config/paths.js';

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
        mode: Phaser.Scale.FIT, // Use RESIZE_FIT for responsive scaling
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container', // Parent element ID
      //  width: window.innerWidth,
      //  height: window.innerHeight,
        width: 1920, // Fixed width for consistency
        height: 1080, // Fixed height for consistency
        zoom: 1.0, // Adjust zoom if needed
       // fullscreenTarget: document.body // Important: Specify the fullscreen target
       fullscreenTarget: 'game-container' // Use the parent element for fullscreen
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

export default StartGame;
