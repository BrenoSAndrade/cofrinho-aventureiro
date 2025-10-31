import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Pixel art sky background
    const bg = this.add.image(width / 2, height / 2, 'pixel-sky-bg');
    bg.setDisplaySize(width, height);

    // Title with pixel font
    const title = this.add.text(width / 2, 80, 'COFRE\nAVENTUREIRO', {
      fontSize: '32px',
      color: '#FFCD00',
      fontFamily: 'Press Start 2P',
      align: 'center',
      lineSpacing: 10,
    });
    title.setOrigin(0.5);
    // Pixel shadow (no blur)
    title.setShadow(3, 3, '#000000', 0, false, true);

    // Subtitle
    const subtitle = this.add.text(width / 2, 150, 'Aprenda sobre\ndinheiro!', {
      fontSize: '12px',
      color: '#FF8C42',
      fontFamily: 'Press Start 2P',
      align: 'center',
      lineSpacing: 8,
    });
    subtitle.setOrigin(0.5);

    // JOGAR button using sprite
    this.createButton(width / 2, 250, 'JOGAR', () => this.startGame());

    // Footer
    const footer = this.add.text(width / 2, height - 30, 'Projeto de Extensao\nEducacao Financeira', {
      fontSize: '8px',
      color: '#718096',
      fontFamily: 'Press Start 2P',
      align: 'center',
      lineSpacing: 6,
    });
    footer.setOrigin(0.5);

    // Show Sabedoria if available
    const gameState = this.registry.get('gameState');
    if (gameState.psf > 0) {
      // Wisdom icon sprite (we'll use text for now as icon)
      const psfContainer = this.add.container(width - 30, 20);
      
      const psfBg = this.add.rectangle(0, 0, 80, 30, 0x2C3E50);
      psfBg.setStrokeStyle(2, 0xFFCD00);
      
      const psfText = this.add.text(0, 0, `${gameState.psf}`, {
        fontSize: '16px',
        color: '#FFCD00',
        fontFamily: 'Press Start 2P',
      });
      psfText.setOrigin(0.5);
      
      psfContainer.add([psfBg, psfText]);
      psfContainer.setDepth(10);
    }
  }

  createButton(x: number, y: number, text: string, callback: () => void) {
    // Button container
    const container = this.add.container(x, y);
    
    // Button sprite as background
    const buttonBg = this.add.image(0, 0, 'button-pixel');
    buttonBg.setDisplaySize(200, 50);
    
    // Button shadow (pixel style - below button)
    const shadow = this.add.rectangle(3, 3, 200, 50, 0xA34300);
    shadow.setDepth(-1);
    
    // Button text with pixel font
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '16px',
      color: '#2D3748',
      fontFamily: 'Press Start 2P',
    });
    buttonText.setOrigin(0.5);
    
    container.add([shadow, buttonBg, buttonText]);
    
    // Make button interactive
    const hitArea = new Phaser.Geom.Rectangle(-100, -25, 200, 50);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.setSize(200, 50);

    // Hover effects (pixel style - no smooth scaling)
    container.on('pointerover', () => {
      buttonBg.setTint(0xFFFFAA);
      this.tweens.add({
        targets: container,
        y: y - 2,
        duration: 50,
        ease: 'Linear',
      });
    });

    container.on('pointerout', () => {
      buttonBg.clearTint();
      this.tweens.add({
        targets: container,
        y: y,
        duration: 50,
        ease: 'Linear',
      });
    });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        y: y + 2,
        duration: 50,
        ease: 'Linear',
        onComplete: () => {
          callback();
        },
      });
    });
  }

  startGame() {
    console.log('Starting game...');
    
    // Reset game state
    const gameState = {
      psf: 0,
      coins: 0,
      currentLevel: 'preTutorial',
      completedLevels: [],
    };
    
    // Update registry
    this.registry.set('gameState', gameState);
    
    // Clear localStorage
    localStorage.setItem('psf', '0');
    localStorage.setItem('coins', '0');
    localStorage.setItem('currentLevel', 'preTutorial');
    localStorage.setItem('completedLevels', '[]');
    
    this.scene.stop('MenuScene');
    this.scene.start('PreTutorialScene');
    this.scene.launch('HUDScene');
  }
}
