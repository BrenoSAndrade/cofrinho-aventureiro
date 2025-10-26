import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background gradient
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xFFE4B5, 0xFFE4B5, 1);
    graphics.fillRect(0, 0, width, height);

    // Title
    const title = this.add.text(width / 2, 80, 'COFRE AVENTUREIRO', {
      fontSize: '48px',
      color: '#FFD700',
      fontFamily: 'Arial Black',
      stroke: '#FF8C42',
      strokeThickness: 6,
    });
    title.setOrigin(0.5);
    title.setShadow(4, 4, '#000000', 4);

    // Subtitle
    const subtitle = this.add.text(width / 2, 140, 'Aprenda sobre dinheiro enquanto se diverte!', {
      fontSize: '18px',
      color: '#4A5568',
      fontFamily: 'Arial',
    });
    subtitle.setOrigin(0.5);

    // Create buttons
    const buttons = [
      { text: 'JOGAR', action: () => this.startGame() },
      { text: 'CONTINUAR', action: () => this.continueGame() },
      { text: 'TUTORIAL', action: () => this.startTutorial() },
      { text: 'CRÉDITOS', action: () => this.showCredits() },
    ];

    buttons.forEach((btn, index) => {
      const y = 220 + index * 60;
      this.createButton(width / 2, y, btn.text, btn.action);
    });

    // Footer
    const footer = this.add.text(width / 2, height - 20, 'Projeto de Extensão — Ensino de Educação Financeira', {
      fontSize: '12px',
      color: '#718096',
      fontFamily: 'Arial',
    });
    footer.setOrigin(0.5);

    // Show PSF if available
    const gameState = this.registry.get('gameState');
    if (gameState.psf > 0) {
      const psfText = this.add.text(width - 20, 20, `PSF: ${gameState.psf}`, {
        fontSize: '20px',
        color: '#FFD700',
        fontFamily: 'Arial Black',
        stroke: '#000000',
        strokeThickness: 3,
      });
      psfText.setOrigin(1, 0);
    }
  }

  createButton(x: number, y: number, text: string, callback: () => void) {
    const button = this.add.container(x, y);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0xFFD700, 1);
    bg.fillRoundedRect(-120, -25, 240, 50, 10);
    bg.lineStyle(4, 0xFF8C42, 1);
    bg.strokeRoundedRect(-120, -25, 240, 50, 10);

    // Button shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0xB8860B, 1);
    shadow.fillRoundedRect(-120, -21, 240, 50, 10);

    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '24px',
      color: '#2D3748',
      fontFamily: 'Arial Black',
    });
    buttonText.setOrigin(0.5);

    button.add([shadow, bg, buttonText]);
    button.setSize(240, 50);
    (button as any).setInteractive(new Phaser.Geom.Rectangle(-120, -25, 240, 50), Phaser.Geom.Rectangle.Contains);

    // Hover effect
    button.on('pointerover', () => {
      button.setScale(1.05);
      this.tweens.add({
        targets: button,
        y: y - 5,
        duration: 100,
        ease: 'Power2',
      });
    });

    button.on('pointerout', () => {
      button.setScale(1);
      this.tweens.add({
        targets: button,
        y: y,
        duration: 100,
        ease: 'Power2',
      });
    });

    button.on('pointerdown', () => {
      button.setScale(0.95);
      this.time.delayedCall(100, () => {
        callback();
      });
    });
  }

  startGame() {
    this.scene.start('PreTutorialScene');
    this.scene.launch('HUDScene');
  }

  continueGame() {
    const gameState = this.registry.get('gameState');
    const currentLevel = gameState.currentLevel || 'preTutorial';
    
    if (currentLevel === 'preTutorial') {
      this.scene.start('PreTutorialScene');
    } else if (currentLevel === 'tutorial') {
      this.scene.start('TutorialScene');
    }
    
    this.scene.launch('HUDScene');
  }

  startTutorial() {
    this.scene.start('TutorialScene');
    this.scene.launch('HUDScene');
  }

  showCredits() {
    const { width, height } = this.cameras.main;
    
    // Create semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    // Credits text
    const credits = this.add.text(width / 2, height / 2, 
      'COFRE AVENTUREIRO\n\n' +
      'Desenvolvido como projeto educativo\n' +
      'Foco: Educação Financeira Infantil\n\n' +
      'Para crianças de 7 a 12 anos\n\n' +
      'Clique para voltar', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 10,
    });
    credits.setOrigin(0.5);

    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => {
      overlay.destroy();
      credits.destroy();
    });
  }
}
