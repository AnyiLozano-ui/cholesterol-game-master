export interface GameSceneDeps {
    onShowQuestion: (state: { score: number; timeLeft: number }) => void;
    onWin: (state: { score: number }) => void;
    getInitialState: () => { score: number; timeLeft: number };
}

export class GameScene extends Phaser.Scene {

    constructor() { super({ key: "GameScene" }) }
    // private car!: Phaser.Physics.Arcade.Sprite;
    // private bullets!: Phaser.Physics.Arcade.Group;
    // private cholesterolMountains!: Phaser.Physics.Arcade.Group;
    // private pills!: Phaser.Physics.Arcade.Group;
    // private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    // private spacebar!: Phaser.Input.Keyboard.Key;
  
    // private score: number = 0;
    // private timeLeft: number = 90;
    // private gameTimer!: Phaser.Time.TimerEvent;
    // private scoreText!: Phaser.GameObjects.Text;
    // private timeText!: Phaser.GameObjects.Text;
  
    // // private gameService!: GameService;
    // private veinBounds = { top: 120, bottom: 480 };
    // private cholesterolSpeed = 120;
    // private bulletSpeed = 400;
    // private lastShotTime = 0;
    // private shotCooldown = 200;
  
    // private gameWidth!: number;
    // private gameHeight: number = 600;
  
    // private veinWallTop!: Phaser.GameObjects.Graphics;
    // private veinWallBottom!: Phaser.GameObjects.Graphics;
    // private veinInterior!: Phaser.GameObjects.Graphics;
    // private rbcEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
    // private rbcManager!: Phaser.GameObjects.Particles.ParticleProcessor;
  
    // constructor(private router: Router) {
    //   super({ key: 'GameScene' });
    // }
  
    // setRouter(router: Router) {
    //   this.router = router;
    // }
  
    // setGameService(gameService: GameService) {
    //   this.gameService = gameService;
    //   const currentState = gameService.getCurrentGameState();
    //   this.score = currentState.score;
    //   this.timeLeft = currentState.timeLeft;
    // }
  
    preload() {
      console.log('this.scale.gameSize', this.scale.gameSize)
  
    //   this.gameWidth = this.sys.game.config.width as number;
  
    //   // Cargar las imágenes personalizadas
    //   this.load.image('car', 'assets/images/car.png');
    //   this.load.image('bullet', 'assets/images/bullet.png');
    //   this.load.image('pill', 'assets/images/pill.png');
    //   this.load.image('tiempo', 'assets/images/tiempo.png');
    //   for (let i = 0; i < 10; i++) {
    //     this.load.image(`red_blood_${i + 1}`, `assets/images/globulo-${i + 1}.png`)
    //   }
  
    //   // Crear sprites del colesterol 
    //   this.createCholesterolSprites();
    }
  
    // create() {
      // // Resize Events
      // this.onResize(this.scale.gameSize);
      // this.scale.on('resize', (size: Phaser.Structs.Size) => this.onResize(size))
      // // Create Environment
      // this.createVeinEnvironment();
  
      // // Car Images
      // this.car = this.physics.add.sprite(100, 300, 'car');
      // this.car.setCollideWorldBounds(false);
      // this.car.setScale(0.6);
      // this.car.setDepth(10);
  
      // this.bullets = this.physics.add.group();
      // this.cholesterolMountains = this.physics.add.group();
      // this.pills = this.physics.add.group();
  
      // this.cursors = this.input.keyboard!.createCursorKeys();
      // this.spacebar = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
      // this.createUI();
  
      // this.gameTimer = this.time.addEvent({
      //   delay: 1000,
      //   // callback: this.updateTimer,
      //   callbackScope: this,
      //   loop: true
      // });
  
      // this.time.addEvent({
      //   delay: 2500,
      //   callback: this.spawnCholesterolMountain,
      //   callbackScope: this,
      //   loop: true
      // });
  
      // this.time.addEvent({
      //   delay: 4000,
      //   callback: this.spawnPill,
      //   callbackScope: this,
      //   loop: true
      // });
  
      // this.setupCollisions();
    // }
  
    // private onResize(size: Phaser.Structs.Size) {
    //   this.gameWidth = size.width;
    //   this.gameHeight = size.height;
  
    //   this.veinBounds = {
    //     top: Math.round(this.gameHeight * 0.20),
    //     bottom: Math.round(this.gameHeight * 0.80)
    //   }
  
