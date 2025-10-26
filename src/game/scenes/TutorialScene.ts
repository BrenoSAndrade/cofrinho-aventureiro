import Phaser from 'phaser';
import questionsData from '@/data/questions.json';

export class TutorialScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.Group;
  private portals!: Phaser.Physics.Arcade.StaticGroup;
  private currentPortal: any = null;
  private canInteract: boolean = false;
  private currentQuestionIndex: number = 0;
  private questionsAnswered: number = 0;

  constructor() {
    super({ key: 'TutorialScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);
    
    // Ground
    this.add.rectangle(0, height - 40, width, 40, 0x8B7355).setOrigin(0);

    // Physics groups
    this.platforms = this.physics.add.staticGroup();
    this.coins = this.physics.add.group();
    this.portals = this.physics.add.staticGroup();

    // Create ground platform
    const ground = this.add.rectangle(width / 2, height - 20, width, 40, 0x8B7355);
    this.platforms.add(ground);

    // Create platforms
    this.createPlatform(150, height - 100, 100, 20);
    this.createPlatform(300, height - 180, 120, 20);
    this.createPlatform(500, height - 260, 100, 20);
    this.createPlatform(650, height - 180, 120, 20);

    // Create coins
    for (let i = 0; i < 8; i++) {
      const x = 100 + i * 90;
      const y = height - 140 - Math.sin(i) * 60;
      this.createCoin(x, y);
    }

    // Create player
    this.player = this.createPlayer(80, height - 100);

    // Create portals for questions
    this.createPortal(320, height - 230, 0);
    this.createPortal(680, height - 230, 1);

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
      if (this.canInteract && this.currentPortal) {
        this.showQuestion(this.currentPortal.questionIndex);
      }
    });

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin as any, undefined, this);
    this.physics.add.overlap(this.player, this.portals, this.nearPortal as any, undefined, this);

    // Show intro text
    this.showIntroText();
  }

  update() {
    if (!this.player || !this.player.body) return;

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // Reset interaction state
    this.canInteract = false;

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

  createPlayer(x: number, y: number): Phaser.Physics.Arcade.Sprite {
    const player = this.add.rectangle(x, y, 32, 32, 0xFF8C42);
    this.physics.add.existing(player);
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    return player as any;
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
    
    const gameState = this.registry.get('gameState');
    gameState.coins += 1;
    this.registry.set('gameState', gameState);
    localStorage.setItem('coins', gameState.coins.toString());
    
    this.game.events.emit('updateHUD');
    
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

  createPortal(x: number, y: number, questionIndex: number) {
    const portal = this.add.rectangle(x, y, 50, 70, 0x9370DB);
    portal.setStrokeStyle(4, 0xFFD700);
    this.portals.add(portal);
    
    (portal as any).questionIndex = questionIndex;
    (portal as any).answered = false;
    
    // Glow effect
    this.tweens.add({
      targets: portal,
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Add number indicator
    const number = this.add.text(x, y, `${questionIndex + 1}`, {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4,
    });
    number.setOrigin(0.5);
    
    // Add "E" prompt
    const prompt = this.add.text(x, y - 50, 'Pressione E', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 },
    });
    prompt.setOrigin(0.5);
    prompt.setVisible(false);
    (portal as any).prompt = prompt;
  }

  nearPortal(player: any, portal: any) {
    if (!portal.answered) {
      this.canInteract = true;
      this.currentPortal = portal;
      if (portal.prompt) {
        portal.prompt.setVisible(true);
      }
    }
  }

  showIntroText() {
    const { width, height } = this.cameras.main;
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);
    overlay.setDepth(1000);
    
    const text = this.add.text(width / 2, height / 2,
      'TUTORIAL: PARQUE DA APRENDIZAGEM\n\n' +
      'Você vai responder 2 perguntas!\n\n' +
      'Cada portal tem uma pergunta.\n' +
      'Responda corretamente para avançar.\n\n' +
      'Lembre-se:\n' +
      'SETAS = mover | ESPAÇO = pular | E = interagir\n\n' +
      'Clique para começar', {
      fontSize: '18px',
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

  showQuestion(index: number) {
    const { width, height } = this.cameras.main;
    const question = questionsData.tutorial[index];
    
    // Create question modal
    const modal = this.add.container(width / 2, height / 2);
    modal.setDepth(2000);
    
    const bg = this.add.rectangle(0, 0, 650, 450, 0xFFFFFF);
    bg.setStrokeStyle(6, 0x9370DB);
    
    const questionText = this.add.text(0, -160, question.question, {
      fontSize: '20px',
      color: '#000000',
      fontFamily: 'Arial Bold',
      align: 'center',
      wordWrap: { width: 600 },
    });
    questionText.setOrigin(0.5);
    
    modal.add([bg, questionText]);
    
    // Create option buttons
    question.options.forEach((option, optIndex) => {
      const y = -60 + optIndex * 90;
      const button = this.createOptionButton(0, y, option, () => {
        this.handleAnswer(option, modal, index);
      });
      modal.add(button);
    });
  }

  createOptionButton(x: number, y: number, option: any, callback: () => void) {
    const button = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 580, 70, 0x4ECDC4);
    bg.setStrokeStyle(3, 0x000000);
    
    const text = this.add.text(0, 0, `${option.id}) ${option.text}`, {
      fontSize: '16px',
      color: '#000000',
      fontFamily: 'Arial',
      wordWrap: { width: 560 },
    });
    text.setOrigin(0.5);
    
    button.add([bg, text]);
    button.setSize(580, 70);
    button.setInteractive(new Phaser.Geom.Rectangle(-290, -35, 580, 70), Phaser.Geom.Rectangle.Contains);
    
    button.on('pointerover', () => {
      bg.setFillStyle(0x95E77D);
      button.setScale(1.02);
    });
    
    button.on('pointerout', () => {
      bg.setFillStyle(0x4ECDC4);
      button.setScale(1);
    });
    
    button.on('pointerdown', callback);
    
    return button;
  }

  handleAnswer(option: any, modal: Phaser.GameObjects.Container, questionIndex: number) {
    if (option.correct) {
      // Correct answer
      const gameState = this.registry.get('gameState');
      gameState.psf += 10;
      this.registry.set('gameState', gameState);
      localStorage.setItem('psf', gameState.psf.toString());
      this.game.events.emit('updateHUD');
      
      this.showFeedback(option.feedback, true, () => {
        modal.destroy();
        if (this.currentPortal) {
          this.currentPortal.answered = true;
          this.currentPortal.setAlpha(0.3);
          if (this.currentPortal.prompt) {
            this.currentPortal.prompt.setVisible(false);
          }
        }
        this.questionsAnswered++;
        
        if (this.questionsAnswered >= 2) {
          this.completeLevel();
        }
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
    
    const bg = this.add.rectangle(0, 0, 550, 250, isCorrect ? 0x95E77D : 0xFF6B6B);
    bg.setStrokeStyle(4, 0x000000);
    
    const icon = this.add.text(0, -80, isCorrect ? '✓' : '✗', {
      fontSize: '48px',
      color: '#000000',
      fontFamily: 'Arial Black',
    });
    icon.setOrigin(0.5);
    
    const feedbackText = this.add.text(0, -10, text, {
      fontSize: '16px',
      color: '#000000',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 500 },
    });
    feedbackText.setOrigin(0.5);
    
    const closeBtn = this.add.text(0, 80, isCorrect ? 'Continuar' : 'Tentar Novamente', {
      fontSize: '18px',
      color: '#000000',
      fontFamily: 'Arial Black',
      backgroundColor: '#FFFFFF',
      padding: { x: 20, y: 10 },
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive();
    
    feedbackBox.add([bg, icon, feedbackText, closeBtn]);
    
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      feedbackBox.destroy();
      onClose();
    });
  }

  completeLevel() {
    const { width, height } = this.cameras.main;
    
    const gameState = this.registry.get('gameState');
    gameState.psf += 50; // Bonus for completing level
    this.registry.set('gameState', gameState);
    localStorage.setItem('psf', gameState.psf.toString());
    this.game.events.emit('updateHUD');
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    overlay.setOrigin(0);
    overlay.setDepth(4000);
    
    const text = this.add.text(width / 2, height / 2,
      '🎉 TUTORIAL COMPLETO! 🎉\n\n' +
      'Você ganhou +50 PSF de bônus!\n\n' +
      'Você aprendeu sobre:\n' +
      '• Necessidades vs Desejos\n' +
      '• Poupar para objetivos\n\n' +
      'Total de PSF: ' + gameState.psf + '\n\n' +
      'Clique para voltar ao menu', {
      fontSize: '22px',
      color: '#FFD700',
      fontFamily: 'Arial Black',
      align: 'center',
      lineSpacing: 12,
      stroke: '#000000',
      strokeThickness: 4,
    });
    text.setOrigin(0.5);
    text.setDepth(4001);
    
    overlay.setInteractive();
    overlay.once('pointerdown', () => {
      this.scene.stop('HUDScene');
      this.scene.start('MenuScene');
    });
  }
}
