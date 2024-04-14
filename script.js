const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  dx: 3, // Default ball speed
  dy: 3, // Default ball speed
  radius: 10
};

const playerPaddle = {
  width: 10,
  height: 100,
  x: 10,
  y: canvas.height / 2 - 50,
  speed: 15 // Increase player paddle speed
};

const opponentPaddle = {
  width: 10,
  height: 100,
  x: canvas.width - 20,
  y: canvas.height / 2 - 50,
  speed: 1 // Opponent paddle default speed (level 1)
};

let playerScore = 0;
let opponentScore = 0;
let gameInterval; // Variable to store the setInterval reference for pausing/resuming the game
let gamePaused = false; // Track the game pause state
let opponentHits = 0;
let movesCounter = 0; // Counter to track moves of the ball
const movesToStop = 5; // Number of moves after which opponentPaddle slows down
const stopDuration = 3000; // Duration in milliseconds for opponentPaddle to slow down
const maxHitsToMiss = 6; // Maximum hits to miss for opponentPaddle to slow down
let hitsSurvived = 0; // Counter to track hits survived by the player
let gameSpeed = 4; // Speed multiplier for opponent paddle movement

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.closePath();
}

function drawPaddle(paddle) {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.closePath();
}

function drawScore() {
  ctx.font = '30px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(`Player: ${playerScore}`, 50, 50);
  ctx.fillText(`Opponent: ${opponentScore}`, canvas.width - 250, 50);
}

let difficulty = 'easy'; // Default difficulty

function setDifficulty(level) {
  difficulty = level;
  if (level === 'easy') {
    ball.dx = 3;
    ball.dy = 3;
  } else if (level === 'hard') {
    ball.dx = 7; // Increase ball speed for hard level
    ball.dy = 7; // Increase ball speed for hard level
  }
}

function resetPoints() {
  playerScore = 0;
  opponentScore = 0;
}

function startGame() {
  gameInterval = setInterval(draw, 10); // Start the game interval
}

let timeLimit = 60; // Time limit in seconds
let startTime = Date.now(); // Start time
let remainingTime = timeLimit; // Remaining time

// Function to update the remaining time and reset the clock every minutelet lastMinute = 0; // Define lastMinute variable
let lastMinute = 0; // Define lastMinute variable
function updateRemainingTime() {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  remainingTime = Math.max(timeLimit - elapsedTime, 0);
  // Reset the start time every minute
  if (minutes !== lastMinute) {
    startTime = Date.now(); // Reset the start time
    lastMinute = minutes; // Update the last minute
  }
}

// Function to draw the clock displaying remaining time
function drawClock() {
  ctx.font = '20px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(`Time: ${remainingTime} seconds`, canvas.width - 150, 30);
}

// Update function
// Function to generate a blue ball at a random position on the canvas
function generateBlueBall() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 10,
    color: '#00f' // Blue color
  };
}

let blueBall = null; // Variable to store the blue ball
let splitBalls = []; // Array to store split balls

// Function to check collision between two balls
function checkBallCollision(ball1, ball2) {
  const dx = ball1.x - ball2.x;
  const dy = ball1.y - ball2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < ball1.radius + ball2.radius;
}





// Function to handle the splitting duration and revert to one ball after 10 seconds
function handleSplittingDuration() {
  setTimeout(() => {
    splitBalls = []; // Clear split balls
    // Revert to one ball with original direction
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 3; // Default ball speed
    ball.dy = 3; // Default ball speed
  }, 10000); // 10 seconds duration
}

// Function to check if the main ball collides with the blue ball
function checkBlueBallCollision() {
  if (blueBall && checkBallCollision(ball, blueBall)) {
    handleBlueBallCollision(); // Handle collision with blue ball
  }
}


// Function to draw the blue ball
function drawBlueBall() {
  ctx.beginPath();
  ctx.arc(blueBall.x, blueBall.y, blueBall.radius, 0, Math.PI * 2);
  ctx.fillStyle = blueBall.color;
  ctx.fill();
  ctx.closePath();
}
// Add a variable to control ball creation
let allowBallCreation = true;

