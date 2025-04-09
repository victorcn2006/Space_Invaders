/*const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");*/

const enemies = [];
let enemyDirection = 1;
const enemyImage = new Image();
enemyImage.src = "Sprites_Enemigos/space_0001_A2.png"; 
for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 8; j++) {
        enemies.push({ x: 50 + j * 50, y: 30 + i * 30, width: 30, height: 20 });
    }
}

function drawEnemies() {
    let changeDirection = false;
    enemies.forEach(enemy => {
        enemy.x += enemyDirection * 2;
        if (enemy.x <= 10 || enemy.x >= canvas.width - 40) changeDirection = true;
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    });
    if (changeDirection) {
        enemyDirection *= -1;
        enemies.forEach(enemy => enemy.y += 20);
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEnemies();
    requestAnimationFrame(gameLoop);
}

gameLoop();