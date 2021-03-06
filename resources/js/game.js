// canvas setup
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
ctx.scale(20,20);

// pieces
function spawnPiece(type) {
    switch (type) {
        case 'T':
            return [
                [1, 1, 1],
                [0, 1, 0],
                [0, 0, 0]
            ];
            break;
        case 'I':
            return [
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0]
            ];
            break;
        case 'S':
            return [
                [0, 3, 3],
                [3, 3, 0],
                [0, 0, 0]
            ];
            break;
        case 'Z':
            return [
                [4, 4, 0],
                [0, 4, 4],
                [0, 0, 0]
            ];
            break;
        case 'L':
            return [
                [0, 5, 0],
                [0, 5, 0],
                [0, 5, 5]
            ];
            break;
        case 'J':
            return [
                [0, 6, 0],
                [0, 6, 0],
                [6, 6, 0]
            ];
            break;
        case 'O':
            return [
                [7, 7],
                [7, 7]
            ];
            break;
        default:
            break;
    }
}

// piece colors
const color = [null, 'blueviolet', 'aquamarine', 'forestgreen', 'crimson', 'darkorange', 'darkslateblue', 'darkkhaki'];
// piece names used for spawning them
const pieces = 'TISZLJO';

// create playing field
// the field is represented by a 2D array where 0's are empty spaces and non-zeros are occupied
function createField(width, height) {
    const fieldMatrix = [];
    while (height--) {
        fieldMatrix.push(new Array(width).fill(0));
    }
    return fieldMatrix;
}

const field = createField(10, 20);

const player = {
    position: {x: 0, y: 0},
    matrix: [],
    nextPiece: [],
    score: 0,
    linesCleared: 0,
    level: 0
}

// populate the 2D array field with non-zero values which represent the spaces
// where the player has their pieces
function populateFieldArray(field, player) {
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
                ctx.fillStyle = color[value];
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
    if (event.keyCode === 37) { // left
        sideControls(-1);
    }
    else if (event.keyCode === 39) { // right
        sideControls(1);
    }
    else if (event.keyCode === 65) { // rotate left with 'a'
        rotateWithCollision(-1);
    } 
    else if (event.keyCode === 68 || event.keyCode === 38) { // rotate right with 'd' or 'up'
        rotateWithCollision(1);
    } 
    else if (event.keyCode === 40) { // down
        pieceDrop();
    }
    else if (event.keyCode === 32) {
        hardDrop();
    }
})

// move the piece left or right, check for collision
function sideControls(direction) {
    player.position.x += direction;
    if (collision(field, player)) {
        player.position.x -= direction;
    }
}

// piece rotation
function rotate(piece, direction) { // transpose the matrix first
    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < row; col++) {
            [piece[row][col], piece[col][row]] = [piece[col][row], piece[row][col]]; // swap the values using tuple/destructing assignment
        }
    }
    // then reverse it
    if (direction > 0) {
        piece.forEach(row => row.reverse());
    }
    else {
        piece.reverse();
    }
}

// check for collision when rotating
// an 'offset' value is used to push the piece away from the occupied area
// this value alternates between +/- because we don't know where the collision is coming from
// the game might push the piece into the wall, so on the next iteration of the loop, the push will
// go on the opposite direction, + 1.
// this means the collision check may be required multiple times, so a while loop is used
function rotateWithCollision (direction) {
    let position = player.position.x;
    let offset = 1;
    rotate(player.matrix, direction);
    while (collision(field, player)) {
        player.position.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        // if (offset > player.matrix[0].length) {
            // rotate(player.matrix, -direction);
            // player.position.x = position;
            // return;
        // }
    }
}

// drop piece by 1 tile
function pieceDrop() {
    player.position.y++;
    if (collision(field, player))  { // if theres collision, move the piece back up by 1, so that they don't 'fuse'
        player.position.y--;
        populateFieldArray(field, player);
        lineCheck();
        resetPlayer();
        updateScore();
    }
    elapsedMilliseconds = 0;
}

