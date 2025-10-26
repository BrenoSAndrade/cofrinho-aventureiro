import Phaser from 'phaser';

export class HUDScene extends Phaser.Scene {
  private psfText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HUDScene', active: false });
  }

  create() {
    const { width } = this.cameras.main;

    // PSF Display (top right)
    this.psfText = this.add.text(width - 20, 20, 'PSF: 0', {
      fontSize: '24px',
      color: '#FFD700',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.psfText.setOrigin(1, 0);
    this.psfText.setScrollFactor(0);
    this.psfText.setDepth(100);

    // Coins Display (top left)
    this.coinsText = this.add.text(20, 20, '🪙 0', {
      fontSize: '24px',
      color: '#FFD700',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.coinsText.setOrigin(0);
    this.coinsText.setScrollFactor(0);
    this.coinsText.setDepth(100);

    // Update initially
    this.updateHUD();

    // Listen for updates
    this.game.events.on('updateHUD', this.updateHUD, this);
  }

  updateHUD() {
    const gameState = this.registry.get('gameState');
    if (gameState) {
      this.psfText.setText(`PSF: ${gameState.psf}`);
      this.coinsText.setText(`🪙 ${gameState.coins}`);
    }
  }

  shutdown() {
    this.game.events.off('updateHUD', this.updateHUD, this);
  }
}
