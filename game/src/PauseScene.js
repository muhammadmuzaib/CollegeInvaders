import game from './main.js';
//Create the pause screen
export default class PauseScene extends Phaser.Scene {
    constructor() {
      super({ key: "PauseScene" }); //create keyword
    }
    preload() {
      this.load.image("play", "assets/images/play_button.png");
    }
  
    create() {
      //change pause button to play button
      const play = this.add.image(16, 16, "play");
      play.setScale(0.5);
  
      //create a graphics object
      let graphics = this.add.graphics();
  
      //draw a transparent rectangle
      graphics.fillStyle(0x000000, 0.5);
      graphics.fillRect(0, 0, this.game.config.width, this.game.config.height);
  
      //Draw message in box
      graphics.fillStyle(0x00ccff, 1);
      graphics.fillRect(
        this.game.config.width / 4,
        this.game.config.height / 4,
        this.game.config.width / 2,
        this.game.config.height / 2
      );
      this.add
        .text(
          this.game.config.width / 2,
          this.game.config.height / 2 - 140,
          "Paused",
          { fontSize: "32px", fill: "#FFF" }
        )
        .setOrigin(0.5);
  
      //Create resume button
      const resumeButton = this.add
        .text(
          this.game.config.width / 2,
          this.game.config.height / 2 - 70,
          "Resume",
          { fontSize: "32px", fill: "#FFF" }
        )
        .setOrigin(0.5);
      resumeButton.setInteractive();
      resumeButton.on("pointerdown", () => {
        this.resumeGame();
      });
  
      //Create the restart button
      const restartButton = this.add
        .text(
          this.game.config.width / 2,
          this.game.config.height / 2 + 35,
          "Restart",
          { fontSize: "32px", fill: "#FFF" }
        )
        .setOrigin(0.5);
      restartButton.setInteractive();
      restartButton.on("pointerdown", () => {
        this.restartGame();
      });
  
      //Create Main menu button
      const menuButton = this.add
        .text(
          this.game.config.width / 2,
          this.game.config.height / 2 + 140,
          "Main Menu",
          { fontSize: "32px", fill: "#FFF" }
        )
        .setOrigin(0.5);
      menuButton.setInteractive();
      menuButton.on("pointerdown", () => {
        this.backToMenu();
      });
    }
    //Function exits out of pause and continues game
    resumeGame() {
      this.scene.stop("PauseScene");
      this.scene.resume("GameScene");
    }
    //Function restarts game and exits out of pause screen
    restartGame() {
      this.scene.start("GameScene");
      this.scene.restart();
      this.scene.stop("PauseScene");
    }
    //Function stops all scenes and returns to the Main Menu
    backToMenu() {
      this.scene.start("ConfirmationScene");
    }
  }