/*
Name: main.js
Game name: college invaders.
Authors: Backbone CISC 3140 spring 2023
Description: This game is similar to the original space invaders game.
*/

import MainMenu from "./MainMenuScene.js";
import PauseScene from "./PauseScene.js";
import ConfirmationScene from "./ConfirmationScene.js";
import GameoverScene from "./GameoverScene.js";

// game entities
var playerSprite;
var playerBullets;
var playerBulletSpeed = -400;
var playerSize = 0.65;
var adminSprites;
var adminBullets;
var adminBulletSpeed = 200;
var adminSize = 0.5;
var lastFired = 0;
var adminLastFired = 0;
var score = 0;
var lives = 3;
var gameStart = false;
var gamePaused = false;
var adminDirection = "";
var trusteeSprite;
var trusteeBullets;
var trusteeSize = 0.65;
var trusteeDirection = "";
var trusteeSpeed = 200;
var trusteeBulletSpeed = 300;
var playerHitAdminCollision;
var beatRound = false;
var enemiesAlive = 55;
var livesIncremented;

// components
var keyListener;

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" }); //create keyword

  }

  preload() {
    this.load.image("background", "assets/images/grassBackground.png");
    this.load.image("player", "assets/images/humanoid.png");
    this.load.image("playerLeft", "assets/images/humanoidleft.png");
    this.load.image("playerRight", "assets/images/humanoidright.png");
    this.load.spritesheet('playerExplosion', 'assets/images/player_explosion_spritesheet.png',
      { frameWidth: 64, frameheight: 64 });
    this.load.audio("playerDeath", "assets/audio/admin_player_destruction.wav");
    this.load.image("bullet", "assets/images/Bullet.png");
    this.bulletSize = 0.1; //sets player bullet size.
    this.load.image("playerThrow", "assets/images/humanoidthrow.png");
    this.load.image("admin", "assets/images/admin.png");
    this.load.image("adminLeft", "assets/images/admin_left.png");
    this.load.image("adminRight", "assets/images/admin_right.png");
    this.load.image("adminThrow", "assets/images/admin_throw.png");
    this.load.image("adminBullet", "assets/images/admin_bullet.png");
    this.load.spritesheet('adminExplosion', 'assets/images/admin_explosion_spritesheet.png',
      { frameWidth: 64, frameHeight: 64 });
    this.load.image("pause", "assets/images/pause_button.png");
    this.load.image("play", "assets/images/play_button.png");
    this.load.image("trustee", "assets/images/trustee.png");
    this.load.image("trusteeLeft", "assets/images/trustee_left.png");
    this.load.image("trusteeRight", "assets/images/trustee_right.png");
    this.load.image("trusteeThrow", "assets/images/trustee_right.png");
    this.load.image("trusteeBullet", "assets/images/trustee_bullet.png");
    this.load.audio('userShot', "assets/audio/lasershot.wav");
    this.load.audio("music", "assets/audio/gameplay_soundtrak.mp3");
    this.load.audio("enemyShot", "assets/audio/Enemy_Bullet_Sound.wav");
  }

  //create all components for the game screen here.
  create() {
    var time = this.time;

    // play audio object
    this.music = this.sound.add("music", { loop: true });
    this.music.play();

    livesIncremented = false;

    if (beatRound === false) {
      score = 0; 
      lives = 3;
      enemiesAlive = 55;
    } else {
      enemiesAlive = 55;
    }
    // create a sprite for the background image
    var backgroundImage = this.add.image(0, 0, "background");
    backgroundImage.setOrigin(0, 0);
    backgroundImage.setScale(2);

    // creating player here
    playerSprite = new Player(this, 335, 760, playerSize);
    this.add.existing(playerSprite);
    this.anims.create({
      key: "playerExplode",
      frames: this.anims.generateFrameNumbers("playerExplosion", {
        start: 7,
        end: 8,
      }),
      frameRate: 30,
      repeat: 0,
    });
    playerBullets = playerSprite.bullets.getChildren();

    //create trustee Sprite
    trusteeSprite = new Trustee(this, 0, 57, trusteeSize);
    trusteeSprite.setVelocityX(trusteeSpeed);
    this.add.existing(trusteeSprite);
    trusteeBullets = this.physics.add.group();

    // create enemySprites group
    createAdminSprites.call(this);
    adminBullets = this.physics.add.group();

    this.anims.create({
      key: "adminExplode",
      frames: this.anims.generateFrameNumbers("adminExplosion", {
        start: 0,
        end: 12,
      }),
      frameRate: 30,
      repeat: 0,
    });

    //Create game texts
    this.scoreText = this.add.text(400, 16, "Score:" + score, {
      fontSize: "18px",
      fill: "#FFF",
    });
    this.livesText = this.add.text(550, 16, "Lives:" + lives, {
      fontSize: "18px",
      fill: "#FFF",
    });

    //load pausebutton image
    const pauseButton = this.add.image(16, 16, "pause");
    pauseButton.setScale(0.5);
    pauseButton.setInteractive();
    pauseButton.on("pointerdown", () => {
      this.pauseGame();
    });

    // timer to control the firing of admin enemy
    const adminTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const randomAdminIndex = Phaser.Math.Between(
          0,
          adminSprites.getChildren().length - 1
        );
        const randomAdmin = adminSprites.getChildren()[randomAdminIndex];

        // fire admin bullets when there are admins active
        if (adminSprites.getChildren().length !== 0) {
          randomAdmin.adminFire();
        }
      },
    });

    /**
     * collision detection between player bullets and admin enemies
     * issue of collision detected during start of game (active player bullets)
     *  */
    playerHitAdminCollision = this.physics.add.overlap(
      playerBullets,
      adminSprites,
      playerHitAdmin
    );

    /**
     * collision detection between enemy sprite and invisible border
     * game over on collision
     */
    var descendLimit = this.add.rectangle(325, 600, 650, 1, 0xf91139);
    this.add.existing(descendLimit);
    this.physics.world.enable(descendLimit);
    descendLimit.body.immovable = true;
    descendLimit.visible = false;

    this.physics.add.overlap(adminSprites, descendLimit, () => {
      this.gameOver();
    });

    /**
     * collision detection between player bullets and trustee
     * issue of collision detected with active player bullets
     */
    // this.physics.add.overlap(playerBullets, trusteeSprite, playerHitTrustee);
  }

  update(time) {
    playerSprite.update(time);
    trusteeSprite.update(time);

    //Trustee descend:
    if (
      (trusteeSprite.body.blocked.left && !trusteeSprite.body.blocked.right) ||
      (!trusteeSprite.body.blocked.left && trusteeSprite.body.blocked.right)
    ) {
      trusteeSprite.trusteeDescend();
    }
    // update each enemy
    adminSprites.children.iterate(function (enemy, index) {
      enemy.update();
      // descending enemies in unison after shifting directions
      if (
        (enemy.body.blocked.left && !enemy.body.blocked.right) ||
        (!enemy.body.blocked.left && enemy.body.blocked.right)
      ) {
        adminSprites.children.iterate(function (enemy) {
          enemy.descend();
        });
      }
    });

    /**
     *  collision detection between admin bullets and player
     *  very unefficient: collision detection is created for each admin's individual group of bullets
     *  current optimization: only checking collision for admin that have active bullets
     */
    const activeAdmins = adminSprites.getChildren().filter((admin) => {
      return admin.enemyBullets.getChildren().length > 0;
    });

    if (activeAdmins.length > 0) {
      this.physics.overlap(
        activeAdmins.flatMap((admin) => admin.enemyBullets.getChildren()),
        playerSprite,
        adminHitPlayer
      );
    }

    /**
     * collision detection between trustee bullets and player
     */
    const trusteeBullets = trusteeSprite.enemyBullets.getChildren();

    if (trusteeBullets.length > 0) {
      this.physics.add.overlap(trusteeBullets, playerSprite, trusteeHitPlayer);
    }

    // increment lives every 1500 score earned
    if (!livesIncremented && score % 1500 == 0 && score != 0) {
      lives++;
      livesIncremented = true;
    }

    if (!(score % 1500 == 0)) livesIncremented = false;

    // update ui
    this.livesText.setText("Lives: " + lives);
    this.scoreText.setText("Score: " + score);

    //check for end game conditions
    if (lives === 0) {
      beatRound = false;
      const explosion = this.add.sprite(
        playerSprite.x,
        playerSprite.y,
        "playerExplosion"
      );
      explosion.anims.play("playerExplode");
      this.sound.play("playerDeath");
      this.gameOver();
    }
    //check if all enemies have been killed
    if (enemiesAlive === 0) {
      beatRound = true;
      this.scene.restart("GameScene"); //start new round
    } else {
      beatRound = false;
    }
  }

  //pauseGame function stops current scene and runs the pause screen
  pauseGame() {
    this.scene.pause("GameScene");
    this.music.stop();
    this.scene.run("PauseScene");
  }
  //gameOver function stops game and starts gameover screen 
  gameOver() {
    //this.scene.stop("GameScene");
    this.music.stop();
    this.scene.start("GameoverScene", { score: score }); //passes score as parameter to the gameoverscene create function 
  }
}

