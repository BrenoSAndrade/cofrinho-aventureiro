import Phaser from 'phaser';

export class HUDScene extends Phaser.Scene {
  private psfText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private psfContainer!: Phaser.GameObjects.Container;
  private coinsContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'HUDScene', active: false });
  }

  create() {
    const { width } = this.cameras.main;

    // Sabedoria Display (top right) - Pixel Art Style
    this.psfContainer = this.add.container(width - 15, 15);
    
    const psfBg = this.add.rectangle(0, 0, 70, 26, 0x2C3E50);
    psfBg.setStrokeStyle(2, 0xFFCD00);
    psfBg.setOrigin(1, 0);
    
    this.psfText = this.add.text(-8, 2, '0', {
      fontSize: '14px',
      color: '#FFCD00',
      fontFamily: 'Press Start 2P',
    });
    this.psfText.setOrigin(1, 0);
    this.psfText.setScrollFactor(0);
    this.psfText.setDepth(101);
    // Pixel shadow (no blur)
    this.psfText.setShadow(1, 1, '#000000', 0, false, true);
    
    this.psfContainer.add([psfBg, this.psfText]);
    this.psfContainer.setScrollFactor(0);
    this.psfContainer.setDepth(100);

    // Coins Display (top left) - Pixel Art Style
    this.coinsContainer = this.add.container(15, 15);
    
    const coinsBg = this.add.rectangle(0, 0, 70, 26, 0x2C3E50);
    coinsBg.setStrokeStyle(2, 0xFFCD00);
    coinsBg.setOrigin(0, 0);
    
    this.coinsText = this.add.text(8, 2, '0', {
      fontSize: '14px',
      color: '#FFCD00',
      fontFamily: 'Press Start 2P',
    });
    this.coinsText.setOrigin(0, 0);
    this.coinsText.setScrollFactor(0);
    this.coinsText.setDepth(101);
    // Pixel shadow (no blur)
    this.coinsText.setShadow(1, 1, '#000000', 0, false, true);
    
    this.coinsContainer.add([coinsBg, this.coinsText]);
    this.coinsContainer.setScrollFactor(0);
    this.coinsContainer.setDepth(100);

    // Update initially
    this.updateHUD();

    // Listen for updates
    this.game.events.on('updateHUD', this.updateHUD, this);
  }

  updateHUD() {
    const gameState = this.registry.get('gameState');
    if (gameState) {
      this.psfText.setText(`${gameState.psf}`);
      this.coinsText.setText(`${gameState.coins}`);
    }
  }

  shutdown() {
    this.game.events.off('updateHUD', this.updateHUD, this);
  }
}
