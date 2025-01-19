import game from './main.js';
//Gameover Scene
export default class GameoverScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameoverScene" });
    }
    preload() {
        this.load.image("background", "assets/images/grassBackground.png");
    }
    create(data) { //parameter data is the score being passed when we do this.scene.start('GameoverScene', { score: this.score});
        const score = data.score;
        //display the score
        const scoreText = this.add.text(game.config.width / 2, 200, `Score: ${score}`, {
            fontSize: "50px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        const message = this.add
        .text(game.config.width / 2, 50, "Game Over", {
          fontSize: "100px",
          color: "#ffffff",
        })
        .setOrigin(0.5);


  
        //Create quit and cancel buttons
        const againButton = this.add.text(game.config.width / 2, 550, "Again", {
            fontSize: "50px",
            color: "#ffffff",
        }).setOrigin(0.5);
        const leaveButton = this.add.text(game.config.width / 2, 600, "Leave", {
            fontSize: "50px",
            color: "#ffffff",
        }).setOrigin(0.5);

        againButton.setInteractive();
        againButton.on("pointerdown", () => {
            this.restartGame();
        });

        leaveButton.setInteractive();
        leaveButton.on("pointerdown", () => {
            this.mainMenu();
        });


    }
    restartGame() {
        this.scene.start("GameScene");
        this.scene.restart();
        this.scene.stop("GameoverScene");
    }
    mainMenu() {
        this.scene.start("MainMenu");
        this.scene.stop("GameoverScene");
    }

}