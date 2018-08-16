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

const player = {
    position: {x: 5, y: 5},
    matrix: matrix
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
    drawPiece(player.matrix, player.position);
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
    if (elapsedMilliseconds > CHOSEN_DIFFICULTY) {
        player.position.y++;
        elapsedMilliseconds = 0;
    }
    draw();
    requestAnimationFrame(update); 
}

update();