// Iniciar el juego cuando cargue la página
window.onload = function () {
    startGame();
};

// Obtenemos el canvas por id y guardamos el contexto 2D
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Configuración del canvas a pantalla completa
const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight;

// ---------------------- CARGA DE SPRITES ----------------------

// Enemigos
const squidImage = new Image();
squidImage.src = "../Assets/Sprites_Enemigos/spritesheetSquid.png";
const spriteWidth = 123;
const spriteHeight = 102;

const crabImage = new Image();
crabImage.src = "../Assets/Sprites_Enemigos/spritesheetCrab.png";
const crabWidth = 116.5;
const crabHeight = 102;

const octopus = new Image();
octopus.src = "../Assets/Sprites_Enemigos/spritesheetOctopus.png";
const octopusWidth = 131;
const octopusHeight = 102;

const UFO = new Image();
UFO.src = "../Assets/Sprites_Enemigos/UFO.png";
const UFOWidth = 188;
const UFOHeight = 102;

// Jugadores
const PlayerImage1 = new Image();
PlayerImage1.src = "../Assets/Player1.png";
const PlayerImage2 = new Image();
PlayerImage2.src = "../Assets/Player2.png";

// ---------------------- VARIABLES GLOBALES ----------------------

const enemyColumns = 8;
const enemyRows = 10;
const enemySpacing = 20;
let enemyX = 50;
let enemyY = 80;
let enemySpeed = 1;
let direction = 1;

let ufoX = 0;
let ufoY = 10;
let ufoSpeed = 3;
let ufoDirection = 1;

let gameFrame = 0;
const staggerFrames = 20;
let frameX = 0;

let player1, player2;
let bulletsPlayer1 = [];
let bulletsPlayer2 = [];
let lastShotPlayer1 = 0;
let lastShotPlayer2 = 0;
const shootCooldown = 500;

let enemies = [];

// Sistema de puntos
let scorePlayer1 = 0;
let scorePlayer2 = 0;

// ---------------------- FUNCIONES DE ENEMIGOS ----------------------

function createEnemies() {
    enemies = [];
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyColumns; col++) {
            let type, width, height;

            if (row === 0) {
                type = 'squid';
                width = spriteWidth / 2;
                height = spriteHeight / 2;
            } else if (row === 1 || row === 2) {
                type = 'crab';
                width = crabWidth / 2;
                height = crabHeight / 2;
            } else {
                type = 'octopus';
                width = octopusWidth / 2;
                height = octopusHeight / 2;
            }

            enemies.push({ row, col, type, width, height, alive: true });
        }
    }
}

function moveEnemies() {
    enemyX += enemySpeed * direction;
    if (enemyX + (enemyColumns * (spriteWidth + enemySpacing)) > CANVAS_WIDTH || enemyX < 0) {
        direction *= -1;
    }

    ufoX += ufoSpeed * ufoDirection;
    if (ufoX + UFOWidth > CANVAS_WIDTH || ufoX < 0) {
        ufoDirection *= -1;
    }

    if (gameFrame % staggerFrames === 0) {
        frameX = (frameX + 1) % 2;
    }
}

function drawEnemyGrid() {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;

        let x = enemyX + enemy.col * (enemy.width + enemySpacing);
        let y = enemyY + enemy.row * (enemy.height + enemySpacing);

        if (enemy.type === 'squid') {
            ctx.drawImage(squidImage, frameX * spriteWidth, 0, spriteWidth, spriteHeight, x, y, enemy.width, enemy.height);
        } else if (enemy.type === 'crab') {
            ctx.drawImage(crabImage, frameX * crabWidth, 0, crabWidth, crabHeight, x, y, enemy.width, enemy.height);
        } else if (enemy.type === 'octopus') {
            ctx.drawImage(octopus, frameX * octopusWidth, 0, octopusWidth, octopusHeight, x, y, enemy.width, enemy.height);
        }
    });

    ctx.drawImage(UFO, 0, 0, UFOWidth, UFOHeight, ufoX, ufoY, UFOWidth, UFOHeight);
}

