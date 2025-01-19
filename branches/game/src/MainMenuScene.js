import game from './main.js';
//Create a MainMenu scene
export default class MainMenu extends Phaser.Scene {
    constructor() {
      super({ key: "MainMenu" }); //set unique key for the scene
    }
  
    //preload the assets
    preload() {
      this.load.image("mainbackground", "assets/images/gateway.png");
      this.load.image("mainbackground2", "assets/images/grassBackground.png");
      this.load.audio("menuMusic", "assets/audio/menu_music.mp3");
    }
  
    create() {
      var background = this.add.image(0, 0, "mainbackground2");
      background.setOrigin(0, 0);
      background.setScale(2);
      this.add.image(70, 150, "mainbackground").setOrigin(0);
      this.music = this.sound.add("menuMusic", {loop: true});
      this.music.play();

      this.add
        .text(325, 100, "College Invaders", {
          fontFamily: "Cosmic Sans Font",
          fontSize: "50px",
          fontWeight: "bold",
          fill: "#0000ff",
        })
        .setOrigin(0.5);
  
      //Create a play button
      const playButton = this.add
        .text(325, 280, "Play", {
          fontFamily: "Cosmic Sans Font",
          fontSize: "40px",
          fontWeight: "bold",
          fill: "#0000ff",
        })
        .setOrigin(0.5);
      playButton.setInteractive();
      playButton.on("pointerdown", () => {
        this.music.stop();
        this.scene.stop("MainMenu"); //start game when play button is pressed
        this.scene.start("GameScene");
      });
    }
  }