// canvas setup
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#000';
ctx.fillRect(0,0,canvas.width, canvas.height);
ctx.scale(20,20);