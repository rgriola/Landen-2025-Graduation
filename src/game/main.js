if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Determine appropriate path based on hostname
    const isGithubPages = window.location.hostname === 'rgriola.github.io';
    const swPath = isGithubPages ? '/Landen_2025_Grad/service-worker.js' : '/service-worker.js';
    
    navigator.serviceWorker.register(swPath)
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
      })
      .catch((err) => {
        // Log but don't break the app
        console.log('ServiceWorker registration failed (app will still work):', err);
      });
  });
} else {
  // Service workers not supported but app continues
  console.log('Service workers not supported in this browser (app will still work)');
  }

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
