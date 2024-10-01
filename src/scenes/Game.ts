import axios from "axios";
import { Scene } from "phaser";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  player: Phaser.Physics.Arcade.Sprite;
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  platforms: Phaser.Physics.Arcade.StaticGroup;
  stars: Phaser.Physics.Arcade.Group;
  score: number = 0;
  scoreText: Phaser.GameObjects.Text;

  constructor() {
    super("Game");
  }

  async create() {
    this.setupCamera();
    this.setupBackground();
    this.setupScoreText();
    this.setupPlayer();
    this.setupAnimations();
    this.setupControls();
    this.setupPlatforms();
    this.setupStars();
    this.setupCollisions();
    await this.fetchGameData();
  }

  setupCamera() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x00ff00);
  }

  setupBackground() {
    this.background = this.add.image(512, 384, "background").setAlpha(0.5);
  }

  setupScoreText() {
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
    });
  }

  setupPlayer() {
    this.player = this.physics.add
      .sprite(100, 450, "dude")
      .setBounce(0.2)
      .setCollideWorldBounds(true)
      .setGravityY(300);
  }

  setupAnimations() {
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  setupControls() {
    this.cursors = this.input.keyboard?.createCursorKeys();
  }

  setupPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    // Create platforms
    const platformPositions = [
      { x: 1024 / 3, y: 768, scale: 2 },
      { x: 600, y: 700 },
      { x: 50, y: 650 },
      { x: 750, y: 220 },
    ];

    platformPositions.forEach(({ x, y, scale }) => {
      const platform = this.platforms.create(x, y, "ground");
      if (scale) platform.setScale(scale).refreshBody();
    });

    this.physics.add.collider(this.player, this.platforms);
  }

  setupStars() {
    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate((child: any) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      return true;
    });
  }

  setupCollisions() {
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      undefined,
      this
    );
  }

  collectStar(player: any, star: any) {
    star.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  update() {
    this.handlePlayerMovement();
  }

  handlePlayerMovement() {
    if (this.cursors?.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors?.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors?.up.isDown && this.player.body?.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  async fetchGameData() {
    try {
      const response = await axios.get("https://api.example.com/game-data"); // Replace with your API URL
      // Handle the response and update game state accordingly
      console.log(response.data);
      // For example, you might want to set the initial score based on the response
      this.score = response.data.initialScore || 0;
      this.scoreText.setText(`Score: ${this.score}`);
    } catch (error) {
      console.error("Error fetching game data:", error);
    }
  }
}
