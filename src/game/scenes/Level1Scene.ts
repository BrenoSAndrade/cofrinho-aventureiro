import Phaser from 'phaser';
import questionsData from '@/data/questions.json';

export class Level1Scene extends Phaser.Scene {
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
    super({ key: 'Level1Scene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Sky background with gradient effect (light blue to lighter at horizon)
    const skyTop = this.add.rectangle(0, 0, width, height / 2, 0x87CEEB).setOrigin(0);
    skyTop.setDepth(-10);
    const skyBottom = this.add.rectangle(0, height / 2, width, height / 2, 0xB0E0E6).setOrigin(0);
    skyBottom.setDepth(-10);
    
    // Sun with rays
    const sun = this.add.circle(700, 60, 35, 0xFFFF00);
    sun.setDepth(-8);
    const sunGlow = this.add.circle(700, 60, 50, 0xFFD700, 0.3);
    sunGlow.setDepth(-8);
    
    // Sun rays
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45) * Math.PI / 180;
      const rayLength = 25;
      const x1 = 700 + Math.cos(angle) * 40;
      const y1 = 60 + Math.sin(angle) * 40;
      const x2 = 700 + Math.cos(angle) * (40 + rayLength);
      const y2 = 60 + Math.sin(angle) * (40 + rayLength);
      const ray = this.add.line(0, 0, x1, y1, x2, y2, 0xFFFF00, 0.6);
      ray.setLineWidth(3);
      ray.setDepth(-8);
    }
    
    // More clouds at different heights
    this.createCloud(100, 60);
    this.createCloud(280, 80);
    this.createCloud(450, 55);
    this.createCloud(620, 75);
    this.createCloud(750, 65);
    
    // Add houses in background (neighborhood) - positioned on the ground
    this.createHouse(80, height - 70, 0xFFB6C1);
    this.createHouse(200, height - 70, 0xFFA07A);
    this.createHouse(320, height - 70, 0xDDA0DD);
    this.createHouse(480, height - 70, 0x98D8C8);
    this.createHouse(600, height - 70, 0xF7DC6F);
    this.createHouse(720, height - 70, 0xF8B88B);
    
    // Ground (dirt path)
    this.add.rectangle(0, height - 40, width, 40, 0x8B7355).setOrigin(0);
    
    // Grass patches on ground
    for (let i = 0; i < 10; i++) {
      const grassX = i * 85 + 40;
      this.add.rectangle(grassX, height - 38, 20, 4, 0x228B22, 0.6);
    }

    // Physics groups
    this.platforms = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.portals = this.physics.add.staticGroup();

    // Create ground platform with holes
    const groundLeft = this.add.rectangle(150, height - 20, 300, 40, 0x8B7355);
    groundLeft.setOrigin(0.5);
    this.physics.add.existing(groundLeft, true);
    this.platforms.add(groundLeft);
    
    // Hole 1 (gap between platforms)
    const groundMid = this.add.rectangle(390, height - 20, 220, 40, 0x8B7355);
    groundMid.setOrigin(0.5);
    this.physics.add.existing(groundMid, true);
    this.platforms.add(groundMid);
    
    // Hole 2
    const groundRight = this.add.rectangle(650, height - 20, 300, 40, 0x8B7355);
    groundRight.setOrigin(0.5);
    this.physics.add.existing(groundRight, true);
    this.platforms.add(groundRight);

    // Low platforms for teaching jumps
    this.createPlatform(120, height - 100, 80, 20);
    this.createPlatform(280, height - 140, 100, 20);
    this.createPlatform(470, height - 110, 90, 20);
    
    // Multiple obstacles (wooden boxes and small walls)
    this.createObstacle(200, height - 60, 35, 35); // Box 1
    this.createObstacle(360, height - 60, 30, 30); // Box 2
    this.createObstacle(520, height - 75, 40, 50); // Tall wall
    this.createObstacle(620, height - 60, 35, 35); // Box 3

    // 10 coins in groups
    // Group 1 (ground level)
    this.createCoin(80, height - 80);
    this.createCoin(120, height - 80);
    
    // Group 2 (on first platform)
    this.createCoin(150, height - 140);
    this.createCoin(180, height - 140);
    this.createCoin(210, height - 140);
    
    // Group 3 (on second platform)
    this.createCoin(300, height - 150);
    this.createCoin(330, height - 150);
    
