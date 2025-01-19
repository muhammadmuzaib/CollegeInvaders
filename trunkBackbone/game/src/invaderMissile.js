/** invader missile class that inherits from missile class, with
 *  properties of position, size, movement speed, and to remove flag,
 *  overwritten methods for display and movement
 */ 
class invaderMissile extends missile{
    constructor(x, y){
        super(x, y);
        this.width = 5;
        this.height = 8;
        this.speed = 5;
        this.toRemove = false;
    }

    // overwrite super class method for different color of missile
    show = () => {
        noStroke();
        fill(228, 0, 15);
        rect(this.x, this.y, this.width, this.height);
    };

    // overwrite super class method for moving downwards 
    move = function () {
        this.y += this.speed;
    };
}