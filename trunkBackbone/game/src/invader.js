/** invader class that uses an image representation of an invader, with
 *  properties of position, size, movement speed, and to remove flag,
 *  methods for display, remove, and movement
 */
class invader {
  constructor(x, y) {
    this.img = loadImage(
      "res/images/57-578462_space-invaders-alien-png-photo-space-invaders-alien.png.jpeg"
    );
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.toRemove = false;
    this.xdir = 2;
  }

  // function that uses p5j function to display image representation of invader
  show = function () {
    image(this.img, this.x, this.y, this.width, this.width);
  };

  // function for toggling to remove flag
  destroy = () => {
    this.toRemove = true;
  };

  // function for horizontal movement
  move = () => {
    this.x += this.xdir;
  };

  // function for vertical movement and reversing horizontal movement 
  moveDown = () => {
    this.xdir *= -1;
    this.y += this.height/2;
  };
}