    // Group 4 (after obstacle)
    this.createCoin(500, height - 80);
    this.createCoin(550, height - 80);
    this.createCoin(600, height - 80);

    // Create player on the ground
    this.player = this.createPlayer(50, height - 60);

    // Create piggy bank at the end (goal)
    this.createGoal(720, height - 80);

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
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      playerBody.setVelocityX(200);
    } else {
      playerBody.setVelocityX(0);
    }

    // Jump
    if ((this.cursors.up.isDown || this.wasd.up.isDown || this.spaceKey.isDown) && playerBody.touching.down) {
      playerBody.setVelocityY(-400);
    }
  }

  createPlayer(x: number, y: number): Phaser.GameObjects.Rectangle {
    // Create a container for the player with a clear face
    const container = this.add.container(x, y);
    
    // Body (rectangle)
    const body = this.add.rectangle(0, 0, 32, 32, 0xFF8C42);
    body.setStrokeStyle(2, 0xE67339);
    
    // Eyes (two circles at the top)
    const leftEye = this.add.circle(-8, -6, 3, 0x000000);
    const rightEye = this.add.circle(8, -6, 3, 0x000000);
    
    // Smile (arc pointing upward for smile)
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x000000);
    graphics.beginPath();
    graphics.arc(0, 0, 8, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(150), false);
    graphics.strokePath();
    
    container.add([body, leftEye, rightEye, graphics]);
    
    // Add physics to container
    this.physics.add.existing(container);
    const physicsBody = container.body as Phaser.Physics.Arcade.Body;
    physicsBody.setCollideWorldBounds(true);
    physicsBody.setSize(32, 32);
    
    return container as any; // Return container for physics compatibility
  }
  
  createCloud(x: number, y: number) {
    const cloud1 = this.add.ellipse(x, y, 40, 25, 0xFFFFFF, 0.8);
    cloud1.setDepth(-2);
    const cloud2 = this.add.ellipse(x - 15, y + 5, 30, 20, 0xFFFFFF, 0.8);
    cloud2.setDepth(-2);
    const cloud3 = this.add.ellipse(x + 15, y + 5, 30, 20, 0xFFFFFF, 0.8);
    cloud3.setDepth(-2);
  }

  createPlatform(x: number, y: number, width: number, height: number) {
    const platform = this.add.rectangle(x, y, width, height, 0x8B4513);
    platform.setOrigin(0.5);
    platform.setStrokeStyle(2, 0x654321);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
  }

  createObstacle(x: number, y: number, width: number, height: number) {
    const obstacle = this.add.rectangle(x, y, width, height, 0x654321);
    obstacle.setOrigin(0.5);
    obstacle.setStrokeStyle(2, 0x000000);
    this.physics.add.existing(obstacle, true);
    this.platforms.add(obstacle);
    
    // Add wood texture marks
    const line1 = this.add.line(x, y - height/4, -width/3, 0, width/3, 0, 0x8B4513, 1);
    line1.setOrigin(0);
    const line2 = this.add.line(x, y + height/4, -width/3, 0, width/3, 0, 0x8B4513, 1);
    line2.setOrigin(0);
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

  createHouse(x: number, y: number, color: number) {
    // Simple house background decoration - house body at ground level
    const house = this.add.rectangle(x, y, 50, 60, color);
    house.setStrokeStyle(2, 0x000000);
    house.setDepth(-1);
    
    // Proper triangle roof pointing upward (centered on house)
    const roof = this.add.triangle(x, y - 30, 25, 0, 0, -30, -25, 0, 0xDC143C);
    roof.setStrokeStyle(2, 0x000000);
    roof.setDepth(-1);
    
    // Window
    const window = this.add.rectangle(x, y - 5, 15, 15, 0xFFFFFF);
    window.setStrokeStyle(1, 0x000000);
    window.setDepth(-1);
    
    // Door
    const door = this.add.rectangle(x, y + 18, 12, 24, 0x8B4513);
    door.setStrokeStyle(1, 0x000000);
    door.setDepth(-1);
  }

  createGoal(x: number, y: number) {
    // Create a large golden piggy bank
    const container = this.add.container(x, y);
    
    // Golden glow background
    const glow = this.add.circle(0, 0, 50, 0xFFD700, 0.3);
    
    const body = this.add.circle(0, 0, 30, 0xFFD700);
    body.setStrokeStyle(3, 0xFFA500);
    
    const snout = this.add.ellipse(12, 6, 20, 15, 0xFFE55C);
    const eye1 = this.add.circle(-10, -10, 5, 0x000000);
    const eye2 = this.add.circle(10, -10, 5, 0x000000);
    
    // Coin slot on top
    const slot = this.add.rectangle(0, -20, 15, 3, 0x000000);
    
    container.add([glow, body, snout, eye1, eye2, slot]);
    
    // Add physics
    const portal = this.add.rectangle(x, y, 70, 70, 0x000000, 0);
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
    
    // Pulsing glow
    this.tweens.add({
      targets: glow,
      alpha: 0.6,
      duration: 1500,
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
      'NÍVEL 1: O VALOR DE GUARDAR DINHEIRO\n\n' +
      'Bem-vindo ao bairro!\n\n' +
      'Colete moedas e chegue até o cofrinho.\n' +
      'Cuidado com os obstáculos!\n\n' +
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
    const question = questionsData.level1[index];
    
    const modal = this.add.container(width / 2, height / 2);
    modal.setDepth(2000);
    
    const bg = this.add.rectangle(0, 0, 650, 450, 0xFFFFFF);
    bg.setStrokeStyle(6, 0xFF69B4);
    
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
      // Penalidade por resposta errada: perde 5 de sabedoria
      const gameState = this.registry.get('gameState');
      gameState.sabedoria = Math.max(0, gameState.sabedoria - 5);
      this.registry.set('gameState', gameState);
      localStorage.setItem('sabedoria', gameState.sabedoria.toString());
      this.game.events.emit('updateHUD');
      
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
    
    const bg = this.add.rectangle(0, 0, 550, 280, isCorrect ? 0x95E77D : 0xFF6B6B);
    bg.setStrokeStyle(4, 0x000000);
    
    const icon = this.add.text(0, -100, isCorrect ? '✓' : '✗', {
      fontSize: '48px',
      color: '#000000',
      fontFamily: 'Arial Black',
    });
    icon.setOrigin(0.5);
    
    // Show penalty message for wrong answers
    const penalty = !isCorrect ? this.add.text(0, -50, '-5 💡 Sabedoria', {
      fontSize: '20px',
      color: '#8B0000',
      fontFamily: 'Arial Black',
      stroke: '#FFFFFF',
      strokeThickness: 2,
    }) : null;
    if (penalty) penalty.setOrigin(0.5);
    
    const feedbackText = this.add.text(0, 0, text, {
      fontSize: '16px',
      color: '#000000',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 500 },
    });
    feedbackText.setOrigin(0.5);
    
    const closeBtn = this.add.text(0, 100, isCorrect ? 'Continuar' : 'Tentar Novamente', {
      fontSize: '18px',
      color: '#000000',
      fontFamily: 'Arial Black',
      backgroundColor: '#FFFFFF',
      padding: { x: 20, y: 10 },
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive();
    
    const elements = penalty ? [bg, icon, penalty, feedbackText, closeBtn] : [bg, icon, feedbackText, closeBtn];
    feedbackBox.add(elements);
    
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      feedbackBox.destroy();
      onClose();
    });
  }

  completeLevel() {
    const { width, height } = this.cameras.main;
    
    const gameState = this.registry.get('gameState');
    gameState.sabedoria += 30;
    this.registry.set('gameState', gameState);
    localStorage.setItem('sabedoria', gameState.sabedoria.toString());
    this.game.events.emit('updateHUD');
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    overlay.setOrigin(0);
    overlay.setDepth(4000);
    
    const text = this.add.text(width / 2, height / 2,
      '🎉 NÍVEL 1 COMPLETO! 🎉\n\n' +
      'Você ganhou +30 💡 de bônus!\n\n' +
      'Parabéns! Você aprendeu que\nguardar dinheiro ajuda a realizar\nseus sonhos!\n\n' +
      'Total de Sabedoria: ' + gameState.sabedoria + ' 💡\n\n' +
      'Prepare-se para o próximo desafio!', {
      fontSize: '20px',
      color: '#FFD700',
      fontFamily: 'Arial Black',
      align: 'center',
      lineSpacing: 12,
      stroke: '#000000',
      strokeThickness: 4,
    });
    text.setOrigin(0.5);
    text.setDepth(4001);
    
    // Auto-advance after 3 seconds
    this.time.delayedCall(3000, () => {
      this.scene.start('Level2Scene');
    });
  }
}