// Function to stop ball creation
function stopBallCreation() {
  allowBallCreation = false;
}

let ballCreationInterval;

// Function to start ball creation
function startBallCreation() {
  ballCreationInterval = setInterval(() => {
    if (allowBallCreation && activeBalls.length < maxBallLimit) {
      createNewBall(); // Create a new ball if the limit hasn't been reached
    }
  }, 20000); // Check every 20 seconds
}
function handleBlueBall() {
  setInterval(() => {
    if (shouldBlueBallAppear() && allowBallCreation) {
      generateAndDrawBlueBall(); // Generate and draw the blue ball
    }
  }, 20000); // Check every 20 seconds
}

let splitBallStartTime = null;
const splitBallDuration = 10000;
function splitMainBall() {
  // Change the number of split balls as needed
  const numSplitBalls = 5; // Number of split balls
  const splitBallSpeed = 5; // Speed of split balls

  for (let i = 0; i < numSplitBalls; i++) {
    const angle = (Math.PI * 2 * i) / numSplitBalls;
    splitBalls.push({
      x: ball.x,
      y: ball.y,
      dx: splitBallSpeed * Math.cos(angle), // Set split ball direction
      dy: splitBallSpeed * Math.sin(angle), // Set split ball direction
      radius: ball.radius, // Set split ball radius to be the same as the main ball
      color: '#fff' // Color of split ball
    });
  }
}

// Function to draw split balls and update their positions
function drawSplitBalls() {
  splitBalls.forEach(splitBall => {
    // Update split ball position
    splitBall.x += splitBall.dx;
    splitBall.y += splitBall.dy;

    // Check if split ball hits the top or bottom wall
    if (splitBall.y + splitBall.dy > canvas.height - splitBall.radius || splitBall.y + splitBall.dy < splitBall.radius) {
      splitBall.dy = -splitBall.dy; // Reverse the y direction
    }

    // Check if split ball hits the left or right wall
    if (splitBall.x + splitBall.dx > canvas.width - splitBall.radius || splitBall.x + splitBall.dx < splitBall.radius) {
      splitBall.dx = -splitBall.dx; // Reverse the x direction
    }

    // Draw the split ball
    drawSplitBall(splitBall);
  });
}

function drawSplitBall(splitBall) {
  ctx.beginPath();
  ctx.arc(splitBall.x, splitBall.y, splitBall.radius, 0, Math.PI * 2);
  ctx.fillStyle = splitBall.color;
  ctx.fill();
  ctx.closePath();
}

// Call the handleBlueBall function to initiate blue ball appearance
handleBlueBall();

function generateAndDrawBlueBall() {
  blueBall = generateBlueBall(); // Generate a new blue ball
  blueBallExists = true; // Set blue ball existence to true
  drawBlueBall(); // Draw the blue ball
}
let blueBallExists = false; // Global variable to track the existence of the blue ball
let blueBallDisappearedTime = null; // Global variable to track the time when the blue ball disappeared

// Function to handle the appearance of the blue ball
// Function to handle blue ball appearance
function handleBlueBall() {
  setInterval(() => {
    if (shouldBlueBallAppear()) {
      generateAndDrawBlueBall(); // Generate and draw the blue ball
    }
  }, 20000); // Check every 20 seconds
}