    //   if (this.scoreText) this.scoreText.setPosition(12, 12);
    //   if (this.timeText) this.timeText.setPosition(this.gameWidth - 12, 12).setOrigin(1, 0)
    // }
  
    // private createCholesterolSprites() {
    //   // Colesterol Mountain Superior 
    //   this.createCholesterolMountain('cholesterol-top', 'down');
  
    //   // Colesterol Mountain Inferior 
    //   this.createCholesterolMountain('cholesterol-bottom', 'up');
    // }
  
    private createCholesterolMountain(textureName: string, direction: 'up' | 'down') {
      const graphics = this.add.graphics();
      const width = 420;
      const height = 100;
  
      graphics.beginPath();
  
      if (direction === 'down') {
        graphics.moveTo(0, 0);
        graphics.lineTo(width, 0);
        graphics.lineTo(width * 0.9, height * 0.3);
        graphics.lineTo(width * 0.8, height * 0.6);
        graphics.lineTo(width * 0.6, height * 0.9);
        graphics.lineTo(width * 0.5, height);
        graphics.lineTo(width * 0.4, height * 0.9);
        graphics.lineTo(width * 0.2, height * 0.6);
        graphics.lineTo(width * 0.1, height * 0.3);
        graphics.closePath();
      } else {
        graphics.moveTo(0, height);
        graphics.lineTo(width * 0.1, height * 0.7);
        graphics.lineTo(width * 0.2, height * 0.4);
        graphics.lineTo(width * 0.4, height * 0.1);
        graphics.lineTo(width * 0.5, 0);
        graphics.lineTo(width * 0.6, height * 0.1);
        graphics.lineTo(width * 0.8, height * 0.4);
        graphics.lineTo(width * 0.9, height * 0.7);
        graphics.lineTo(width, height);
        graphics.closePath();
      }
  
      graphics.fillStyle(0xdca91d);
      graphics.fillPath();
  
      graphics.beginPath();
      if (direction === 'down') {
        graphics.moveTo(width * 0.1, height * 0.3);
        graphics.lineTo(width * 0.4, height * 0.9);
        graphics.lineTo(width * 0.5, height);
        graphics.lineTo(width * 0.2, height * 0.6);
        graphics.closePath();
      } else {
        graphics.moveTo(width * 0.6, height * 0.1);
        graphics.lineTo(width * 0.8, height * 0.4);
        graphics.lineTo(width, height);
        graphics.lineTo(width * 0.5, 0);
        graphics.closePath();
      }
      graphics.fillStyle(0x996600, 0.7);
      graphics.fillPath();
  
      graphics.beginPath();
      if (direction === 'down') {
        graphics.moveTo(width * 0.2, height * 0.2);
        graphics.lineTo(width * 0.4, height * 0.5);
        graphics.lineTo(width * 0.5, height * 0.7);
        graphics.lineTo(width * 0.3, height * 0.4);
        graphics.closePath();
      } else {
        graphics.moveTo(width * 0.3, height * 0.6);
        graphics.lineTo(width * 0.5, 0);
        graphics.lineTo(width * 0.7, height * 0.6);
        graphics.lineTo(width * 0.4, height * 0.3);
        graphics.closePath();
      }
      graphics.fillStyle(0xFFE135, 0.9);
      graphics.fillPath();
  
      graphics.fillStyle(0xFFFF88, 0.6);
      for (let i = 0; i < 12; i++) {
        const x = width * 0.2 + Math.random() * width * 0.6;
        const y = height * 0.2 + Math.random() * height * 0.6;
        const size = Math.random() * 3 + 1;
        graphics.fillCircle(x, y, size);
      }
  
      graphics.generateTexture(textureName, width, height);
      graphics.destroy();
    }
  
    // private createVeinEnvironment() {
    //   if (this.veinWallTop) this.veinWallTop.destroy();
    //   if (this.veinWallBottom) this.veinWallBottom.destroy();
    //   if (this.veinInterior) this.veinInterior.destroy();
  
    //   this.add.rectangle(this.gameWidth / 2, this.gameHeight / 2, this.gameWidth, this.gameHeight, 0x0f1419);
  
    //   this.veinWallTop = this.add.graphics();
    //   this.veinWallBottom = this.add.graphics();
    //   this.veinInterior = this.add.graphics();
  
    //   this.veinWallTop.fillGradientStyle(0x8B0000, 0x8B0000, 0xCD5C5C, 0xCD5C5C);
    //   this.veinWallTop.fillRect(0, 0, this.gameWidth, this.veinBounds.top);
  
