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
    
    // Add trees in background (with depth)
    this.createTree(80, height - 200, 0x228B22);
    this.createTree(250, height - 220, 0x32CD32);
    this.createTree(450, height - 210, 0x228B22);
    this.createTree(680, height - 205, 0x2E8B57);
    
    // Add flowers (with depth)
    this.createFlower(130, height - 70, 0xFF69B4);
    this.createFlower(380, height - 75, 0xFF1493);
    this.createFlower(600, height - 70, 0xFFB6C1);
    
    // Add motivational sign (with depth)
    this.createMotivationalSign(400, height - 180, 'Sonhos se realizam\ncom planejamento!');
    
    // Ground (grass)
    this.add.rectangle(0, height - 40, width, 40, 0x228B22).setOrigin(0);

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

    // Wooden beam obstacle to jump over
    this.createWoodenBeam(340, height - 70);

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
    
    const text = this.add.text(width / 2, height / 2 - 80,
      '🎉🎉 PARABÉNS! 🎉🎉\n\n' +
      'VOCÊ COMPLETOU SUA\nJORNADA FINANCEIRA!\n\n' +
      'Você ganhou +50 💡 de bônus final!\n\n' +
      '🏆 EDUCADOR FINANCEIRO MIRIM 🏆\n\n' +
      'Excelente! Agora você sabe planejar\ne guardar dinheiro para realizar\nseus sonhos!\n\n' +
      'Total de Sabedoria: ' + gameState.sabedoria + ' 💡\n' +
      'Moedas coletadas: ' + gameState.coins + ' 🪙', {
      fontSize: '18px',
      color: '#FFD700',
      fontFamily: 'Arial Black',
      align: 'center',
      lineSpacing: 10,
      stroke: '#000000',
      strokeThickness: 5,
    });
    text.setOrigin(0.5);
    text.setDepth(4001);
    
    // Create buttons
    const buttonY = height / 2 + 160;
    
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