// Function to check if the blue ball should appear
function shouldBlueBallAppear() {
  return !blueBallExists && (blueBallDisappearedTime === null || Date.now() - blueBallDisappearedTime >= 20000);
}
function handleBallPaddleCollision(ball) {
  // Check if the ball is the first ball
  const isFirstBall = ball === activeBalls[0];

  // Iterate through all active balls
  for (let i = 0; i < activeBalls.length; i++) {
    let ball = activeBalls[i];

    // Check collision with player paddle
    if (
      ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
      ball.x + ball.radius > playerPaddle.x &&
      ball.y - ball.radius < playerPaddle.y + playerPaddle.height &&
      ball.y + ball.radius > playerPaddle.y
    ) {
      // Reverse the x direction and adjust the y direction based on the position of the paddle
      const deltaY = ball.y - (playerPaddle.y + playerPaddle.height / 2);
      ball.dx = Math.abs(ball.dx); // Ensure ball moves towards opponent
      ball.dy = deltaY / (playerPaddle.height / 2);

      // If the ball is not the first ball, do not score points
      if (!isFirstBall) {
        return;
      }
    }

    // Check collision with opponent paddle
    if (
      ball.x - ball.radius < opponentPaddle.x + opponentPaddle.width &&
      ball.x + ball.radius > opponentPaddle.x &&
      ball.y - ball.radius < opponentPaddle.y + opponentPaddle.height &&
      ball.y + ball.radius > opponentPaddle.y
    ) {
      // Reverse the x direction and adjust the y direction based on the position of the paddle
      const deltaY = ball.y - (opponentPaddle.y + opponentPaddle.height / 2);
      ball.dx = -Math.abs(ball.dx); // Ensure ball moves towards player
      ball.dy = deltaY / (opponentPaddle.height / 2);

      // If the ball is not the first ball, do not score points
      if (!isFirstBall) {
        return;
      }
    }
  }
}

// Function to reset split ball position and properties
function resetSplitBall(splitBall) {
  splitBall.x = canvas.width / 2;
  splitBall.y = canvas.height / 2;
  splitBall.dx = -splitBall.dx; // Change split ball direction
  splitBall.dy = -splitBall.dy; // Change split ball direction
  splitBall.radius = ball.radius; // Set split ball radius to match the main ball
  splitBall.color = ball.color; // Set split ball color to match the main ball
}
// Function to handle collision between main ball and blue ball
function handleBlueBallCollision() {
  splitMainBall(); // Split the main ball into multiple balls
  blueBallExists = false; // Reset blue ball existence
}

// Function to handle blue ball disappearance
function handleBlueBallDisappearance() {
  blueBallExists = false;
  blueBallDisappearedTime = Date.now();
}

// Function to check if the main ball collides with the blue ball
function ballTouchesBlueBall() {
  const dx = ball.x - blueBall.x;
  const dy = ball.y - blueBall.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < ball.radius + blueBall.radius;
}

