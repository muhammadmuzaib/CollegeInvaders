/* missile class that uses p5js functions to represent a missile with 
   properties of position, size, movement speed, and a to remove flag,
   methods for display, movement, remove, and collision */
class missile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 8;
    this.speed = 5;
    this.toRemove = false;
  }

  // function to display missile using p5js methods
  show = () => {
    noStroke();
    fill(10, 186, 181);
    rect(this.x, this.y, this.width, this.height);
  };

  // function to move missile upwards
  move = function () {
    this.y -= this.speed;
  };

  // function to toggle remove flag
  removeMissile = () => {
    this.toRemove = true;
  };

  // function that returns whether the missile position overlaps with the enemy position
  hits = (enemy) => {
    if (
      this.y <= enemy.y + enemy.height &&
      this.y + this.height >= enemy.y &&
      this.x <= enemy.x + enemy.width &&
      this.x + this.width >= enemy.x
    ) { 
      return true;
    } else {
      return false;
    }
  };
}