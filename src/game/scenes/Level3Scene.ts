import Phaser from 'phaser';
import questionsData from '@/data/questions.json';

export class Level3Scene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.StaticGroup;
  private portals!: Phaser.Physics.Arcade.StaticGroup;
  private currentPortal: any = null;
  private questionsAnswered: number = 0;

  constructor() {
    super({ key: 'Level3Scene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background (park style - lighter green)
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);
    
    // Ground (grass)
    this.add.rectangle(0, height - 40, width, 40, 0x228B22).setOrigin(0);

    // Physics groups
    this.platforms = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.portals = this.physics.add.staticGroup();

    // Create ground platform
    const ground = this.add.rectangle(width / 2, height - 20, width, 40, 0x228B22);
    this.platforms.add(ground);

    // Longer platforms
    this.createPlatform(180, height - 120, 140, 20);
    this.createPlatform(400, height - 190, 160, 20);
    this.createPlatform(630, height - 120, 140, 20);

    // Small trap holes (visual only)
    this.createTrap(320, height - 50);
    this.createTrap(550, height - 50);

    // Create coins (some higher up)
    this.createCoin(200, height - 160);
    this.createCoin(250, height - 160);
    this.createCoin(420, height - 240);
    this.createCoin(480, height - 240);
    this.createCoin(650, height - 170);
    this.createCoin(700, height - 170);
    this.createCoin(100, height - 80);
    this.createCoin(150, height - 80);

    // Create player
    this.player = this.createPlayer(50, height - 100);

    // Create golden piggy bank at the end (final goal)
    this.createGoal(730, height - 80);

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      down: Phaser.Input.Keyboard.KeyCodes.S,
    }) as any;
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin as any, undefined, this);
    this.physics.add.overlap(this.player, this.portals, this.nearGoal as any, undefined, this);

    // Show intro text
    this.showIntroText();
  }

  update() {
    if (!this.player || !this.player.body) return;

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // Movement
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      playerBody.setVelocityX(-200);
      this.player.setScale(-1, 1);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      playerBody.setVelocityX(200);
      this.player.setScale(1, 1);
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

  createTrap(x: number, y: number) {
    // Visual trap indicator (darker rectangle on ground)
    const trap = this.add.rectangle(x, y, 40, 10, 0x2F4F2F);
    trap.setStrokeStyle(1, 0x000000);
  }

  createCoin(x: number, y: number) {
    const coin = this.add.circle(x, y, 12, 0xFFD700);
    this.physics.add.existing(coin, true);
    this.coins.add(coin);
    
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

  createGoal(x: number, y: number) {
    // Create a golden piggy bank (final trophy)
    const container = this.add.container(x, y);
    
    const body = this.add.circle(0, 0, 28, 0xFFD700);
    body.setStrokeStyle(3, 0xFFA500);
    const snout = this.add.ellipse(12, 5, 18, 14, 0xFFE55C);
    const eye1 = this.add.circle(-10, -10, 5, 0x000000);
    const eye2 = this.add.circle(10, -10, 5, 0x000000);
    
    container.add([body, snout, eye1, eye2]);
    
    // Add sparkle effect
    const sparkle = this.add.star(0, -35, 5, 8, 15, 0xFFFFFF);
    container.add(sparkle);
    
    this.tweens.add({
      targets: sparkle,
      angle: 360,
      duration: 3000,
      repeat: -1,
    });
    
    // Add physics
    const portal = this.add.rectangle(x, y, 60, 60, 0x000000, 0);
    this.physics.add.existing(portal, true);
    this.portals.add(portal);
    (portal as any).reached = false;
    
    // Floating animation
    this.tweens.add({
      targets: container,
      y: y - 8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  nearGoal(player: any, portal: any) {
    if (!portal.reached) {
      portal.reached = true;
      this.showQuestions();
    }
  }

  showIntroText() {
    const { width, height } = this.cameras.main;
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);
    overlay.setDepth(1000);
    
    const text = this.add.text(width / 2, height / 2,
      'NÍVEL 3: PLANEJANDO O FUTURO\n\n' +
      'Bem-vindo ao parque!\n\n' +
      'Última missão: colete moedas e alcance\n' +
      'o cofrinho dourado!\n\n' +
      'Cuidado com os buracos!\n\n' +
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

  showQuestions() {
    this.showQuestion(0);
  }

  showQuestion(index: number) {
    const { width, height } = this.cameras.main;
    const question = questionsData.level3[index];
    
    const modal = this.add.container(width / 2, height / 2);
    modal.setDepth(2000);
    
    const bg = this.add.rectangle(0, 0, 650, 450, 0xFFFFFF);
    bg.setStrokeStyle(6, 0xFFD700);
    
    const questionText = this.add.text(0, -160, question.question, {
      fontSize: '18px',
      color: '#000000',
      fontFamily: 'Arial Bold',
      align: 'center',
      wordWrap: { width: 600 },
    });
    questionText.setOrigin(0.5);
    
    modal.add([bg, questionText]);
    
    question.options.forEach((option, optIndex) => {
      const y = -60 + optIndex * 90;
      const [bg, text] = this.createOptionButton(0, y, option, () => {
        this.handleAnswer(option, modal, index);
      });
      modal.add([bg, text]);
    });
  }

  createOptionButton(x: number, y: number, option: any, callback: () => void): [Phaser.GameObjects.Rectangle, Phaser.GameObjects.Text] {
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
    
    return [bg, text];
  }

  handleAnswer(option: any, modal: Phaser.GameObjects.Container, questionIndex: number) {
    if (option.correct) {
      const gameState = this.registry.get('gameState');
      gameState.sabedoria += 10;
      this.registry.set('gameState', gameState);
      localStorage.setItem('sabedoria', gameState.sabedoria.toString());
      this.game.events.emit('updateHUD');
      
      this.showFeedback(option.feedback, true, () => {
        modal.destroy();
        this.questionsAnswered++;
        
        if (this.questionsAnswered >= 3) {
          this.completeLevel();
        } else {
          this.showQuestion(questionIndex + 1);
        }
      });
    } else {
      this.showFeedback(option.feedback, false, () => {});
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
    gameState.sabedoria += 50;
    this.registry.set('gameState', gameState);
    localStorage.setItem('sabedoria', gameState.sabedoria.toString());
    this.game.events.emit('updateHUD');
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.9);
    overlay.setOrigin(0);
    overlay.setDepth(4000);
    
    const text = this.add.text(width / 2, height / 2,
      '🎉🎉 PARABÉNS! 🎉🎉\n\n' +
      'VOCÊ COMPLETOU TODOS OS NÍVEIS!\n\n' +
      'Você ganhou +50 💡 de bônus final!\n\n' +
      '🏆 MESTRE DA EDUCAÇÃO FINANCEIRA! 🏆\n\n' +
      'Total de Sabedoria: ' + gameState.sabedoria + ' 💡\n' +
      'Moedas coletadas: ' + gameState.coins + ' 🪙\n\n' +
      'Clique para voltar ao menu', {
      fontSize: '20px',
      color: '#FFD700',
      fontFamily: 'Arial Black',
      align: 'center',
      lineSpacing: 14,
      stroke: '#000000',
      strokeThickness: 5,
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
