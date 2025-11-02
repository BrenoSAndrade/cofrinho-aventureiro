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

    // Create only JOGAR button
    this.createButton(width / 2, 280, 'JOGAR', () => this.startGame());

    // Footer
    const footer = this.add.text(width / 2, height - 20, 'Projeto de Extensão — Ensino de Educação Financeira', {
      fontSize: '12px',
      color: '#718096',
      fontFamily: 'Arial',
    });
    footer.setOrigin(0.5);

    // Show Sabedoria if available
    const gameState = this.registry.get('gameState');
    if (gameState.sabedoria > 0) {
      const sabedoriaText = this.add.text(width - 20, 20, `💡 ${gameState.sabedoria}`, {
        fontSize: '20px',
        color: '#FFD700',
        fontFamily: 'Arial Black',
        stroke: '#000000',
        strokeThickness: 3,
      });
      sabedoriaText.setOrigin(1, 0);
    }
  }

  createButton(x: number, y: number, text: string, callback: () => void) {
    // Create button background as a Rectangle (more reliable for hit detection)
    const button = this.add.rectangle(x, y, 240, 50, 0xFFD700);
    button.setStrokeStyle(4, 0xFF8C42);
    button.setOrigin(0.5);
    
    // Add shadow effect
    const shadow = this.add.rectangle(x, y + 4, 240, 50, 0xB8860B, 0.5);
    shadow.setOrigin(0.5);
    
    // Button text
    const buttonText = this.add.text(x, y, text, {
      fontSize: '24px',
      color: '#2D3748',
      fontFamily: 'Arial Black',
    });
    buttonText.setOrigin(0.5);
    buttonText.setDepth(1);

    // Make button interactive
    button.setInteractive({ useHandCursor: true });

    // Hover effects
    button.on('pointerover', () => {
      console.log('Button hover');
      button.setScale(1.05);
      buttonText.setScale(1.05);
      shadow.setScale(1.05);
    });

    button.on('pointerout', () => {
      button.setScale(1);
      buttonText.setScale(1);
      shadow.setScale(1);
    });

    button.on('pointerdown', () => {
      console.log('Button clicked - calling callback');
      button.setScale(0.95);
      buttonText.setScale(0.95);
      shadow.setScale(0.95);
      callback();
    });

    button.on('pointerup', () => {
      button.setScale(1);
      buttonText.setScale(1);
      shadow.setScale(1);
    });
  }

  startGame() {
    console.log('Starting game...');
    
    // Reset game state
    const gameState = {
      sabedoria: 0,
      coins: 0,
      currentLevel: 'preTutorial',
      completedLevels: [],
    };
    
    // Update registry
    this.registry.set('gameState', gameState);
    
    // Clear localStorage
    localStorage.setItem('sabedoria', '0');
    localStorage.setItem('coins', '0');
    localStorage.setItem('currentLevel', 'preTutorial');
    localStorage.setItem('completedLevels', '[]');
    
    this.scene.stop('MenuScene');
    this.scene.start('PreTutorialScene');
    this.scene.launch('HUDScene');
  }
}
