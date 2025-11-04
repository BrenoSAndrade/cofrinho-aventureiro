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

    // Background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);
    
    // Add building silhouettes in background (with depth)
    this.createBuilding(100, height - 205, 60, 110, 0x696969);
    this.createBuilding(280, height - 230, 80, 140, 0x808080);
    this.createBuilding(500, height - 185, 70, 90, 0x696969);
    this.createBuilding(680, height - 220, 75, 120, 0x778899);
    
    // Add motivational signs (with depth)
    this.createSign(200, height - 130, 'Pense Antes\nde Comprar!');
    this.createSign(550, height - 180, 'Economizar\né Legal!');
    
    // Ground (sidewalk)
    this.add.rectangle(0, height - 40, width, 40, 0x95E77D).setOrigin(0);

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
    const obstacle = this.add.rectangle(x, y, width, height, 0x654321);
    obstacle.setOrigin(0.5);
    obstacle.setStrokeStyle(2, 0x000000);
    this.physics.add.existing(obstacle, true);
    this.platforms.add(obstacle);
    
    // Add "X" marking
    const line1 = this.add.line(x, y, -width/3, -height/3, width/3, height/3, 0x000000);
    const line2 = this.add.line(x, y, width/3, -height/3, -width/3, height/3, 0x000000);
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
    // Create a store/shop with "Good Choice" star
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
    
    // Green star (good choice symbol)
    const star = this.add.star(x, y - 70, 5, 15, 25, 0x32CD32);
    star.setStrokeStyle(2, 0x228B22);
    
    this.tweens.add({
      targets: star,
      angle: 360,
      duration: 4000,
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