//Bullet class
class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, bulletKey) {
    super(scene, x, y, bulletKey);
  }

  fire(x, y, yVelocity, bulletPosition) {
    this.body.reset(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setScale(this.scene.bulletSize);
    this.setPosition(x, bulletPosition);
    this.setVelocityY(yVelocity);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // free up resources from bullets that go off the game canvas
    if (this.y <= 0 || this.y >= 650) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}

// Bullets class
class Bullets extends Phaser.Physics.Arcade.Group {
  constructor(scene, bulletKey) {
    super(scene.physics.world, scene);

    this.createMultiple({
      classType: Bullet,
      frameQuantity: 60,
      active: false,
      visible: false,
      key: bulletKey,
    });

    this.setDepth(1);
  }

  fireBullet(x, y, velocity, bulletPosition) {
    let bullet = this.getFirstDead(false);

    if (bullet) {
      bullet.fire(x, y, velocity, bulletPosition);
    }
  }
}

//Player class
class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, size) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.world.enable(this);
    this.keyListener = scene.input.keyboard.createCursorKeys();
    this.keyListener.a = scene.input.keyboard.addKey('A'); //add key A to move left
    this.keyListener.d = scene.input.keyboard.addKey('D'); //add key D to move right
    this.setScale(size);
    this.setCollideWorldBounds(true);
    this.lastFired = 0;
    this.bullets = new Bullets(scene, "bullet");
  }

  update(time) {
    this.handleInput();
    this.handleFiring(time);
  }

  handleInput() {
    if (this.keyListener.left.isDown || this.keyListener.a.isDown) {
      this.setTexture("playerLeft");
      this.setVelocityX(-250);
    } else if (this.keyListener.right.isDown || this.keyListener.d.isDown) {
      this.setTexture("playerRight");
      this.setVelocityX(250);
    } else {
      this.setTexture("player");
      this.setVelocityX(0);
    }
  }

  handleFiring(time) {
    if (this.keyListener.space.isDown) {
      this.setTexture("playerThrow");
    }
    if (this.keyListener.space.isDown && time > this.lastFired) {
      this.bullets.fireBullet(this.x, this.y, playerBulletSpeed, this.y - 35); //negative 400 so bullets go upward. this.y-40, if y-positve = bullets fire above the head.

      this.scene.sound.play("userShot");
      this.lastFired = time + 200;
    }
  }
}