// Function to update the game state
function updateGameState() {
  // Check if the main ball collides with the blue ball
  if (blueBallExists && ballTouchesBlueBall()) {
    handleBlueBallCollision(); // Handle collision with blue ball
  }

  // Check if split balls exist and handle collision with paddles
  splitBalls.forEach(splitBall => {
    handleBallPaddleCollision(splitBall);
  });
}
const maxBallLimit = 5; // Maximum number of balls allowed
let activeBalls = []; // Array to store active balls
let ballCount = 0;// Update function
function draw() {
  // Update remaining time
  updateRemainingTime();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawPaddle(playerPaddle);
  drawPaddle(opponentPaddle);
  drawScore();
  drawClock(); // Draw the clock

  // Check if the blue ball exists and draw it
  if (blueBallExists) {
    drawBlueBall();
  }

  // Draw split balls and update their positions
  drawSplitBalls();

  // Update game state
  updateGameState(); // Call updateGameState() to handle split ball movement

  // Create a new ball only if ball creation is allowed and the maximum number of balls hasn't been reached
  if (allowBallCreation && ballCount < maxBallLimit) {
    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ensure the ball doesn't get stuck in the middle of the screen
    if (ball.x < 0 || ball.x > canvas.width || ball.y < 0 || ball.y > canvas.height) {
      resetBall();
    }

    // Check if the ball hits the top or bottom wall
    if (ball.y + ball.dy > canvas.height - ball.radius || ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy; // Reverse the y direction
    }

    // Check if the ball hits the left or right wall
    if (ball.x + ball.dx > canvas.width - ball.radius) {
      // Player scores a point
      playerScore++;
      resetBall();
    } else if (ball.x + ball.dx < ball.radius) {
      // Opponent scores a point
      opponentScore++;
      resetBall();
    }

    // Increment the ball count
    ballCount++;
  }

  // Move opponent paddle
  moveOpponentPaddle();

  // Check for collision with player paddle
  if (
    ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
    ball.x + ball.radius > playerPaddle.x &&
    ball.y - ball.radius < playerPaddle.y + playerPaddle.height &&
    ball.y + ball.radius > playerPaddle.y
  ) {
    // Reverse the x direction and adjust the y direction based on the position of the paddle
    const deltaY = ball.y - (playerPaddle.y + playerPaddle.height / 2);
    ball.dx = Math.abs(ball.dx); // Ensure ball moves towards opponent
    ball.dy = deltaY / (playerPaddle.height / 2);

    // Make player paddle go crazy
    playerPaddle.speed = Math.random() * 0.6 + 0.2; // Random speed between 0.2 and 0.8
  }

  // Check for collision with opponent paddle
  if (
    ball.x - ball.radius < opponentPaddle.x + opponentPaddle.width &&
    ball.x + ball.radius > opponentPaddle.x &&
    ball.y - ball.radius < opponentPaddle.y + opponentPaddle.height &&
    ball.y + ball.radius > opponentPaddle.y
  ) {
    // Reverse the x direction and adjust the y direction based on the position of the paddle
    const deltaY = ball.y - (opponentPaddle.y + opponentPaddle.height / 2);
    ball.dx = -Math.abs(ball.dx); // Ensure ball moves towards player
    ball.dy = deltaY / (opponentPaddle.height / 2);

    // Make opponent paddle go crazy
    opponentPaddle.speed = Math.random() * 0.6 + 0.2; // Random speed between 0.2 and 0.8
  }

  // Check if the maximum number of balls has been created
  if (ballCount >= maxBallLimit) {
    // Reset all balls to have properties of the normal ball
    resetAllBalls();
    ballCount = 0;
    // stopBallCreation(); 
  }
}
function moveBalls() {
  // Loop through all active balls
  for (let i = 0; i < activeBalls.length; i++) {
    let ball = activeBalls[i];

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ensure the ball doesn't get stuck in the middle of the screen
    if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
      ball.dx = -ball.dx; // Reverse the x direction if the ball hits the left or right wall
    }
    if (ball.y < ball.radius || ball.y > canvas.height - ball.radius) {
      ball.dy = -ball.dy; // Reverse the y direction if the ball hits the top or bottom wall
    }

    // Move opponent paddle towards the ball
    moveOpponentPaddleTowardsBall(ball);
  }
}

function moveOpponentPaddleTowardsBall(ball) {
  // Calculate the distance between the center of the opponent paddle and the ball
  const distanceY = ball.y - (opponentPaddle.y + opponentPaddle.height / 2);

  // Adjust opponent paddle speed based on the distance from the ball
  const speedFactor = Math.min(Math.abs(distanceY) / canvas.height, 1);
  const maxSpeed = opponentPaddle.speed * 2; // Maximum speed of the opponent paddle
  const minSpeed = opponentPaddle.speed / 2; // Minimum speed of the opponent paddle
  let paddleSpeed = minSpeed + (maxSpeed - minSpeed) * speedFactor;

  // Move opponent paddle towards the ball
  if (opponentPaddle.y + opponentPaddle.height / 2 < ball.y) {
    opponentPaddle.y += paddleSpeed;
  } else if (opponentPaddle.y + opponentPaddle.height / 2 > ball.y) {
    opponentPaddle.y -= paddleSpeed;
  }
}

