/* ship class that uses an image as representation of the player ship, with 
   properties of position, size, and movement speed,
   methods for display, movement, detecting collision, and resetting position */
class ship {
    constructor(x, y) {
        this.img = loadImage(
            "res/images/png-clipart-galaga-galaxian-golden-age-of-arcade-video-games-arcade-game-space-invaders-game-text-thumbnail.png"
        );
        this.x = x;
        this.y = y;
        this.width = 45;
        this.height = 45;
        this.speed = 5;
    }
    
    // function to display ship
    show = function () {
        // p5js function that displays the image with relevant position and size
        image(this.img, this.x, this.y, this.width, this.height);
    };
   
    // function to move ship using p5js keyboard input listener functions
    move = () => {
        // when left arrow key is pressed move airship left
        if (keyIsDown(LEFT_ARROW)) {
          this.x -= this.speed;
          // prevent ship from moving out of the sketch
          if (this.x < 0) {
            this.x = 0;
          }
        }
        // when right arrow key is pressed move airship right 
        else if (keyIsDown(RIGHT_ARROW)) {
          this.x += this.speed;
          // prevent ship from moving out of the sketch
          if (this.x > 755) { // hardcoded boundary
            this.x = 755;
          }
        }
    };

    // function to detect collision between player ship and some enemy (invader or invader missile)
    collide = (enemy) => {
        // if positions overlap then return true else return false
        if(this.y <= enemy.y + enemy.height &&
      this.y + this.height >= enemy.y &&
      this.x <= enemy.x + enemy.width &&
      this.x + this.width >= enemy.x){
        return true;
      }
      else {return false;}
    };

    // function to set player ship position to specified coordinates
    reset = (x, y) => {
        this.x = x;
        this.y = y;
    };
}