// drop piece to the first occupied position in the field
function hardDrop() {
    let lineCount = 0;
    while (!(collision(field, player))) {
        player.position.y++;
        lineCount++;
    }
    player.position.y--;
    lineCount--;
    populateFieldArray(field, player);
    lineCheck();
    if (lineCount > 1) { // award points based on how early the player hard drops the piece
        player.score += lineCount + 10;
    }
    resetPlayer();
    updateScore();
    elapsedMilliseconds = 0;
}

// check for a line clear. the loop should start from the bottom, not top
function lineCheck() {
    let lineCounter = 1;
        current_row: for (let row = field.length - 1; row >= 0; row--) {
        for (let col = 0; col < field[row].length; col++) {
            if (field[row][col] === 0)
                continue current_row;
        }
        // remove/splice the filled row out and immediately fill it with zeros, then insert this zero'd row back at the top
        // this will drop the lines above it. 'row' must be manually incremented or else the next filled line to get pushed
        // down will be passed over since it now has the current row index.
        let clearedRow = field.splice(row, 1)[0].fill(0);
        field.unshift(clearedRow);
        row++;

        // award points. first line is worth 100 points. subsequent lines are doubled.
        player.score += lineCounter * 100;
        lineCounter *= 2;
        player.linesCleared++;
        // increase player level (and speed) every 10 lines
        if (player.linesCleared % 10 === 0 && player.level < 9) {
            player.level++;
            DIFFICULTY -= 300;
        }
    }
}

// after piece deploys, reset player back to top with a new random piece
function resetPlayer() {
    player.matrix = player.nextPiece;
    player.nextPiece = spawnPiece(pieces[Math.floor(Math.random() * 7)]);
    player.position.y = 0;
    player.position.x = (field[0].length / 2) - 1;

    // check for game over
    if (collision(field, player)) {
        field.forEach(row => row.fill(0));
        alert("Game Over!");
        player.score = 0;
    }
}

// update the score and line display
function updateScore() {
    document.getElementById("js-score-hud").innerText = player.score;
    document.getElementById("js-lines-hud").innerText = player.linesCleared;
    document.getElementById("js-level-hud").innerText = player.level;
    updateNext();
}
// update the next piece hud
const nextSrcs = {
    1: "resources/img/T.jpeg",
    2: "resources/img/I.jpeg",
    3: "resources/img/S.jpeg",
    4: "resources/img/Z.jpeg",
    5: "resources/img/L.jpeg",
    6: "resources/img/J.jpeg",
    7: "resources/img/O.jpeg"
}
function updateNext() {
    document.getElementById("js-next-hud").src = nextSrcs[player.nextPiece[0][1]];
}

// update the game state, interval depends on chosen difficulty
/*
'deltaTime' is the amount of time it takes for a frame to be drawn to the screen, usually dependant
on monitor refresh rate. On 60fps, this value is around 16ms. So every 1/60 of a second, this
value is accumulated into 'ellapsedMilliseconds' and if it reaches the 'CHOSEN_DIFFICULTY' value,
then that amount of time has passed. When that happens, update the player piece position then reset
the elapsed time to 0.
*/
var DIFFICULTY = 3000;

let elapsedMilliseconds = 0;
let previousTime = 0;
// 'time' is the elapsed time when the function was called. this parameter comes from requestAnimationFrame()
// the next 'time' value will be around 16ms bigger than the previous. this is how we can get deltaTime
function update(time = 0) { 
    let deltaTime = time - previousTime;
    previousTime = time;
    elapsedMilliseconds += deltaTime;
    if (elapsedMilliseconds > DIFFICULTY) { // once the set amount of seconds pass, drop the piece by 1 y-value
        pieceDrop();
    }
    draw();
    requestAnimationFrame(update); 
}
// spawn the first piece, and initialize the hud values
player.nextPiece = spawnPiece(pieces[Math.floor(Math.random() * 7)]);
resetPlayer();
updateScore();
update();