// Function to create a new ball
function createNewBall() {
  const newBall = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: Math.random() * 4 - 2, // Random speed between -2 and 2
    dy: Math.random() * 4 - 2, // Random speed between -2 and 2
    radius: 10
  };
  activeBalls.push(newBall);
}

// Function to update ball position
function updateBallPosition(ball) {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Check if the ball hits the top or bottom wall
  if (ball.y + ball.dy > canvas.height - ball.radius || ball.y + ball.dy < ball.radius) {
    ball.dy = -ball.dy; // Reverse the y direction
  }

  // Check if the ball hits the left or right wall
  if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
    ball.dx = -ball.dx; // Reverse the x direction
  }
}

// Function to handle collision with paddles
function handlePaddleCollision(ball, paddle) {
  // Reverse the x direction and adjust the y direction based on the position of the paddle
  const deltaY = ball.y - (paddle.y + paddle.height / 2);
  ball.dx = -ball.dx; // Reverse the x direction
  ball.dy = deltaY / (paddle.height / 2);
}

// Function to reset all balls to have properties of the normal ball
function resetAllBalls() {
  ball.speed = 5; // Reset the speed of the ball to the normal speed
  // You may need to reset other properties of the ball here, such as color, size, etc.
  // Loop through split balls and reset their properties
  splitBalls.forEach((splitBall) => {
    splitBall.speed = 5; // Reset the speed of the split ball to the normal speed
    // You may need to reset other properties of the split ball here
  });
}


// Function to reset the ball position
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = -ball.dx; // Change ball direction
}

// Function to handle mouse movement for player paddle
canvas.addEventListener('mousemove', function(event) {
  handleMouseMovement(event);
});

// Function to handle mouse movement
function handleMouseMovement(event) {
  // Get the mouse position relative to the canvas
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;

  // Set the player paddle position based on the mouse position
  playerPaddle.y = mouseY - (playerPaddle.height / 2);

  // Ensure the player paddle stays within the canvas bounds
  playerPaddle.y = Math.max(0, Math.min(canvas.height - playerPaddle.height, playerPaddle.y));

  // Calculate the desired position for the opponent paddle based on the ball's position
  const desiredY = ball.y - opponentPaddle.height / 2;

  // Calculate the difference between the desired position and the current position
  const deltaY = desiredY - opponentPaddle.y;

  // Adjust the opponent paddle's position based on the difference and its speed
  if (deltaY > 0) {
    opponentPaddle.y += Math.min(opponentPaddle.speed, deltaY);
  } else {
    opponentPaddle.y -= Math.min(opponentPaddle.speed, -deltaY);
  }

  // Adjust the player paddle's position based on the ball's position
  const playerCenterY = playerPaddle.y + playerPaddle.height / 2;
  const ballCenterY = ball.y;
  const paddleCenterDiff = ballCenterY - playerCenterY;

  // Adjust the player paddle's position to follow the ball's movement vertically
  playerPaddle.y += paddleCenterDiff * 0.05; // Adjust the 0.05 factor as needed for responsiveness
  // Ensure the player paddle stays within the canvas bounds
  playerPaddle.y = Math.max(0, Math.min(canvas.height - playerPaddle.height, playerPaddle.y));

  // Adjust opponent speed based on difficulty level
  adjustOpponentSpeed(difficulty);
}

// Function to handle game difficulty level change
function changeDifficulty(level) {
  setDifficulty(level);
  resetPoints(); // Reset player and opponent scores
  resetBall(); // Reset ball position
}

// Track the position of the main ball
function trackBallPosition() {
  // Move opponent paddle towards the ball
  moveOpponentPaddleTowardsBall(ball);
}

// Adjust the opponent paddle's position based on the ball's position
function moveOpponentPaddleTowardsBall(ball) {
  // Calculate the desired position for the opponent paddle based on the ball's position
  const desiredY = ball.y - opponentPaddle.height / 2;

  // Calculate the difference between the desired position and the current position
  const deltaY = desiredY - opponentPaddle.y;

  // Adjust the opponent paddle's position based on the difference and its speed
  if (deltaY > 0) {
    opponentPaddle.y += Math.min(opponentPaddle.speed, deltaY);
  } else {
    opponentPaddle.y -= Math.min(opponentPaddle.speed, -deltaY);
  }
}

