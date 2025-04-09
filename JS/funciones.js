// Iniciar el juego cuando cargue la página
window.onload = function () {
    startGame();
};

// Obtenemos el canvas por id y lo guardamos en una constante ya que esta no se moverá
const canvas = document.getElementById('canvas');
//Guardamos el contexto 2D en la variable constante ctx
const ctx = canvas.getContext('2d');

// Configuración del canvas con las medidas de pantalla completa
const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight;

// ANIMACIONES DE ENEMIGOS
/**
 * 1.Generamos un objeto con el Image, posteriormente guardamos en el objeto la imagen del spritesheet
 * 2.Creamos dos variables constantes de la medida del ancho y alto del sprite sheet
 * 3.Ancho(width) = px totales de ancho / num de sprites por fila 
 * 4.Alto(height) = px totales de alto / num de sprites por columna
 */

/*SQUID*/
const squidImage = new Image();
squidImage.src = "../Assets/Sprites_Enemigos/spritesheetSquid.png";
const spriteWidth = 123;
const spriteHeight = 102;
/*CRAB*/
const crabImage = new Image();
crabImage.src = "../Assets/Sprites_Enemigos/spritesheetCrab.png";
const crabWidth = 116.5;
const crabHeight = 102;
/*OCTOPUS*/
const octopus = new Image();
octopus.src = "../Assets/Sprites_Enemigos/spritesheetOctopus.png";
const octopusWidth = 131;
const octopusHeight = 102;
/*UFO*/
const UFO = new Image();
UFO.src = "../Assets/Sprites_Enemigos/UFO.png";
const UFOWidth = 188;
const UFOHeight = 102;

/*Sprites Players*/
const PlayerImage1 = new Image();
PlayerImage1.src="../Assets/Player1.png";
const PlayerImage2 = new Image();
PlayerImage2.src="../Assets/Player2.png";

// Creacion de la cuadrícula con los 100 enemigos
const enemyColumns = 8;
const enemyRows = 10;
const enemySpacing = 20;
/*Donde empiezan los enemigos, 50x y 50y es la esquina superior izquierda pero con un poco de margen tanto arriba como a los lados*/
let enemyX = 50;
let enemyY = 80;
//Velocidad de todos los enemigos
let enemySpeed = 1;
//1 de derecha a izquierda, -1 de izquierda a derecha
let direction = 1;

let gameFrame = 0;
/*Se cambia la animacion cada 20 fotogramas*/
const staggerFrames = 20;
/*Sirve para poder alternar entre animaciones ya que es como un array la posicion del sprite, 0 es el primer sprite, 1 el siguiente, 
luego si tuviesemos más columnas con el frameY podriamos escoger la columna, pero cada spritesheet solo tiene 1 columna, por eso no existe*/
let frameX = 0;

//Posicion en el canvas al iniciarse
let ufoX = 0;
let ufoY = 10; 
//Velocidad del UFO
let ufoSpeed = 3;
let ufoDirection = 1;

// Movimiento de enemigos
function moveEnemies() {
    //la posicion en X es la posicion Inicial del sprite+ la velocidad de los enemigos * direction que es 1 izquierda a derecha
    enemyX += enemySpeed * direction;

    /*Esta confición hace que si la posición de más a la derecha es más grande que el ancho del canvas cambia la dirección de los enemigos*/
    if (enemyX + (enemyColumns * (spriteWidth + enemySpacing)) > CANVAS_WIDTH || enemyX < 0) {
        direction *= -1;
    }

    //la posicion en X es la posicion Inicial del sprite+ la velocidad de los enemigos * direction que es 1 izquierda a derecha
    ufoX += ufoSpeed * ufoDirection;
    /*Esta confición hace que si la suma del ancho del UFO más la posicion de la x del UFO es más grande que el canvas cambie la dirección*/
    if (ufoX + UFOWidth > CANVAS_WIDTH || ufoX < 0) {
        ufoDirection *= -1; // Cambia de dirección
    }

    // Control de frames de animación
    if (gameFrame % staggerFrames === 0) {
        frameX = (frameX + 1) % 2; // Alterna entre 0 y 1 para animación
    }
}


// Dibujar los enemigos en la cuadrícula con animación
function drawEnemyGrid() {
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyColumns; col++) {
            
            let x = enemyX + col * (spriteWidth + enemySpacing);
            let y = enemyY + row * (spriteHeight + enemySpacing);

            if (row === 0) {
                ctx.drawImage(squidImage, frameX * spriteWidth, 0, spriteWidth, spriteHeight, x, y, spriteWidth, spriteHeight);
            } else if (row === 1 || row === 2) {
                ctx.drawImage(crabImage, frameX * crabWidth, 0, crabWidth, crabHeight, x, y, crabWidth, crabHeight);
            } else if (row === 3 || row === 4) {
                ctx.drawImage(octopus, frameX * octopusWidth, 0, octopusWidth, octopusHeight, x, y, octopusWidth, octopusHeight);
            }
        }
    }
    // Dibujar UFO en su nueva posición
    ctx.drawImage(UFO, 0, 0, UFOWidth, UFOHeight, ufoX, ufoY, UFOWidth, UFOHeight);
}

// Variables para jugadores y disparos
var player1, player2;
var bulletsPlayer1 = [];
var bulletsPlayer2 = [];
var lastShotPlayer1 = 0;
var lastShotPlayer2 = 0;
const shootCooldown = 500;

// Inicializar el juego
function startGame() {
    myGameArea.start();
    player1 = new component(30, 30, "red", 10, canvas.height - 70, PlayerImage1);
    player2 = new component(30, 30, "blue", 100, canvas.height - 70, PlayerImage2);
}

// Área de juego y controles
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

// Definir los jugadores
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

// Crear balas
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

// Función principal de actualización
function updateGameArea() {
    myGameArea.clear();
    moveEnemies();
    drawEnemyGrid();
    gameFrame++;

    // Movimiento de los jugadores
    player1.newPos("ArrowLeft", "ArrowRight");
    player1.update();

    player2.newPos("a", "d");
    player2.update();

    // Movimiento y actualización de balas
    for (let i = 0; i < bulletsPlayer1.length; i++) {
        bulletsPlayer1[i].newPos();
        bulletsPlayer1[i].update();
    }

    for (let i = 0; i < bulletsPlayer2.length; i++) {
        bulletsPlayer2[i].newPos();
        bulletsPlayer2[i].update();
    }

    // Disparos de los jugadores
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