// Trustee class
class Trustee extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, size) {
    super(scene, x, y, "trustee");
    scene.add.existing(this);
    scene.physics.world.enable(this);
    this.direction = 1;
    this.setDepth(1.25);
    this.setScale(size);
    // set enemy position and movement
    this.setPosition(350, 60);
    this.setCollideWorldBounds(true);
    this.setBounce(1);

    this.enemyLastFired = 0;
    this.enemyBullets = new Bullets(scene, "trusteeBullet");
  }

  moveLeft() {
    this.setVelocityX(-trusteeSpeed);
    this.setTexture("trusteeLeft");
  }

  moveRight() {
    this.setVelocityX(trusteeSpeed);
    this.setTexture("trusteeRight");
  }

  stop() {
    this.setVelocityX(0);
    this.setTexture("trustee");
  }

  // controls how much the admin descends.
  trusteeDescend() {
    this.y += 10;
  }

  trusteeMovement() {
    if (trusteeDirection === "right" && !this.body.blocked.right) {
      this.moveRight();
    } else if (trusteeDirection === "left" && !this.body.blocked.left) {
      this.moveLeft();
    }

    if (this.body.blocked.left) {
      this.moveRight();
      trusteeDirection = "right";
    } else if (this.body.blocked.right) {
      this.moveLeft();
      trusteeDirection = "left";
    }
  }

  fireBullet() {
    this.setTexture("trusteeThrow");
    this.enemyBullets.fireBullet(
      this.x,
      this.y + 10,
      trusteeBulletSpeed,
      this.y + 40
    );
    this.scene.sound.play("enemyShot", {
      volume: 0.5,
      rate: 1
    });
    this.enemyBullets.children.iterate((child) => {
      child.setScale(0.80);
    });
  }

  trusteeFire() {
    if (this.scene.time.now > this.enemyLastFired + 3000) {
      this.fireBullet();
      this.enemyLastFired = game.getTime();
    }
  }


  update() {
    this.trusteeMovement();
    this.trusteeFire();
  }
}

