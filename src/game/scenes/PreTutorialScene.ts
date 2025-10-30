import Phaser from 'phaser';
import questionsData from '@/data/questions.json';

export class PreTutorialScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.StaticGroup;
  private npc!: Phaser.GameObjects.Container;
  private portal!: Phaser.GameObjects.Rectangle;
  private canInteract: boolean = false;
  private questionAnswered: boolean = false;

  constructor() {
    super({ key: 'PreTutorialScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);
    
    // Ground
    this.add.rectangle(0, height - 40, width, 40, 0x95E77D).setOrigin(0);

    // Physics groups
    this.platforms = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();

    // Create ground platform
    const ground = this.add.rectangle(width / 2, height - 20, width, 40, 0x95E77D);
    this.platforms.add(ground);

    // Create some floating platforms
    this.createPlatform(200, height - 120, 120, 20);
    this.createPlatform(400, height - 180, 120, 20);
    this.createPlatform(600, height - 120, 120, 20);

    // Create coins
    this.createCoin(220, height - 160);
    this.createCoin(420, height - 220);
    this.createCoin(620, height - 160);
    this.createCoin(300, height - 80);
    this.createCoin(500, height - 80);
    this.createCoin(100, height - 80);

    // Create player
    this.player = this.createPlayer(100, height - 100);

    // Create NPC (Cofrinho)
    this.npc = this.createNPC(300, height - 90);

    // Create portal
    this.portal = this.createPortal(700, height - 100);

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      down: Phaser.Input.Keyboard.KeyCodes.S,
    }) as any;
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.input.keyboard!.on('keydown-E', () => {
      if (this.canInteract) {
        this.showQuestion();
      }
    });

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin as any, undefined, this);
    this.physics.add.overlap(this.player, this.portal, this.nearPortal as any, undefined, this);

    // Show intro text
    this.showIntroText();
  }

  update() {
    if (!this.player || !this.player.body) return;

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // Movement
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      playerBody.setVelocityX(-200);
      this.player.setScale(-1, 1); // Flip horizontally
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      playerBody.setVelocityX(200);
      this.player.setScale(1, 1); // Normal orientation
    } else {
      playerBody.setVelocityX(0);
    }

    // Jump
    if ((this.cursors.up.isDown || this.wasd.up.isDown || this.spaceKey.isDown) && playerBody.touching.down) {
      playerBody.setVelocityY(-400);
    }
  }

  createPlayer(x: number, y: number): Phaser.GameObjects.Rectangle {
    const player = this.add.rectangle(x, y, 32, 32, 0xFF8C42);
    this.physics.add.existing(player);
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    return player;
  }

  createPlatform(x: number, y: number, width: number, height: number) {
    const platform = this.add.rectangle(x, y, width, height, 0x8B4513);
    this.platforms.add(platform);
  }

  createCoin(x: number, y: number) {
    const coin = this.add.circle(x, y, 12, 0xFFD700);
    this.physics.add.existing(coin, true); // Make it static (immovable)
    this.coins.add(coin);
    
    // Floating animation
    this.tweens.add({
      targets: coin,
      y: y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  collectCoin(player: any, coin: any) {
    coin.destroy();
    
    // Update game state
    const gameState = this.registry.get('gameState');
    gameState.coins += 1;
    this.registry.set('gameState', gameState);
    localStorage.setItem('coins', gameState.coins.toString());
    
    // Update HUD
    this.game.events.emit('updateHUD');
    
    // Visual feedback
    const text = this.add.text(coin.x, coin.y, '+1', {
      fontSize: '20px',
      color: '#FFD700',
      fontFamily: 'Arial Black',
    });
    text.setOrigin(0.5);
    
    this.tweens.add({
      targets: text,
      y: coin.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });
  }

  createNPC(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // NPC body (piggy bank style)
    const body = this.add.circle(0, 0, 24, 0xFF69B4);
    const snout = this.add.ellipse(10, 5, 16, 12, 0xFFC0CB);
    const eye1 = this.add.circle(-8, -8, 4, 0x000000);
    const eye2 = this.add.circle(8, -8, 4, 0x000000);
    
    container.add([body, snout, eye1, eye2]);
    
    // Speech bubble
    const bubble = this.add.container(0, -60);
    const bubbleBg = this.add.rectangle(0, 0, 200, 80, 0xFFFFFF, 0.95);
    bubbleBg.setStrokeStyle(3, 0x000000);
    const bubbleText = this.add.text(0, 0, 
      'Olá! Eu sou o\nCofrinho! Colete\nmoedas! 🪙', {
      fontSize: '14px',
      color: '#000000',
      fontFamily: 'Arial',
      align: 'center',
    });
    bubbleText.setOrigin(0.5);
    bubble.add([bubbleBg, bubbleText]);
    container.add(bubble);
    
    // Floating animation
    this.tweens.add({
      targets: container,
      y: y - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    return container;
  }

  createPortal(x: number, y: number): Phaser.GameObjects.Rectangle {
    const portal = this.add.rectangle(x, y, 40, 60, 0x4ECDC4);
    this.physics.add.existing(portal, true);
    
    // Glow effect
    this.tweens.add({
      targets: portal,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Add "E" prompt above portal
    const prompt = this.add.text(x, y - 40, 'Pressione E', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 },
    });
    prompt.setOrigin(0.5);
    prompt.setVisible(false);
    (portal as any).prompt = prompt;
    
    return portal as any;
  }

  nearPortal(player: any, portal: any) {
    this.canInteract = true;
    if (portal.prompt && !this.questionAnswered) {
      portal.prompt.setVisible(true);
    }
  }

  showIntroText() {
    const { width, height } = this.cameras.main;
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);
    overlay.setDepth(1000);
    
    const text = this.add.text(width / 2, height / 2,
      'BEM-VINDO AO PRÉ-TUTORIAL!\n\n' +
      'Use as SETAS ou WASD para mover\n' +
      'ESPAÇO ou SETA PARA CIMA para pular\n' +
      'E para interagir\n\n' +
      'Colete moedas e vá até o portal!\n\n' +
      'Clique para começar', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 10,
    });
    text.setOrigin(0.5);
    text.setDepth(1001);
    
    overlay.setInteractive();
    overlay.once('pointerdown', () => {
      overlay.destroy();
      text.destroy();
    });
  }

  showQuestion() {
    if (this.questionAnswered) return;
    
    const { width, height } = this.cameras.main;
    const question = questionsData.preTutorial;
    
    // Create question modal
    const modal = this.add.container(width / 2, height / 2);
    modal.setDepth(2000);
    
    const bg = this.add.rectangle(0, 0, 600, 400, 0xFFFFFF);
    bg.setStrokeStyle(6, 0xFFD700);
    
    const questionText = this.add.text(0, -140, question.question, {
      fontSize: '18px',
      color: '#000000',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 560 },
    });
    questionText.setOrigin(0.5);
    
    modal.add([bg, questionText]);
    
    // Create option buttons
    question.options.forEach((option, index) => {
      const y = -60 + index * 80;
      const button = this.createOptionButton(0, y, option, () => {
        this.handleAnswer(option, modal);
      });
      modal.add(button);
    });
  }

  createOptionButton(x: number, y: number, option: any, callback: () => void) {
    // Create button background as Rectangle (better hit detection)
    const bg = this.add.rectangle(x, y, 500, 60, 0x4ECDC4);
    bg.setStrokeStyle(3, 0x000000);
    bg.setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true });
    
    const text = this.add.text(x, y, `${option.id}) ${option.text}`, {
      fontSize: '16px',
      color: '#000000',
      fontFamily: 'Arial',
      wordWrap: { width: 480 },
    });
    text.setOrigin(0.5);
    text.setDepth(1);
    
    bg.on('pointerover', () => {
      bg.setFillStyle(0x95E77D);
      bg.setScale(1.02);
      text.setScale(1.02);
    });
    
    bg.on('pointerout', () => {
      bg.setFillStyle(0x4ECDC4);
      bg.setScale(1);
      text.setScale(1);
    });
    
    bg.on('pointerdown', () => {
      bg.setScale(0.98);
      text.setScale(0.98);
      callback();
    });
    
    bg.on('pointerup', () => {
      bg.setScale(1);
      text.setScale(1);
    });
    
    return bg;
  }

  handleAnswer(option: any, modal: Phaser.GameObjects.Container) {
    if (option.correct) {
      // Correct answer
      const gameState = this.registry.get('gameState');
      gameState.psf += 10;
      this.registry.set('gameState', gameState);
      localStorage.setItem('psf', gameState.psf.toString());
      this.game.events.emit('updateHUD');
      
      this.showFeedback(option.feedback, true, () => {
        modal.destroy();
        this.questionAnswered = true;
        this.completeLevel();
      });
    } else {
      // Wrong answer
      this.showFeedback(option.feedback, false, () => {
        // Allow retry
      });
    }
  }

  showFeedback(text: string, isCorrect: boolean, onClose: () => void) {
    const { width, height } = this.cameras.main;
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.5);
    overlay.setOrigin(0);
    overlay.setDepth(3000);
    
    const feedbackBox = this.add.container(width / 2, height / 2);
    feedbackBox.setDepth(3001);
    
    const bg = this.add.rectangle(0, 0, 500, 200, isCorrect ? 0x95E77D : 0xFF6B6B);
    bg.setStrokeStyle(4, 0x000000);
    
    const feedbackText = this.add.text(0, -40, text, {
      fontSize: '16px',
      color: '#000000',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 460 },
    });
    feedbackText.setOrigin(0.5);
    
    const closeBtn = this.add.text(0, 60, isCorrect ? 'Continuar' : 'Tentar Novamente', {
      fontSize: '18px',
      color: '#000000',
      fontFamily: 'Arial Black',
      backgroundColor: '#FFFFFF',
      padding: { x: 20, y: 10 },
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive();
    
    feedbackBox.add([bg, feedbackText, closeBtn]);
    
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      feedbackBox.destroy();
      onClose();
    });
  }

  completeLevel() {
    const { width, height } = this.cameras.main;
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);
    overlay.setDepth(4000);
    
    const text = this.add.text(width / 2, height / 2,
      'PRÉ-TUTORIAL COMPLETO!\n\n' +
      'Você aprendeu os controles básicos!\n\n' +
      'Próximo: TUTORIAL\n\n' +
      'Clique para continuar', {
      fontSize: '24px',
      color: '#FFD700',
      fontFamily: 'Arial Black',
      align: 'center',
      lineSpacing: 10,
      stroke: '#000000',
      strokeThickness: 4,
    });
    text.setOrigin(0.5);
    text.setDepth(4001);
    
    overlay.setInteractive();
    overlay.once('pointerdown', () => {
      this.scene.start('TutorialScene');
    });
  }
}
