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
const spriteWidth = 100;  // Tamaño original
const spriteHeight = 102; // Tamaño original

const crabImage = new Image();
crabImage.src = "../Assets/Sprites_Enemigos/spritesheetCrab.png";
const crabWidth = 116.5;    // Tamaño original
const crabHeight = 102;   // Tamaño original

const octopus = new Image();
octopus.src = "../Assets/Sprites_Enemigos/spritesheetOctopus.png";
const octopusWidth = 131; // Tamaño original
const octopusHeight = 102; // Tamaño original

const UFO = new Image();
UFO.src = "../Assets/Sprites_Enemigos/UFO.png";
const UFOWidth = 188;   // Tamaño original
const UFOHeight = 102;  // Tamaño original

// Jugadores
const PlayerImage1 = new Image();
PlayerImage1.src = "../Assets/Player1.png";
const PlayerImage2 = new Image();
PlayerImage2.src = "../Assets/Player2.png";

// ---------------------- VARIABLES GLOBALES ----------------------

const enemyColumns = 10;
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

let lastEnemyShotTime = 0;
const enemyShootCooldown = 1000; // 1 segundos
let enemyBullets = []; // Para almacenar los disparos de los enemigos
const maxEnemyShots = 3; // Número máximo de disparos de enemigos a la vez

// Enemigos vivos
let enemies = [];

// ---------------------- FUNCIONES DE ENEMIGOS ----------------------

// Inicializar enemigos en una matriz
function createEnemies() {
    enemies = [];
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyColumns; col++) {
            let type, width, height;

            if (row === 0) {
                type = 'squid';
                width = spriteWidth / 2;  // Reducido a la mitad
                height = spriteHeight / 2; // Reducido a la mitad
            } else if (row === 1 || row === 2) {
                type = 'crab';
                width = crabWidth / 2;    // Reducido a la mitad
                height = crabHeight / 2;   // Reducido a la mitad
            } else if (row === 3 || row === 4) {
                type = 'octopus';
                width = octopusWidth / 2; // Reducido a la mitad
                height = octopusHeight / 2; // Reducido a la mitad
            } else {
                type = 'octopus';
                width = octopusWidth / 2; // Reducido a la mitad
                height = octopusHeight / 2; // Reducido a la mitad
            }

            enemies.push({ row, col, type, width, height, alive: true });
        }
    }
}

// Movimiento de enemigos base
function moveEnemies() {
    enemyX += enemySpeed * direction;
    if (enemyX + (enemyColumns - 4) * (spriteWidth + enemySpacing) + spriteWidth > CANVAS_WIDTH || enemyX < 0) {
        direction *= -1;  
    }
    
    //movimiento UFO
    ufoX += ufoSpeed * ufoDirection;
    if (ufoX + UFOWidth > CANVAS_WIDTH || ufoX < 0) {
        ufoDirection *= -1;
    }
    //ANIMACION 
    if (gameFrame % staggerFrames === 0) {
        frameX = (frameX + 1) % 2;
    }
}

// Dibujar enemigos vivos y UFO
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

// Asignar un disparo aleatorio a un enemigo
function enemyShoot() {
    const currentTime = Date.now();
    if (currentTime - lastEnemyShotTime > enemyShootCooldown) {
        // Elegir un número aleatorio de disparos activos (máximo 3)
        const activeShots = enemyBullets.filter(bullet => bullet.alive).length;
        
        if (activeShots < maxEnemyShots) {
            // Elegir un enemigo aleatorio que aún esté vivo
            const aliveEnemies = enemies.filter(enemy => enemy.alive);
            if (aliveEnemies.length > 0) {
                const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                const enemyXPos = enemyX + randomEnemy.col * (randomEnemy.width + enemySpacing);
                const enemyYPos = enemyY + randomEnemy.row * (randomEnemy.height + enemySpacing);
                // Crear un disparo desde la posición del enemigo (hacia abajo)
                enemyBullets.push(new EnemyBullet(enemyXPos + randomEnemy.width / 2 - 2, enemyYPos + randomEnemy.height));
            }
        }
        lastEnemyShotTime = currentTime;
    }
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

// Modificar la clase Bullet para que las balas de los enemigos se muevan hacia abajo
class EnemyBullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.color = "white"; // Color de las balas de los enemigos
        this.speed = 4;
        this.alive = true; // Para determinar si la bala está activa
    }

    update() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    newPos() {
        this.y += this.speed; // Mover la bala hacia abajo
        if (this.y > CANVAS_HEIGHT) {
            this.alive = false; // La bala deja de estar activa cuando sale de la pantalla
        }
    }
}


// Verificar colisiones entre balas y enemigos
function checkBulletCollision(bullets, enemyW, enemyH) {
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
                // Enemigo alcanzado
                enemy.alive = false;
                bullets.splice(i, 1);
                break;
            }
        }
    }
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
    createEnemies(); // Crear enemigos al inicio
    player1 = new component(30, 30, "red", 10, canvas.height - 70, PlayerImage1);
    player2 = new component(30, 30, "blue", 100, canvas.height - 70, PlayerImage2);
}

// ---------------------- BUCLE PRINCIPAL ----------------------

// Modificar el bucle principal para incluir el disparo de enemigos
function updateGameArea() {
    myGameArea.clear();
    moveEnemies();
    drawEnemyGrid();
    gameFrame++;

    // Disparo aleatorio de enemigos
    enemyShoot(); // Llamamos a la función de disparo de enemigos

    // Movimiento jugadores
    player1.newPos("ArrowLeft", "ArrowRight");
    player1.update();

    player2.newPos("a", "d");
    player2.update();

    // Actualizar y mostrar balas de Player 1
    for (let i = bulletsPlayer1.length - 1; i >= 0; i--) {
        bulletsPlayer1[i].newPos();
        bulletsPlayer1[i].update();
    }

    // Actualizar y mostrar balas de Player 2
    for (let i = bulletsPlayer2.length - 1; i >= 0; i--) {
        bulletsPlayer2[i].newPos();
        bulletsPlayer2[i].update();
    }

    // Actualizar y mostrar balas de enemigos
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].newPos();
        enemyBullets[i].update();
    }

    // Detectar colisiones después de mover
    checkBulletCollision(bulletsPlayer1, spriteWidth, spriteHeight);
    checkBulletCollision(bulletsPlayer2, spriteWidth, spriteHeight);

    // Detectar colisiones entre las balas de los enemigos y los jugadores (Aquí puedes añadir esa lógica de colisión)

    // Disparos con cooldown
    let currentTime = Date.now();

    if (myGameArea.keys["ArrowUp"] && currentTime - lastShotPlayer1 > shootCooldown) {
        bulletsPlayer1.push(new Bullet(player1.x + player1.width / 2 - 2, player1.y, "yellow"));
        lastShotPlayer1 = currentTime;
    }

    if (myGameArea.keys["w"] && currentTime - lastShotPlayer2 > shootCooldown) {
        bulletsPlayer2.push(new Bullet(player2.x + player2.width / 2 - 2, player2.y, "green"));
        lastShotPlayer2 = currentTime;
    }

    requestAnimationFrame(updateGameArea);
}