    //   this.veinWallBottom.fillGradientStyle(0xCD5C5C, 0xCD5C5C, 0x8B0000, 0x8B0000);
    //   this.veinWallBottom.fillRect(0, this.veinBounds.bottom, this.gameWidth, this.gameHeight - this.veinBounds.bottom);
  
    //   this.veinInterior.fillGradientStyle(0x660000, 0x990000, 0x990000, 0x660000);
    //   this.veinInterior.fillRect(0, this.veinBounds.top, this.gameWidth, this.veinBounds.bottom - this.veinBounds.top);
  
    //   this.createBloodFlowEffect();
    // }
  
    // private createBloodFlowEffect() {
    //   const keys = ['red_blood_1', 'red_blood_2', 'red_blood_3', 'red_blood_4', 'red_blood_5', 'red_blood_6', 'red_blood_7', 'red_blood_8', 'red_blood_9', 'red_blood_10'];
  
    //   for (let i = 0; i < Math.floor(this.gameWidth / 60); i++) {
    //     const textureKey = Phaser.Utils.Array.GetRandom(keys);
  
    //     const bloodCell = this.add.image(
    //       Math.random() * this.gameWidth,
    //       this.veinBounds.top + Math.random() * (this.veinBounds.bottom - this.veinBounds.top),
    //       textureKey
    //     );
  
    //     bloodCell.setScale(0.15 + Math.random() * 0.1);
    //     bloodCell.setAlpha(0.6 + Math.random() * 0.3);
    //     bloodCell.setDepth(2);
  
    //     this.tweens.add({
    //       targets: bloodCell,
    //       x: -50,
    //       duration: Math.random() * 6000 + 4000,
    //       repeat: -1,
    //       onRepeat: () => {
    //         bloodCell.x = this.gameWidth + Math.random() * 200;
    //         bloodCell.y = this.veinBounds.top + Math.random() * (this.veinBounds.bottom - this.veinBounds.top);
    //       }
    //     });
  
    //     this.tweens.add({
    //       targets: bloodCell,
    //       angle: 360,
    //       duration: 8000 + Math.random() * 8000,
    //       repeat: -1
    //     });
    //   }
    // }
  
    // private createUI() {
    //   const base = Math.max(14, Math.round(this.gameWidth * 0.035));
  
    //   this.scoreText = this.add.text(12, 12, `Puntos: ${this.score}`, {
    //     fontSize: `${base}px`,
    //     color: '#00ff88',
    //     fontFamily: 'Arial Black',
    //     stroke: '#000', strokeThickness: 2
    //   }).setDepth(100);
  
    //   this.timeText = this.add.text(this.gameWidth - 12, 12, '01:30', {
    //     fontSize: `${Math.max(12, Math.round(base * 0.9))}px`,
    //     color: '#00ddff',
    //     fontFamily: 'Arial Black',
    //     stroke: '#000', strokeThickness: 2
    //   }).setOrigin(1, 0).setDepth(100);
    // }
  
    // override update() {
    //   if (this.cursors.up.isDown && this.car.y > this.veinBounds.top + 40) {
    //     this.car.setVelocityY(-250);
    //   } else if (this.cursors.down.isDown && this.car.y < this.veinBounds.bottom - 40) {
    //     this.car.setVelocityY(250);
    //   } else {
    //     this.car.setVelocityY(0);
    //   }
  
    //   if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
    //     this.shootBullet();
    //   }
  
    //   this.cleanupObjects();
    // }
  
    // private shootBullet() {
    //   const currentTime = this.time.now;
    //   if (currentTime - this.lastShotTime > this.shotCooldown) {
    //     // Crear bala con imagen
    //     const bullet = this.bullets.create(this.car.x + 40, this.car.y, 'bullet');
    //     bullet.setVelocityX(this.bulletSpeed);
    //     bullet.setDepth(5);
    //     bullet.setScale(0.8);
    //     this.lastShotTime = currentTime;
  
    //     this.tweens.add({
    //       targets: bullet,
    //       scaleX: bullet.scaleX * 1.5,
    //       scaleY: bullet.scaleY * 1.5,
    //       duration: 150,
    //       yoyo: true,
    //       ease: 'Power2'
    //     });
    //   }
    // }
  
    // private spawnCholesterolMountain() {
    //   const spawnFromTop = Math.random() < 0.5;
    //   let mountain: Phaser.Physics.Arcade.Sprite;
  
