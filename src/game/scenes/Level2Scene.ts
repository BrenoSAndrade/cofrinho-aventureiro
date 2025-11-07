import Phaser from 'phaser';
import questionsData from '@/data/questions.json';

export class Level2Scene extends Phaser.Scene {
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
    super({ key: 'Level2Scene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Sky background with gradient (city atmosphere)
    const skyTop = this.add.rectangle(0, 0, width, height / 2, 0x87CEEB).setOrigin(0);
    skyTop.setDepth(-10);
    const skyBottom = this.add.rectangle(0, height / 2, width, height / 2, 0xADD8E6).setOrigin(0);
    skyBottom.setDepth(-10);
    
    // Sun
    const sun = this.add.circle(80, 50, 30, 0xFFFF00);
    sun.setDepth(-9);
    const sunGlow = this.add.circle(80, 50, 45, 0xFFD700, 0.3);
    sunGlow.setDepth(-9);
    
    // Multiple clouds
    this.createCloud(180, 65);
    this.createCloud(350, 50);
    this.createCloud(520, 70);
    this.createCloud(680, 55);
    
    // Add building silhouettes in background (cityscape) - positioned on the ground
    this.createBuilding(80, height - 95, 60, 110, 0x696969);
    this.createBuilding(180, height - 120, 70, 160, 0x778899);
    this.createBuilding(300, height - 110, 80, 140, 0x808080);
    this.createBuilding(420, height - 90, 65, 100, 0x696969);
    this.createBuilding(530, height - 85, 70, 90, 0x696969);
    this.createBuilding(640, height - 100, 75, 120, 0x778899);
    this.createBuilding(740, height - 97, 60, 115, 0x808080);
    
    // Add motivational signs - positioned on the ground
    this.createSign(200, height - 75, 'Pense Antes\nde Comprar!');
    this.createSign(550, height - 75, 'Economizar\né Legal!');
    
    // Traffic lights - positioned on the ground
    this.createTrafficLight(340, height - 55);
    this.createTrafficLight(620, height - 55);
    
    // Ground (sidewalk with lines)
    this.add.rectangle(0, height - 40, width, 40, 0xA9A9A9).setOrigin(0);
    
    // Sidewalk lines
    for (let i = 0; i < 8; i++) {
      const lineX = i * 100 + 50;
      this.add.rectangle(lineX, height - 20, 60, 2, 0xFFFFFF, 0.5);
    }

    // Physics groups
    this.platforms = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.portals = this.physics.add.staticGroup();

    // Create ground platform
    const ground = this.add.rectangle(width / 2, height - 20, width, 40, 0x95E77D);
    ground.setOrigin(0.5);
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);

    // Platforms at different heights (city style - bridge between buildings)
    this.createPlatform(140, height - 100, 120, 20);
    this.createPlatform(320, height - 170, 100, 20);
    this.createPlatform(480, height - 240, 120, 20); // Higher platform
    this.createPlatform(660, height - 160, 110, 20);

    // Multiple obstacles (stacked boxes, concrete blocks, and barriers)
    this.createObstacle(210, height - 60, 35, 35); // Box 1
    this.createObstacle(260, height - 60, 35, 35); // Box 2
    this.createStackedObstacle(380, height - 70, 40); // Stacked boxes
    this.createObstacle(540, height - 60, 38, 38); // Concrete block 1
    this.createObstacle(590, height - 60, 38, 38); // Concrete block 2
    this.createObstacle(720, height - 75, 30, 50); // Tall barrier

    // Coins at different heights
    // Low coins
    this.createCoin(100, height - 80);
    this.createCoin(200, height - 80);
    this.createCoin(340, height - 80);
    
    // Medium height
    this.createCoin(170, height - 140);
    this.createCoin(350, height - 210);
    this.createCoin(690, height - 200);
    
    // High coins (require good jump timing)
    this.createCoin(510, height - 285);
    this.createCoin(540, height - 285);
    this.createCoin(570, height - 285);

    // Create player
    this.player = this.createPlayer(50, height - 100);

    // Create shop/store at the end (goal)
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
    
    // Smile (using graphics for better control)
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x000000);
    graphics.arc(0, 2, 10, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false);
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
    cloud1.setDepth(-3);
    const cloud2 = this.add.ellipse(x - 15, y + 5, 30, 20, 0xFFFFFF, 0.8);
    cloud2.setDepth(-3);
    const cloud3 = this.add.ellipse(x + 15, y + 5, 30, 20, 0xFFFFFF, 0.8);
    cloud3.setDepth(-3);
  }
  
  createTrafficLight(x: number, y: number) {
    const pole = this.add.rectangle(x, y, 4, 30, 0x000000);
    pole.setDepth(-1);
    
    const box = this.add.rectangle(x, y - 30, 15, 35, 0x333333);
    box.setDepth(-1);
    
    const redLight = this.add.circle(x, y - 40, 4, 0xFF0000);
    redLight.setDepth(-1);
    const yellowLight = this.add.circle(x, y - 30, 4, 0x888888);
    yellowLight.setDepth(-1);
    const greenLight = this.add.circle(x, y - 20, 4, 0x32CD32);
    greenLight.setDepth(-1);
  }

  createPlatform(x: number, y: number, width: number, height: number) {
    const platform = this.add.rectangle(x, y, width, height, 0x8B4513);
    platform.setOrigin(0.5);
    platform.setStrokeStyle(2, 0x654321);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
  }

  createBuilding(x: number, y: number, width: number, height: number, color: number) {
    const building = this.add.rectangle(x, y, width, height, color);
    building.setStrokeStyle(2, 0x000000);
    building.setDepth(-1);
    
    // Add windows
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const windowX = x - width/4 + j * width/2;
        const windowY = y - height/3 + i * height/4;
        const win = this.add.rectangle(windowX, windowY, 12, 12, 0xFFFF99);
        win.setStrokeStyle(1, 0x000000);
        win.setDepth(-1);
      }
    }
  }

  createSign(x: number, y: number, text: string) {
    const sign = this.add.rectangle(x, y, 80, 50, 0xFFFFFF);
    sign.setStrokeStyle(2, 0x000000);
    sign.setDepth(-1);
    
    const signText = this.add.text(x, y, text, {
      fontSize: '11px',
      color: '#000000',
      fontFamily: 'Arial Black',
      align: 'center',
    });
    signText.setOrigin(0.5);
    signText.setDepth(-1);
    
    // Post
    const post = this.add.rectangle(x, y + 35, 4, 20, 0x8B4513);
    post.setDepth(-1);
  }

  createObstacle(x: number, y: number, width: number, height: number) {
    const obstacle = this.add.rectangle(x, y, width, height, 0x696969);
    obstacle.setOrigin(0.5);
    obstacle.setStrokeStyle(3, 0x000000);
    this.physics.add.existing(obstacle, true);
    this.platforms.add(obstacle);
    
    // Add concrete texture (dots pattern)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const dotX = x - width/3 + (i * width/3);
        const dotY = y - height/3 + (j * height/3);
        const dot = this.add.circle(dotX, dotY, 2, 0x505050);
      }
    }
  }

  createStackedObstacle(x: number, y: number, size: number) {
    // Bottom box
    const box1 = this.add.rectangle(x, y, size, size, 0x8B4513);
    box1.setOrigin(0.5);
    box1.setStrokeStyle(2, 0x000000);
    this.physics.add.existing(box1, true);
    this.platforms.add(box1);
    
    // Top box
    const box2 = this.add.rectangle(x, y - size, size, size, 0xA0522D);
    box2.setOrigin(0.5);
    box2.setStrokeStyle(2, 0x000000);
    this.physics.add.existing(box2, true);
    this.platforms.add(box2);
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
    // Create a store/shop (smart shopping destination)
    const store = this.add.rectangle(x, y, 50, 60, 0x4169E1);
    store.setStrokeStyle(3, 0x000000);
    
    const roof = this.add.triangle(x, y - 40, 0, 20, 25, -15, -25, 20, 0xDC143C);
    roof.setStrokeStyle(2, 0x000000);
    
    // Door
    const door = this.add.rectangle(x, y + 15, 20, 30, 0x8B4513);
    door.setStrokeStyle(2, 0x000000);
    
    // Window
    const window = this.add.rectangle(x, y - 10, 20, 15, 0xADD8E6);
    window.setStrokeStyle(2, 0x000000);
    
    // Store sign with text
    const signBg = this.add.rectangle(x, y - 65, 45, 18, 0xFFFFFF);
    signBg.setStrokeStyle(2, 0x000000);
    
    const signText = this.add.text(x, y - 65, 'LOJA', {
      fontSize: '10px',
      color: '#000000',
      fontFamily: 'Arial Black',
    });
    signText.setOrigin(0.5);
    
    // Glow effect
    const glow = this.add.circle(x, y, 40, 0x4169E1, 0.2);
    this.tweens.add({
      targets: glow,
      alpha: 0.4,
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });
    
    // Add physics
    const portal = this.add.rectangle(x, y, 60, 80, 0x000000, 0);
    this.physics.add.existing(portal, true);
    this.portals.add(portal);
    (portal as any).reached = false;
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
      'NÍVEL 2: ESCOLHAS INTELIGENTES\n\n' +
      'Bem-vindo à cidade colorida!\n\n' +
      'Colete moedas e chegue até a loja.\n' +
      'Use as plataformas com cuidado!\n\n' +
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
    const question = questionsData.level2[index];
    
    const modal = this.add.container(width / 2, height / 2);
    modal.setDepth(2000);
    
    const bg = this.add.rectangle(0, 0, 650, 450, 0xFFFFFF);
    bg.setStrokeStyle(6, 0x4169E1);
    
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
    gameState.coins += 15; // Reward bonus
    this.registry.set('gameState', gameState);
    localStorage.setItem('sabedoria', gameState.sabedoria.toString());
    localStorage.setItem('coins', gameState.coins.toString());
    this.game.events.emit('updateHUD');
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    overlay.setOrigin(0);
    overlay.setDepth(4000);
    
    const text = this.add.text(width / 2, height / 2,
      '🎉 NÍVEL 2 COMPLETO! 🎉\n\n' +
      'Você ganhou +30 💡 de bônus!\n' +
      '+15 🪙 moedas extras!\n\n' +
      'Muito bem! Você fez escolhas\ninteligentes e pensou antes de gastar!\n\n' +
      'Total de Sabedoria: ' + gameState.sabedoria + ' 💡\n\n' +
      'Prepare-se para o último nível!', {
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
      this.scene.start('Level3Scene');
    });
  }
}
