import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load initial assets here
    // For now, we'll use simple shapes and colors
    this.load.setPath('assets');
  }

  create() {
    // Initialize game state
    const gameState = {
      psf: parseInt(localStorage.getItem('psf') || '0'),
      coins: parseInt(localStorage.getItem('coins') || '0'),
      currentLevel: localStorage.getItem('currentLevel') || 'preTutorial',
      completedLevels: JSON.parse(localStorage.getItem('completedLevels') || '[]'),
    };

    this.registry.set('gameState', gameState);
    
    // Go to menu
    this.scene.start('MenuScene');
  }
}
