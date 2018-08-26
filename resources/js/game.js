// canvas setup
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
ctx.scale(20,20);

// pieces
const matrix = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0]
];

// create playing field
// the field is represented by a 2D array where 0's are empty spaces and non-zeros are occupied
function createField(width, height) {
    const fieldMatrix = [];
    while (height--) {
        fieldMatrix.push(new Array(width).fill(0));
    }
    return fieldMatrix;
}

const field = createField(12, 20);

const player = {
    position: {x: 5, y: 0},
    matrix: matrix
}

// populate the 2D array field with non-zero values which represent the spaces
// where the player has their pieces
function spawn_on_field(field, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                field[y + player.position.y][x + player.position.x] = value;
            }
        })
    })
}

// use the non-zero values on the 2D array of the field as a way to check for
// 'collision'. pieces can move freely in any '0' spaces
function collision(field, player) {
    let [piece, offset] = [player.matrix, player.position];
    for (let row = 0; row < piece.length; ++row) {
        for (let col = 0; col < piece[row].length; ++col) {
            if (piece[row][col] !== 0 &&
                (field[row + offset.y] && // check if a row exists/is available
                field[row + offset.y][col + offset.x]) !== 0) { // check if the specific tile is occupied
                    return true; // space is occupied, return true
                }
        }
    }
    return false;
}

// function to draw a piece to the canvas
// 'offset' is an object that contains x and y values that adjust the position of
// the piece on the canvas
function drawPiece(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = 'green';
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width, canvas.height);
    drawPiece(field, {x: 0, y: 0}); // draw the pieces on the field
    drawPiece(player.matrix, player.position); // draw the current piece in play
}

// piece movement events
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        player.position.x--;
    }
    else if (event.keyCode === 39) {
        player.position.x++;
    }
    else if (event.keyCode === 40) {
        softDrop();
    }
})

function softDrop() {
    player.position.y++;
    if (collision(field, player))  { // if theres collision, move the piece back up by 1, so that they don't 'fuse'
        player.position.y--;
        spawn_on_field(field, player);
        player.position.y = 0; // reset player position back to top
    }
    elapsedMilliseconds = 0;
}

// update the game state, interval depends on chosen difficulty
/*
'deltaTime' is the amount of time it takes for a frame to be drawn to the screen, usually dependant
on monitor refresh rate. On 60fps, this value is around 16ms. So every 1/60 of a second, this
value is accumulated into 'ellapsedMilliseconds' and if it reaches the 'CHOSEN_DIFFICULTY' value,
then that amount of time has passed. When that happens, update the player piece position then reset
the elapsed time to 0.
*/
const DIFFICULTY = {
    EASY: 3000,
    NORMAL: 1000,
    HARD: 500
}
var CHOSEN_DIFFICULTY = DIFFICULTY.NORMAL;
let elapsedMilliseconds = 0;
let previousTime = 0;
// 'time' is the elapsed time when the function was called. this parameter comes from requestAnimationFrame()
// the next 'time' value will be around 16ms bigger than the previous. this is how we can get deltaTime
function update(time = 0) { 
    let deltaTime = time - previousTime;
    previousTime = time;
    elapsedMilliseconds += deltaTime;
    if (elapsedMilliseconds > CHOSEN_DIFFICULTY) { // once the set amount of seconds pass, drop the piece by 1 y-value
        softDrop();
    }
    draw();
    requestAnimationFrame(update); 
}

update();