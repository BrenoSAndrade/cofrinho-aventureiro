import Phaser from 'phaser';
import pixelSkyBg from '@/assets/pixel-sky-bg.png';
import playerPixel from '@/assets/player-pixel.png';
import npcPiggyPixel from '@/assets/npc-piggy-pixel.png';
import coinPixel from '@/assets/coin-pixel.png';
import groundTilePixel from '@/assets/ground-tile-pixel.png';
import brickTilePixel from '@/assets/brick-tile-pixel.png';
import portalPurplePixel from '@/assets/portal-purple-pixel.png';
import portalCyanPixel from '@/assets/portal-cyan-pixel.png';
import uiPanelPixel from '@/assets/ui-panel-pixel.png';
import buttonPixel from '@/assets/button-pixel.png';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load pixel art assets
    this.load.image('pixel-sky-bg', pixelSkyBg);
    this.load.image('player-pixel', playerPixel);
    this.load.image('npc-piggy-pixel', npcPiggyPixel);
    this.load.image('coin-pixel', coinPixel);
    this.load.image('ground-tile-pixel', groundTilePixel);
    this.load.image('brick-tile-pixel', brickTilePixel);
    this.load.image('portal-purple-pixel', portalPurplePixel);
    this.load.image('portal-cyan-pixel', portalCyanPixel);
    this.load.image('ui-panel-pixel', uiPanelPixel);
    this.load.image('button-pixel', buttonPixel);
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
