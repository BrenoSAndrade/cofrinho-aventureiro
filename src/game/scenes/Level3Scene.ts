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

    // Sky background with gradient (park/nature atmosphere)
    const skyTop = this.add.rectangle(0, 0, width, height / 2, 0x87CEEB).setOrigin(0);
    skyTop.setDepth(-10);
    const skyMiddle = this.add.rectangle(0, height / 3, width, height / 3, 0x9CD9F0).setOrigin(0);
    skyMiddle.setDepth(-10);
    const skyBottom = this.add.rectangle(0, 2 * height / 3, width, height / 3, 0xB0E0E6).setOrigin(0);
    skyBottom.setDepth(-10);
    
    // Large sun with rays
    const sun = this.add.circle(650, 70, 40, 0xFFFF00);
    sun.setDepth(-9);
    const sunGlow = this.add.circle(650, 70, 60, 0xFFD700, 0.3);
    sunGlow.setDepth(-9);
    
    // Sun rays
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) * Math.PI / 180;
      const rayLength = 30;
      const x1 = 650 + Math.cos(angle) * 45;
      const y1 = 70 + Math.sin(angle) * 45;
      const x2 = 650 + Math.cos(angle) * (45 + rayLength);
      const y2 = 70 + Math.sin(angle) * (45 + rayLength);
      const ray = this.add.line(0, 0, x1, y1, x2, y2, 0xFFFF00, 0.5);
      ray.setLineWidth(2);
      ray.setDepth(-9);
    }
    
    // Many clouds
    this.createCloud(100, 60);
    this.createCloud(240, 75);
    this.createCloud(380, 55);
    this.createCloud(520, 70);
    this.createCloud(660, 80);
    this.createCloud(760, 60);
    
    // Flying birds
    this.createBird(200, 100);
    this.createBird(450, 120);
    this.createBird(600, 90);
    
    // Add trees in background (forest-like) - positioned on the ground
    this.createTree(60, height - 80, 0x228B22);
    this.createTree(150, height - 80, 0x32CD32);
    this.createTree(250, height - 80, 0x2E8B57);
    this.createTree(370, height - 80, 0x228B22);
    this.createTree(500, height - 80, 0x32CD32);
    this.createTree(620, height - 80, 0x2E8B57);
    this.createTree(730, height - 80, 0x228B22);
    
    // Add flowers - positioned on the ground
    this.createFlower(110, height - 48, 0xFF69B4);
    this.createFlower(220, height - 48, 0xFF1493);
    this.createFlower(330, height - 48, 0xFFB6C1);
    this.createFlower(480, height - 48, 0xFF69B4);
    this.createFlower(590, height - 48, 0xFF1493);
    this.createFlower(700, height - 48, 0xFFB6C1);
    
    // Add motivational sign - positioned on the ground
    this.createMotivationalSign(400, height - 85, 'Sonhos se realizam\ncom planejamento!');
    
    // Ground (grass with patches)
    this.add.rectangle(0, height - 40, width, 40, 0x228B22).setOrigin(0);
    
    // Grass detail
    for (let i = 0; i < 15; i++) {
      const grassX = i * 55 + 30;
      this.add.rectangle(grassX, height - 38, 15, 3, 0x32CD32, 0.7);
      this.add.rectangle(grassX + 10, height - 36, 12, 3, 0x2E8B57, 0.6);
    }

    // Physics groups
    this.platforms = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.portals = this.physics.add.staticGroup();

    // Create ground platform with 2 wide gaps
    const groundLeft = this.add.rectangle(130, height - 20, 260, 40, 0x228B22);
    groundLeft.setOrigin(0.5);
    this.physics.add.existing(groundLeft, true);
    this.platforms.add(groundLeft);
    
    // Wide gap 1 (3 blocks)
    
    const groundMid = this.add.rectangle(400, height - 20, 260, 40, 0x228B22);
    groundMid.setOrigin(0.5);
    this.physics.add.existing(groundMid, true);
    this.platforms.add(groundMid);
    
    // Wide gap 2 (3 blocks)
    
    const groundRight = this.add.rectangle(670, height - 20, 260, 40, 0x228B22);
    groundRight.setOrigin(0.5);
    this.physics.add.existing(groundRight, true);
    this.platforms.add(groundRight);

    // Longer, spaced platforms (teaching rhythm and patience)
    this.createPlatform(200, height - 120, 160, 20);
    this.createPlatform(440, height - 200, 180, 20);
    this.createPlatform(680, height - 130, 150, 20);

    // Multiple obstacles (wooden beams, rocks, and fences)
    this.createWoodenBeam(290, height - 70);
    this.createObstacle(360, height - 60, 40, 40); // Large rock
    this.createWoodenBeam(550, height - 70);
    this.createObstacle(620, height - 60, 35, 35); // Rock

    // 15 coins - some hidden in higher/corner spots
    // Ground level
    this.createCoin(80, height - 80);
    this.createCoin(120, height - 80);
    this.createCoin(580, height - 80);
    
    // First platform
    this.createCoin(160, height - 160);
    this.createCoin(200, height - 160);
    this.createCoin(240, height - 160);
    
    // High platform (hidden)
    this.createCoin(400, height - 245);
    this.createCoin(440, height - 245);
    this.createCoin(480, height - 245);
    this.createCoin(520, height - 245);
    
    // Third platform
    this.createCoin(650, height - 175);
    this.createCoin(690, height - 175);
    this.createCoin(730, height - 175);
    
    // Corner spots (require good jumps)
    this.createCoin(360, height - 140);
    this.createCoin(620, height - 90);

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
    const cloud1 = this.add.ellipse(x, y, 45, 28, 0xFFFFFF, 0.9);
    cloud1.setDepth(-3);
    const cloud2 = this.add.ellipse(x - 18, y + 5, 32, 22, 0xFFFFFF, 0.9);
    cloud2.setDepth(-3);
    const cloud3 = this.add.ellipse(x + 18, y + 5, 32, 22, 0xFFFFFF, 0.9);
    cloud3.setDepth(-3);
  }
  
  createBird(x: number, y: number) {
    // Simple bird shape (V)
    const bird = this.add.text(x, y, 'v', {
      fontSize: '14px',
      color: '#000000',
      fontFamily: 'Arial',
    });
    bird.setDepth(-2);
    bird.setRotation(-0.2);
    
    // Flying animation
    this.tweens.add({
      targets: bird,
      x: x + 150,
      y: y + Phaser.Math.Between(-20, 20),
      duration: 8000,
      repeat: -1,
      yoyo: true,
    });
  }

  createPlatform(x: number, y: number, width: number, height: number) {
    const platform = this.add.rectangle(x, y, width, height, 0x8B4513);
    platform.setOrigin(0.5);
    platform.setStrokeStyle(2, 0x654321);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
  }

  createTree(x: number, y: number, color: number) {
    // Tree trunk
    const trunk = this.add.rectangle(x, y + 20, 15, 40, 0x8B4513);
    trunk.setDepth(-1);
    
    // Tree foliage (3 circles)
    const foliage1 = this.add.circle(x, y - 10, 25, color);
    foliage1.setDepth(-1);
    const foliage2 = this.add.circle(x - 15, y + 5, 20, color);
    foliage2.setDepth(-1);
    const foliage3 = this.add.circle(x + 15, y + 5, 20, color);
    foliage3.setDepth(-1);
  }

  createFlower(x: number, y: number, color: number) {
    // Simple flower with 5 petals
    for (let i = 0; i < 5; i++) {
      const angle = (i * 72) * Math.PI / 180;
      const petalX = x + Math.cos(angle) * 8;
      const petalY = y + Math.sin(angle) * 8;
      const petal = this.add.circle(petalX, petalY, 5, color);
      petal.setDepth(-1);
    }
    // Center
    const center = this.add.circle(x, y, 4, 0xFFFF00);
    center.setDepth(-1);
    
    // Stem
    const stem = this.add.rectangle(x, y + 10, 2, 15, 0x228B22);
    stem.setDepth(-1);
  }

  createMotivationalSign(x: number, y: number, text: string) {
    const sign = this.add.rectangle(x, y, 140, 60, 0xFFFFFF);
    sign.setStrokeStyle(3, 0xFFD700);
    sign.setDepth(-1);
    
    const signText = this.add.text(x, y, text, {
      fontSize: '12px',
      color: '#000000',
      fontFamily: 'Arial Black',
      align: 'center',
      lineSpacing: 4,
    });
    signText.setOrigin(0.5);
    signText.setDepth(-1);
    
    // Decorative stars around sign
    const star1 = this.add.star(x - 60, y - 25, 4, 6, 10, 0xFFD700);
    star1.setDepth(-1);
    const star2 = this.add.star(x + 60, y - 25, 4, 6, 10, 0xFFD700);
    star2.setDepth(-1);
  }

  createObstacle(x: number, y: number, width: number, height: number) {
    const obstacle = this.add.rectangle(x, y, width, height, 0x808080);
    obstacle.setOrigin(0.5);
    obstacle.setStrokeStyle(2, 0x696969);
    this.physics.add.existing(obstacle, true);
    this.platforms.add(obstacle);
  }

  createWoodenBeam(x: number, y: number) {
    // Horizontal wooden beam obstacle
    const beam = this.add.rectangle(x, y, 50, 15, 0x8B4513);
    beam.setOrigin(0.5);
    beam.setStrokeStyle(2, 0x654321);
    this.physics.add.existing(beam, true);
    this.platforms.add(beam);
    
    // Support posts
    const post1 = this.add.rectangle(x - 20, y + 15, 8, 20, 0x654321);
    post1.setOrigin(0.5);
    this.physics.add.existing(post1, true);
    this.platforms.add(post1);
    const post2 = this.add.rectangle(x + 20, y + 15, 8, 20, 0x654321);
    post2.setOrigin(0.5);
    this.physics.add.existing(post2, true);
    this.platforms.add(post2);
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
    // Create a large golden piggy bank with wings (dream symbol)
    const container = this.add.container(x, y);
    
    // Rainbow glow
    const glow1 = this.add.circle(0, 0, 60, 0xFFD700, 0.2);
    const glow2 = this.add.circle(0, 0, 45, 0xFFA500, 0.3);
    
    // Wings
    const wingLeft = this.add.ellipse(-25, 0, 20, 35, 0xFFFFFF, 0.8);
    wingLeft.setStrokeStyle(2, 0xFFD700);
    const wingRight = this.add.ellipse(25, 0, 20, 35, 0xFFFFFF, 0.8);
    wingRight.setStrokeStyle(2, 0xFFD700);
    
    // Body
    const body = this.add.circle(0, 0, 32, 0xFFD700);
    body.setStrokeStyle(4, 0xFFA500);
    
    const snout = this.add.ellipse(14, 6, 22, 16, 0xFFE55C);
    const eye1 = this.add.circle(-12, -12, 6, 0x000000);
    const eye2 = this.add.circle(12, -12, 6, 0x000000);
    
    // Coin slot
    const slot = this.add.rectangle(0, -22, 18, 4, 0x000000);
    
    // Multiple sparkles
    const sparkle1 = this.add.star(0, -45, 5, 10, 18, 0xFFFFFF);
    const sparkle2 = this.add.star(-35, -20, 4, 6, 12, 0xFFFF00);
    const sparkle3 = this.add.star(35, -20, 4, 6, 12, 0xFFFF00);
    
    container.add([glow1, glow2, wingLeft, wingRight, body, snout, eye1, eye2, slot, sparkle1, sparkle2, sparkle3]);
    
    // Sparkle rotation
    this.tweens.add({
      targets: [sparkle1, sparkle2, sparkle3],
      angle: 360,
      duration: 3000,
      repeat: -1,
    });
    
    // Wings flapping
    this.tweens.add({
      targets: wingLeft,
      y: -5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    this.tweens.add({
      targets: wingRight,
      y: -5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 400,
    });
    
    // Pulsing glow
    this.tweens.add({
      targets: [glow1, glow2],
      alpha: 0.5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Add physics
    const portal = this.add.rectangle(x, y, 80, 80, 0x000000, 0);
    this.physics.add.existing(portal, true);
    this.portals.add(portal);
    (portal as any).reached = false;
    
    // Floating animation
    this.tweens.add({
      targets: container,
      y: y - 12,
      duration: 2500,
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
    gameState.sabedoria += 50;
    this.registry.set('gameState', gameState);
    localStorage.setItem('sabedoria', gameState.sabedoria.toString());
    this.game.events.emit('updateHUD');
    
    // Create colorful background
    const overlay = this.add.rectangle(0, 0, width, height, 0x4169E1, 0.95);
    overlay.setOrigin(0);
    overlay.setDepth(4000);
    
    // Animated confetti
    for (let i = 0; i < 30; i++) {
      const confetti = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(-100, height),
        Phaser.Math.Between(3, 8),
        Phaser.Math.Between(0xFF0000, 0xFFFFFF)
      );
      confetti.setDepth(4002);
      
      this.tweens.add({
        targets: confetti,
        y: height + 100,
        x: confetti.x + Phaser.Math.Between(-50, 50),
        duration: Phaser.Math.Between(3000, 5000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
    
    const text = this.add.text(width / 2, height / 2 - 60,
      '🎉 PARABÉNS! 🎉\n\n' +
      'JORNADA FINANCEIRA COMPLETA!\n\n' +
      '+50 💡 bônus | 🏆 Educador Mirim 🏆\n\n' +
      'Sabedoria: ' + gameState.sabedoria + ' 💡 | Moedas: ' + gameState.coins + ' 🪙', {
      fontSize: '16px',
      color: '#FFD700',
      fontFamily: 'Arial Black',
      align: 'center',
      lineSpacing: 8,
      stroke: '#000000',
      strokeThickness: 4,
    });
    text.setOrigin(0.5);
    text.setDepth(4001);
    
    // Create buttons (positioned to be visible on screen)
    const buttonY = height / 2 + 80;
    
    // Play Again button
    const playAgainBtn = this.add.rectangle(width / 2 - 90, buttonY, 160, 50, 0x32CD32);
    playAgainBtn.setStrokeStyle(4, 0x228B22);
    playAgainBtn.setDepth(4001);
    playAgainBtn.setInteractive({ useHandCursor: true });
    
    const playAgainText = this.add.text(width / 2 - 90, buttonY, 'Jogar Novamente', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial Black',
    });
    playAgainText.setOrigin(0.5);
    playAgainText.setDepth(4002);
    
    // Menu button
    const menuBtn = this.add.rectangle(width / 2 + 90, buttonY, 160, 50, 0xFF8C42);
    menuBtn.setStrokeStyle(4, 0xE67339);
    menuBtn.setDepth(4001);
    menuBtn.setInteractive({ useHandCursor: true });
    
    const menuText = this.add.text(width / 2 + 90, buttonY, 'Voltar ao Menu', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial Black',
    });
    menuText.setOrigin(0.5);
    menuText.setDepth(4002);
    
    // Button interactions
    playAgainBtn.on('pointerover', () => {
      playAgainBtn.setScale(1.05);
      playAgainText.setScale(1.05);
    });
    
    playAgainBtn.on('pointerout', () => {
      playAgainBtn.setScale(1);
      playAgainText.setScale(1);
    });
    
    playAgainBtn.on('pointerdown', () => {
      // Reset game state
      const newGameState = {
        sabedoria: 0,
        coins: 0,
      };
      this.registry.set('gameState', newGameState);
      localStorage.setItem('sabedoria', '0');
      localStorage.setItem('coins', '0');
      this.game.events.emit('updateHUD');
      
      this.scene.start('PreTutorialScene');
    });
    
    menuBtn.on('pointerover', () => {
      menuBtn.setScale(1.05);
      menuText.setScale(1.05);
    });
    
    menuBtn.on('pointerout', () => {
      menuBtn.setScale(1);
      menuText.setScale(1);
    });
    
    menuBtn.on('pointerdown', () => {
      this.scene.stop('HUDScene');
      this.scene.start('MenuScene');
    });
  }
}
