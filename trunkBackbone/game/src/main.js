// game entities
var airship; // player ship object
var invaders = []; // array of invaders
var missiles = []; // array of player missiles 
var invaderMissiles = []; // array of invader missiles

// utilities
var font; // font variable
var canvas; // canvas object used to allow for the use of p5.js display functionalities

// flags
var gameStart = false; // boolean for toggling between pre game ui and game
var gameover = false; // boolean for toggling between game and gameover
var edge = false; // boolean for determining whether position touches boundaries of the sketch
var isPaused = false; // boolean for toggling between pause and resume

// condition values
var score = 0; // player score accumulator variable
var lives = 3; // number of player chance
var level = 0; // integer used to increment game difficulty
var row = 6; // number of rows of invaders
var column = 12; // number of columns of invaders
var fireInterval = 120; // frame count that determines missile frequency
var currentFrame = 0; // frame counter that decides when to set off invader missiles

// UI 
var playAgainButton; // button to play again after player loses
var pauseButton; // button to pause game 
var resumeButton; // button to resume game
var restartButton; // button to restart game
var quitButton; // button to return to pre game ui

// p5js function used to define initial environment properties
function setup() {
  canvas = createCanvas(800, 800); // size of sketch
  centerCanvas(); // center display
  noStroke(); // optimize display

  airship = new ship(width / 2, height - 50); // assign ship object to airship variable
  spawnInvaders();

  pauseButton = new button(25, 25, 50, 50, "||", font); // create pause button
  playAgainButton = new button(width/2 - width/6, height/1.8, 260, 50, "Play Again?", font); // create play again button
  resumeButton = new button(width/2 - width/6, height/2, 260, 50, "Resume", font); // create resume button
  restartButton = new button(width/2 - width/6, height/1.75, 260, 50, "Restart", font); // create restart button
  playButton = new button(width/2 - width/6, height/1.75, 260, 50, "Play Game", font); // create play button
  quitButton = new button(width/2 -width/12, height/1.55, 130, 50, "Quit", font); // create quit button
}

// p5js function that is called before setup(), used to load resources
function preload(){
  font = loadFont("res/fonts/PressStart2P-Regular.ttf"); // create font
}

// p5js function that is called right after setup(), creates the sketch and continuously executes code inside it, looping frame by frame
function draw() {
  background(0); // setting sketch background color

  // Pre-game 
  if(!gameStart){
    // p5js methods for displaying text
    textAlign(CENTER);
    textFont(font);
    textSize(40);
    fill(124, 255, 121);
    text("College Invaders", width / 2, height / 2); 

    playButton.draw(); // display play button
    mouseHoverChangeCursor(playButton);
  }

  // execute game until player loses
  if(gameStart){
    if (!gameover) {
      game();
    } else {
      gameOver();
    }
  }
}

// general game functionality
function game(){
  pauseButton.draw(); // create pause button 
  mouseHoverChangeCursor(pauseButton); 

  if(isPaused){
    pauseGame();
  }

  airship.show(); // display player ship
  airship.move(); // allow player ship movement

  // player loses when chances are all used
  if (lives <= 0) {
    gameover = true;
  }

  // displaying and moving each invader, and checking for collision
  for (let i = 0; i < invaders.length; i++) {
    invaders[i].show(); // displaying invaders
    invaders[i].move(); // horizontal movement of invaders

    // checking to see if any invaders touch the boundaries of the canvas 
    if (invaders[i].x > 755 || invaders[i].x < 0) {
      edge = true;
    }

    checkCollision(); // checking for collision of player ship and invaders
    
    // checking to see if any invaders reach bottom of canvas, if so the player loses 
    if(invaders[i].y > airship.y){
      gameover = true;
    }
  }

  // shift invaders down after shifting horizontal movement
  if (edge) {
    for (let i = 0; i < invaders.length; i++) {
      invaders[i].moveDown();
    }
    edge = false;
  }

  // displaying and moving each player missile, and checking for collision between player missiles and invaders
  for(let i = missiles.length - 1; i >= 0; i--) {
    missiles[i].move(); // move player missiles
    missiles[i].show(); // display player missiles

    // remove player missiles after they go out of the sketch
    if(missiles[i].y < 0) {
      missiles[i].removeMissile();
    }

    // when collision is detected, remove invader and missile, and increment score
    for(let j = invaders.length - 1; j >= 0; j--) {
      if (missiles[i].hits(invaders[j])) {
        invaders[j].destroy();
        missiles[i].removeMissile();
        score += 5;
      }
    }

    toRemove(missiles); // remove missiles
    toRemove(invaders); // remove invaders
  }

  // when all invaders removed, call method for appropriate action
  if(invaders.length === 0){
    invadersDestroyed();
  }

  // fire invader missile when frame count reaches fire interval
  if(currentFrame >= fireInterval){
    fireInvaderMissile();
    currentFrame = 0;
  }

  // frame counter for each iteration of the draw() method
  currentFrame += 1;

  // displaying and moving each invader missile, and checking for collision between player ship and invader missile
  for(let i = invaderMissiles.length - 1; i >= 0; i--){
    invaderMissiles[i].move(); // move invader missiles 
    invaderMissiles[i].show(); // display invader missiles

    // remove invader missiles after they go out of the sketch
    if(invaderMissiles[i].y > height){
      invaderMissiles[i].removeMissile();
    }

    // decrement player chance by one after collision of player ship and invader missile
    if(invaderMissiles[i].hits(airship)){
      invaderMissiles[i].removeMissile();
      lives--;
    }

    toRemove(invaderMissiles); // remove invader missile
  }
}

