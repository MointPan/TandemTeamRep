var GAME = {
    width: 500,
    height: 500,
    fps: 1000 / 60,
    canvasContext: null,
    background: new Image(),
    animation: null,
    movement: null,
    steps: 0
}

var PLAYER = {
    x: 100,
    y: 200,
    xDirection: 0,
    yxDirection: 0,
    moveState: 0,
    speed: 1,
    width: 31,
    height: 43,
    fireRate: 1,
    fireStrength: 1,
    fireBurst: 1,
    HP: 3,
    model: new Image()
}

function init() {
    GAME.background.src = "img/bg.png"
    PLAYER.model.src = `img/sprites/player/armor${PLAYER.HP - 1}/playerMoveNShoot${PLAYER.moveState}.png`;
    var canvas = document.getElementById("canvas");
    _initCanvas(canvas);
    _initEventsListeners(canvas);

    GAME.background.onload = function(){
        setInterval(play, GAME.fps); 
    }    
}

function play() {
    draw();
    update();
}

function draw() {
    GAME.canvasContext.clearRect(0, 0, GAME.width, GAME.height);
    GAME.canvasContext.drawImage(GAME.background, 0, 0, GAME.width, GAME.height);  //Рисуем фон
    GAME.canvasContext.drawImage(PLAYER.model, PLAYER.x, PLAYER.y, PLAYER.width, PLAYER.height);
}

function update() {
    GAME.steps += 1;
    PLAYER.x += PLAYER.xDirection;
    if (GAME.steps > 20){
        PLAYER.xDirection = 0;
        GAME.steps = 0;
    }
}

function _initCanvas(canvas) {
    canvas.width = GAME.width;
    canvas.height = GAME.height;
    GAME.canvasContext = canvas.getContext("2d");
}

function _initEventsListeners(canvas) {
    document.addEventListener("keydown", _onDocumentMovementKeys);
}

function _onDocumentMovementKeys(event) {
    if (event.key == "ArrowRight") {
        PLAYER.xDirection =+ PLAYER.speed;
        if (!GAME.animation) {
            GAME.animation = setInterval(changeMovementSprite, 1000/8);
        }
    }
}

function changeMovementSprite(){
    PLAYER.moveState += 1;
    if (PLAYER.moveState > 3) {
        PLAYER.moveState = 1;
        clearInterval(GAME.animation);
        GAME.animation = null;
    }
    PLAYER.model.src = `img/sprites/player/armor${PLAYER.HP - 1}/playerMoveNShoot${PLAYER.moveState}.png`
}