// ---------------------- JUGADORES ----------------------

function component(width, height, color, x, y, PlayerImage) {
    this.width = width;
    this.height = height;
    this.speed = 3;
    this.x = x;
    this.y = y;
    this.image = PlayerImage;

    this.update = function () {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    };

    this.newPos = function (leftKey, rightKey) {
        if (myGameArea.keys[leftKey] && this.x > 0) {
            this.x -= this.speed;
        }
        if (myGameArea.keys[rightKey] && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    };
}

// ---------------------- BALAS ----------------------

function Bullet(x, y, color) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 10;
    this.color = color;
    this.speed = 4;

    this.update = function () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    this.newPos = function () {
        this.y -= this.speed;
    };
}

// Detectar colisiones y sumar puntos
function checkBulletCollision(bullets, playerNumber) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            if (!enemy.alive) continue;

            const x = enemyX + enemy.col * (enemy.width + enemySpacing);
            const y = enemyY + enemy.row * (enemy.height + enemySpacing);

            if (
                bullet.x < x + enemy.width &&
                bullet.x + bullet.width > x &&
                bullet.y < y + enemy.height &&
                bullet.y + bullet.height > y
            ) {
                enemy.alive = false;
                bullets.splice(i, 1);

                if (playerNumber === 1) scorePlayer1 += 1;
                else if (playerNumber === 2) scorePlayer2 += 1;

                break;
            }
        }
    }
}

// Dibujar puntuaciones
function drawScores() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Jugador 1: " + scorePlayer1, 20, 30);
    ctx.fillText("Jugador 2: " + scorePlayer2, CANVAS_WIDTH - 160, 30);
}

// ---------------------- ÁREA DE JUEGO ----------------------

var myGameArea = {
    canvas: canvas,
    context: ctx,
    keys: {},

    start: function () {
        window.addEventListener("keydown", (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.key] = false;
        });

        requestAnimationFrame(updateGameArea);
    },

    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

// ---------------------- INICIAR JUEGO ----------------------

function startGame() {
    myGameArea.start();
    createEnemies();
    player1 = new component(30, 30, "red", 10, canvas.height - 70, PlayerImage1);
    player2 = new component(30, 30, "blue", 100, canvas.height - 70, PlayerImage2);
}

// ---------------------- BUCLE PRINCIPAL ----------------------

function updateGameArea() {
    myGameArea.clear();
    moveEnemies();
    drawEnemyGrid();
    gameFrame++;

    player1.newPos("ArrowLeft", "ArrowRight");
    player1.update();

    player2.newPos("a", "d");
    player2.update();

    for (let i = bulletsPlayer1.length - 1; i >= 0; i--) {
        bulletsPlayer1[i].newPos();
        bulletsPlayer1[i].update();
    }

    for (let i = bulletsPlayer2.length - 1; i >= 0; i--) {
        bulletsPlayer2[i].newPos();
        bulletsPlayer2[i].update();
    }

    checkBulletCollision(bulletsPlayer1, 1);
    checkBulletCollision(bulletsPlayer2, 2);

    let currentTime = Date.now();

    if (myGameArea.keys["ArrowUp"] && currentTime - lastShotPlayer1 > shootCooldown) {
        bulletsPlayer1.push(new Bullet(player1.x + player1.width / 2 - 2, player1.y, "yellow"));
        lastShotPlayer1 = currentTime;
    }

    if (myGameArea.keys["w"] && currentTime - lastShotPlayer2 > shootCooldown) {
        bulletsPlayer2.push(new Bullet(player2.x + player2.width / 2 - 2, player2.y, "green"));
        lastShotPlayer2 = currentTime;
    }

    drawScores();
    requestAnimationFrame(updateGameArea);
}