    //   if (spawnFromTop) {
    //     mountain = this.cholesterolMountains.create(this.gameWidth + 50, this.veinBounds.top, 'cholesterol-top');
    //     mountain.setOrigin(0, 0);
    //   } else {
    //     mountain = this.cholesterolMountains.create(this.gameWidth + 50, this.veinBounds.bottom, 'cholesterol-bottom');
    //     mountain.setOrigin(0, 1);
    //   }
  
    //   mountain.setVelocityX(-this.cholesterolSpeed);
    //   mountain.setDepth(3);
    //   mountain.setScale(0.8 + Math.random() * 0.4);
  
    //   (mountain as any).mountainType = spawnFromTop ? 'top' : 'bottom';
  
    //   this.tweens.add({
    //     targets: mountain,
    //     scaleX: mountain.scaleX * 1.05,
    //     scaleY: mountain.scaleY * 1.05,
    //     duration: 2000 + Math.random() * 1000,
    //     yoyo: true,
    //     repeat: -1,
    //     ease: 'Sine.easeInOut'
    //   });
  
    //   this.createVeinDisturbance(mountain.x, mountain.y);
    // }
  
    // private createVeinDisturbance(x: number, y: number) {
    //   const ripple = this.add.circle(x, y, 5, 0xFFD700, 0.3);
    //   ripple.setDepth(2);
  
    //   this.tweens.add({
    //     targets: ripple,
    //     scaleX: 4,
    //     scaleY: 2,
    //     alpha: 0,
    //     x: x - 100,
    //     duration: 1000,
    //     ease: 'Power2.easeOut',
    //     onComplete: () => ripple.destroy()
    //   });
    // }
  
    // private spawnPill() {
    //   const minY = this.veinBounds.top + 80;
    //   const maxY = this.veinBounds.bottom - 100;
    //   const yPos = minY + Math.random() * (maxY - minY);
  
    //   // Crear pastilla con imagen
    //   const pill = this.pills.create(this.gameWidth, yPos, 'pill');
    //   pill.setVelocityX(-this.cholesterolSpeed * 0.8);
    //   pill.setDepth(5);
    //   pill.setScale(0.7);
  
    //   this.tweens.add({
    //     targets: pill,
    //     y: yPos + 20,
    //     duration: 1000,
    //     yoyo: true,
    //     repeat: -1,
    //     ease: 'Sine.easeInOut'
    //   });
    // }
  
    // private setupCollisions() {
    //   this.physics.add.overlap(this.bullets, this.cholesterolMountains, (bullet, mountain) => {
    //     const mountainSprite = mountain as Phaser.GameObjects.Sprite;
    //     this.createDestructionEffect(mountainSprite.x + 75, mountainSprite.y + 60);
    //     bullet.destroy();
    //     mountain.destroy();
    //     this.updateScore(10);
    //   });
  
    //   this.physics.add.overlap(this.car, this.pills, (car, pill) => {
    //     const pillSprite = pill as Phaser.GameObjects.Sprite;
    //     this.createPillCollectEffect(pillSprite.x, pillSprite.y);
    //     pill.destroy();
    //     this.updateScore(5);
    //   });
  
    //   this.physics.add.overlap(this.car, this.cholesterolMountains, (car, mountain) => {
    //     this.createCarHitEffect(this.car.x, this.car.y);
    //     mountain.destroy();
    //     this.showQuestionScreen();
    //   });
    // }
  
    // private createCarHitEffect(x: number, y: number) {
    //   for (let i = 0; i < 8; i++) {
    //     const spark = this.add.circle(
    //       x + Math.random() * 40 - 20,
    //       y + Math.random() * 30 - 15,
    //       Math.random() * 3 + 2,
    //       0xFF4444
    //     );
  
    //     this.tweens.add({
    //       targets: spark,
    //       x: x + (Math.random() - 0.5) * 100,
    //       y: y + (Math.random() - 0.5) * 80,
    //       alpha: 0,
    //       scale: 0,
    //       duration: 500,
    //       ease: 'Power2.easeOut',
    //       onComplete: () => spark.destroy()
    //     });
    //   }
    // }
  
    // private createDestructionEffect(x: number, y: number) {
    //   for (let i = 0; i < 15; i++) {
    //     const particle = this.add.circle(
    //       x + Math.random() * 80 - 40,
    //       y + Math.random() * 60 - 30,
    //       Math.random() * 6 + 3,
    //       0xFFD700
    //     );
  
