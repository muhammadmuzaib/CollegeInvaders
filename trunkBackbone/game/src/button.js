/* button class that uses p5js functions to imitate a button, with 
   properties of position, size, text, and font,
   methods for display and mouse hover detection */
class button{
    constructor(x, y, width, height, t, font){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.t = t;
        this.font = font;
    }

    // function to display button using p5js methods
    draw = () => {
        noStroke(); // no outline
        noFill(); // no filling 
        rect(this.x, this.y, this.width, this.height); // invisible rectangle with relevant size and position
        textAlign(CENTER, BOTTOM); // center text
        textFont(this.font); // set font
        textSize(24); // set text size
        fill(124, 255, 121); // color of text
        text(this.t, this.x + this.width/2, this.y + this.height/2); // display text on top of invisible rectangle
    };

    // function that returns whether the mouse is hovering over the button
    isMouseHover = () => {
        // returns whether the mouse position is overlapping with the button's position
        return (
          mouseX >= this.x &&
          mouseX <= this.x + this.width &&
          mouseY >= this.y &&
          mouseY <= this.y + this.height
        );
    };
}