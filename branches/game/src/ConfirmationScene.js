import game from './main.js';
//confirmation message scene
export default class ConfirmationScene extends Phaser.Scene {
    constructor() {
      super({ key: "ConfirmationScene" });
    }
    preload() {
      this.load.image("play", "assets/images/play_button.png");
    }
  
    create() {
      //keep the image of pause button on top left
      const play = this.add.image(16, 16, "play");
      play.setScale(0.5);
  
      //Create the box with confirmation message
      const dialogBox = this.add.rectangle(
        game.config.width / 2,
        game.config.height / 2,
        game.config.width * 0.8,
        150,
        0x000000,
        0.8
      );
      const message = this.add
        .text(game.config.width / 2, 280, "Are you sure you want to quit?", {
          fontSize: "24px",
          color: "#ffffff",
        })
        .setOrigin(0.5);
  
      //Create quit and cancel buttons
      const quitButton = this.add.text(game.config.width / 4, 350, "Quit", {
        fontSize: "24px",
        color: "#ffffff",
      });
      const cancelButton = this.add.text(400, 350, "Cancel", {
        fontSize: "24px",
        color: "#ffffff",
      });
  
      //Add event listeners to buttons
      quitButton.setInteractive();
      quitButton.on("pointerdown", () => {
        //Transition to main menu if user chooses to quit
        this.scene.stop("GameScene");
        this.scene.start("MainMenu");
        this.scene.stop("ConfirmationScene");
      });
  
      cancelButton.setInteractive();
      cancelButton.on("pointerdown", () => {
        //Transition back to resume screen if user chooses to cancel
        this.scene.start("PauseScene");
        this.scene.stop("ConfirmationScene");
      });
    }
  }