    //     this.tweens.add({
    //       targets: particle,
    //       x: x + (Math.random() - 0.5) * 150,
    //       y: y + (Math.random() - 0.5) * 120,
    //       alpha: 0,
    //       scale: 0,
    //       duration: 800,
    //       ease: 'Power2.easeOut',
    //       onComplete: () => particle.destroy()
    //     });
    //   }
  
    //   for (let i = 0; i < 12; i++) {
    //     const yellowParticle = this.add.circle(
    //       x + Math.random() * 60 - 30,
    //       y + Math.random() * 40 - 20,
    //       Math.random() * 3 + 1,
    //       0xFFF700
    //     );
  
    //     this.tweens.add({
    //       targets: yellowParticle,
    //       x: x + (Math.random() - 0.5) * 120,
    //       y: y + (Math.random() - 0.5) * 90,
    //       alpha: 0,
    //       scale: 0,
    //       duration: 900,
    //       ease: 'Power3.easeOut',
    //       onComplete: () => yellowParticle.destroy()
    //     });
    //   }
  
    //   const shockwave = this.add.circle(x, y, 15, 0xFFD700, 0.5);
    //   shockwave.setDepth(4);
  
    //   this.tweens.add({
    //     targets: shockwave,
    //     scaleX: 6,
    //     scaleY: 4,
    //     alpha: 0,
    //     duration: 600,
    //     ease: 'Power2.easeOut',
    //     onComplete: () => shockwave.destroy()
    //   });
    // }
  
    // private createPillCollectEffect(x: number, y: number) {
    //   const collectText = this.add.text(x, y, '+5', {
    //     fontSize: '24px',
    //     color: '#00ff88',
    //     fontFamily: 'Arial Black'
    //   });
  
    //   this.tweens.add({
    //     targets: collectText,
    //     y: y - 50,
    //     alpha: 0,
    //     scale: 1.5,
    //     duration: 800,
    //     ease: 'Power2.easeOut',
    //     onComplete: () => collectText.destroy()
    //   });
    // }
  
    // private updateScore(points: number) {
    //   this.score += points;
    //   if (this.score > 100) this.score = 100;
    //   this.scoreText.setText(`Puntos: ${this.score}`);
  
    // //   if (this.gameService) {
    // //     this.gameService.addScore(points);
    // //   }
  
    //   this.tweens.add({
    //     targets: this.scoreText,
    //     scaleX: 1.3,
    //     scaleY: 1.3,
    //     duration: 200,
    //     yoyo: true,
    //     ease: 'Bounce.easeOut'
    //   });
    // }
  
    // // private updateTimer() {
    // //   this.timeLeft--;
    // //   const minutes = Math.floor(this.timeLeft / 60);
    // //   const seconds = this.timeLeft % 60;
    // //   this.timeText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  
    // //   if (this.gameService) {
    // //     this.gameService.updateTimeLeft(this.timeLeft);
    // //   }
  
    // //   if (this.timeLeft <= 30) {
    // //     this.timeText.setColor('#ff4444');
    // //     if (this.timeLeft <= 10) {
    // //       this.tweens.add({
    // //         targets: this.timeText,
    // //         alpha: 0.3,
    // //         duration: 500,
    // //         yoyo: true
    // //       });
    // //     }
    // //   }
  
    // //   if (this.timeLeft <= 0) {
    // //     this.gameWon();
    // //   }
    // // }
  
    // private cleanupObjects() {
    //   this.bullets.children.entries.forEach((bullet: any) => {
    //     if (bullet.x > this.gameWidth + 50) bullet.destroy();
    //   });
  
    //   this.cholesterolMountains.children.entries.forEach((obj: any) => {
    //     if (obj.x < -200) obj.destroy();
    //   });
  
    //   this.pills.children.entries.forEach((obj: any) => {
    //     if (obj.x < -50) obj.destroy();
    //   });
    // }
  
    // private showQuestionScreen() {
    //   this.scene.pause();
    //   if (this.router) {
    //     this.router.navigate(['/question'], {
    //       queryParams: {
    //         score: this.score,
    //         timeLeft: this.timeLeft
    //       }
    //     });
    //   }
    // }
  
    // private gameWon() {
    //   this.scene.pause();
    //   if (this.router) {
    //     this.router.navigate(['/congratulations'], {
    //       queryParams: {
    //         score: this.score
    //       }
    //     });
    //   }
    // }
  
    // public resumeGame() {
    //   this.scene.resume();
    // }
  }