// Function to initialize the game and start tracking the ball's position
function initializeGame() {
  handleBlueBall(); // Start generating blue balls
  startGame(); // Start the game
  setInterval(trackBallPosition, 10); // Track the position of the main ball every 10 milliseconds
}

// Call the function to initialize the game
initializeGame();





function handleGameOver(outcome) {
  clearInterval(gameInterval); // Stop the game interval

  // Display victory or defeat message
  const message = outcome === 'win' ? 'Congratulations! You win!' : 'Game Over! You lose!';
  ctx.font = '40px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(message, canvas.width / 2 - 200, canvas.height / 2);

  // Delay before resetting the game
  setTimeout(() => {
    // Reset scores
    playerScore = 0;
    opponentScore = 0;
    // Reset ball
    resetBall();
    // Start a new game
    gameInterval = setInterval(draw, 10);
  }, 2000); // Adjust the delay time as needed
}


function moveOpponentPaddle() {
  // Calculate the center of the opponent paddle
  const opponentPaddleCenter = opponentPaddle.y + opponentPaddle.height / 2;

  // Calculate the distance between the center of the paddle and the ball
  const deltaY = ball.y - opponentPaddleCenter;

  // Adjust the opponent paddle's position based on the distance and its speed
  opponentPaddle.y += deltaY * opponentPaddle.speed;

  // Ensure the opponent paddle stays within the canvas bounds
  opponentPaddle.y = Math.max(0, Math.min(canvas.height - opponentPaddle.height, opponentPaddle.y));
}

// Function to randomly set the ball direction within a given range
function setRandomBallDirection() {
  const min = -5; // Minimum value for ball direction
  const max = 5; // Maximum value for ball direction
  ball.dx = Math.floor(Math.random() * (max - min + 1)) + min;
  ball.dy = Math.floor(Math.random() * (max - min + 1)) + min;
}


// Paddle Movement - Follow Mouse Position
canvas.addEventListener('mousemove', function(event) {
  handleMouseMovement(event);
});




function adjustOpponentSpeed(level) {
  if (level === 'easy') {
    opponentPaddle.speed = 1; // Set opponent paddle speed for easy level
  } else if (level === 'hard') {
    opponentPaddle.speed = 2; // Set opponent paddle speed for hard level
  } else if (level === 'expert') {
    opponentPaddle.speed = 3; // Set opponent paddle speed for expert level
  }
}


const movementPatterns = [
  { dx: 3, dy: 3 },    // Straight line movement
  { dx: -3, dy: 3 },   // Diagonal movement
  { dx: 0, dy: 5 },    // Vertical movement
  { dx: 5, dy: 0 },    // Horizontal movement
  { dx: 2, dy: 2 },    // Custom pattern 1
  { dx: -2, dy: -2 },  // Custom pattern 2
  { dx: 4, dy: -3 },   // Custom pattern 3
  { dx: -4, dy: 3 },   // Custom pattern 4
  { dx: 6, dy: 2 },    // Custom pattern 5
  { dx: -5, dy: -4 },  // Custom pattern 6
  // Add more patterns as needed
];

// Function to randomly select a movement pattern for the ball
function setRandomBallPattern() {
  const patternIndex = Math.floor(Math.random() * movementPatterns.length);
  const pattern = movementPatterns[patternIndex];
  ball.dx = pattern.dx;
  ball.dy = pattern.dy;
}
// Function to start the game with a random ball direction and pattern
function startGameWithRandomDirectionAndPattern() {
  setRandomBallDirection();
  setRandomBallPattern();
  startGame();
}

// Call the function to start the game with random direction and pattern
startGameWithRandomDirectionAndPattern();