// function to randomly choose an invader and let it fire a missile 
function fireInvaderMissile(){
  let randomInvader = getRandomInvader();
  invaderMissiles.push(
    new invaderMissile(
      randomInvader.x + randomInvader.width / 2,
      randomInvader.y + randomInvader.height / 2
    )
  );
}

// p5js keyboard input listener function
function keyPressed(){
  // fires a player missile when spacebar is pressed
  if (keyCode === 32) {
    missiles.push(new missile(airship.x + airship.width / 2, airship.y));
  }
}

// function to remove, removable game entities in array
function toRemove(arr){
  for(let i = 0; i < arr.length; i++){
    if(arr[i].toRemove){
      arr.splice(i, 1);
    }
  }
}

// function to check collision between player ship and invaders, if so decrement player chance and remove invader
function checkCollision(){
  for(let i = 0; i < invaders.length; i++){
    if(airship.collide(invaders[i])){
      lives--;
      invaders[i].destroy();
    }
  }
}

// function to display game over interface after player loses
function gameOver(){
  textAlign(CENTER);
  textFont(font);
  textSize(64);
  fill(124, 255, 121);
  text("Game Over", width/2, height/2);

  playAgainButton.draw(); // display play again button
  mouseHoverChangeCursor(playAgainButton); // change cursor while hovering over play again button
}

// p5js mouse input listener function 
function mousePressed(){
  // reset game after play again button is clicked
  if(playAgainButton.isMouseHover() && gameover){
    resetGame();
  }
  // toggle pause flag after pause button is clicked
  else if(pauseButton.isMouseHover() && gameStart){
    isPaused = !isPaused;
  }
  // resume game after resume button is clicked
  else if(resumeButton.isMouseHover() && isPaused){
    resumeGame();
  }
  // restart game after restart button is clicked
  else if(restartButton.isMouseHover() && isPaused){
    resetGame();
    resumeGame();
  }
  // start game after play button is clicked
  else if(playButton.isMouseHover() && !gameStart){
    gameStart = !gameStart; 
  }
  // return to pre game ui after quit button is clicked
  else if(quitButton.isMouseHover() && isPaused){
    gameStart = !gameStart;
    resumeGame();
  }
}

// function to reset game
function resetGame(){
  airship.reset(width / 2, height - 50); // reposition player ship
  // reset variable to default value
  invaders = []; 
  missiles = [];
  invaderMissiles = [];
  score = 0;
  lives = 3;
  level = 0;
  fireInterval = 120;
  gameover = false;
  spawnInvaders();
}

// function to spawn row times column numbers of invaders, with the specified number of rows and columns
function spawnInvaders(){
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < column; j++) {
      let x = width / 5 + j * 50; // hardcoded positioning
      let y = 80 + i * 40; // hardcoded positioning
      invaders.push(new invader(x, y));
    }
  }
}

// function that executes appropriate action after invaders are all destroyed by player
function invadersDestroyed(){
  // capping max level to 5 
  if(level < 5){
    level++; // increment level
    fireInterval = Math.ceil(fireInterval / 2); // decrease fire interval to increase missile frequency
  }
  // clear remaining player and invader missiles then spawn new group of invaders
  while(invaders.length === 0){
    missiles = [];
    invaderMissiles = [];
    spawnInvaders();
    break;
  }
}

// function to get random invader
function getRandomInvader(){
  // Math.random() returns a random, floating point number greater than or equal to 0 and less than 1
  let n = Math.floor(Math.random() * invaders.length); // n is a random integer representing the index of the random invader chosen
  return invaders[n];
} 

// function to change cursor from arrow to pointer while hovering over the specified button
function mouseHoverChangeCursor(somebutton){
  if(somebutton.isMouseHover()){
    cursor('pointer');
  }
  else{
    cursor(ARROW);
  }
}

// function to center the sketch display
function centerCanvas(){
  let x = (windowWidth - width)/2;
  let y =(windowHeight - height)/2;
  canvas.position(x, y); 
}

// p5js function to handle sketch position when window is resized
function windowResized(){
  centerCanvas();
}

// function to pause game 
function pauseGame(){
  if(isLooping()){
    noLoop();
  }

  resumeButton.draw(); // display resume button
  restartButton.draw(); // display restart button
  quitButton.draw(); // display quit button
  mouseHoverChangeCursor(restartButton);
  mouseHoverChangeCursor(resumeButton);
  mouseHoverChangeCursor(quitButton);
}

// function to resume game 
function resumeGame(){
  isPaused = !isPaused; // toggle pause flag

  if(!isLooping()){
    loop();
  }
}



  
  