// Admin class.
class Admin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "admin");
    this.direction = 1;
    this.setDepth(1);
    this.setScale(adminSize);
    this.enemyLastFired = 0;
    this.enemyBullets = new Bullets(scene, "adminBullet");
  }
  moveRight() {
    this.setVelocityX(75);
    this.setTexture("adminRight");
  }

  moveLeft() {
    this.setVelocityX(-75);
    this.setTexture("adminLeft");
  }

  fireBullet() {
    this.setTexture("adminThrow");
    this.enemyBullets.fireBullet(
      this.x,
      this.y + 10,
      adminBulletSpeed,
      this.y + 40
    ); // 150 = enemy firing speed. this.y-40, if y-positive = bullets fire below the head.
    // Play sound when enemy fires
    this.scene.sound.play("enemyShot", {
      volume: 0.5,
      rate: 2
    });
    this.enemyBullets.children.iterate((child) => {
      // Iterates over all the enemyBullets.
      child.setScale(0.5); // set the scale to 0.5. Sets the size for enemy bullets.
    });
  }

  // Controls how much the admin descends.
  descend() {
    this.y += 5;
  }

  // Controls enemy movement.
  adminMovement() {
    if (adminDirection === "right" && !this.body.blocked.right) {
      this.moveRight();
    } else if (adminDirection === "left" && !this.body.blocked.left) {
      this.moveLeft();
    }

    if (this.body.blocked.left) {
      this.moveRight();
      adminDirection = "right";
    } else if (this.body.blocked.right) {
      this.moveLeft();
      adminDirection = "left";
    }
  }

  // Controls when the enemy fires. (2000 = every 2 seconds)
  adminFire() {
    if (this.scene.time.now > this.enemyLastFired + 2000) {
      this.fireBullet();
      this.enemyLastFired = game.getTime();
    }
  }

  update() {
    this.adminMovement();
  }
}

// Function spawns and positions Admin enemies
function createAdminSprites() {
  // Create enemySprites group
  adminSprites = this.physics.add.group({
    classType: Admin,
    key: "admin",
    repeat: 54,
  });
  // position enemies in rows
  let enemyX = 100;
  let enemyY = 100;

  for (let i = 0; i < adminSprites.getChildren().length; i++) {
    const enemy = adminSprites.getChildren()[i];
    enemy.setScale(0.5);

    // set enemy position and movement
    enemy.setPosition(enemyX, enemyY);
    enemy.setVelocityX(100);
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);

    // update position for next enemy
    enemyX += 50;
    if ((i + 1) % 11 === 0) {
      enemyX = 100;
      enemyY += 50;
    }
  }
}

// callback function for collision between player bullets and admin enemies
//********* Main problem with animation here. *******
function playerHitAdmin(playerBullet, admin) {
  playerBullet.destroy();
  admin.anims.play("adminExplode");
  admin.destroy();
  enemiesAlive--;
  score += 100; //increment 100 to score when bullet hits enemy
  console.log("Admin count: " + adminSprites.getLength());
  console.log("Player bullet count: " + playerSprite.bullets.getLength());
}

// callback function for collision between admin bullets and player
function adminHitPlayer(adminBullet, player) {
  adminBullet.destroy();
  lives--;
  if (lives === 0) {
    player.destroy();
  }
}

function playerHitTrustee(playerBullet, trustee) {
  playerBullet.destroy();
  trustee.destroy();
  console.log("player hit trustee: true");
}

function trusteeHitPlayer(trusteeBullet, player) {
  trusteeBullet.destroy();
  lives--;
  console.log("trustee hit player: true");
}

// game configurations
const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 650,
    height: 650,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  input: {
    mouse: true,
  },
  scene: [MainMenu, GameScene, PauseScene, ConfirmationScene, GameoverScene],
};

// game variable
const game = new Phaser.Game(config);
export default game;


