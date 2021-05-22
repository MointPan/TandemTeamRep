var Platforms = [];

Platforms[0] = {
    x: 0,
    y: 620,
    width: 1280,
    height: 100,
}

Platforms[1] = {
    x: 175,
    y: 520,
    width: 100,
    height: 10,
}

var GAME = {
    width: 1280,
    height: 720,
    fps: 1000 / 60,
    canvasContext: null,
    background: new Image(),
    steps: 0,
    jumpHeight: 0,
}

var BULLET = {
    x: 0,
    y: 0,
    yDirection: 0,
    xDirection: 0,
    width: 2,
    height: 2,
    show: 0,
}

var PLAYER = { //Пока что - одиночный объект "игрок". В скором времени - экземпляр класса "Персонаж"
    x: 100,
    y: 200,
    width: 46,
    height: 64, //С первого по четвёртый параметры - начальная позиция, размеры
    xDirection: 0,
    yDirection: 0,
    moveState: 0,
    gravity: "Fall",
    animation: null, //С пятого по девятый - векторы направления движения, флаги анимации, коллайдера, итератор анимации перемещения
    speed: 1,
    fireRate: 1,
    fireDamage: 1,
    fireBurst: 1,
    HP: 2, //С десятого по четырнадцатый - характеристики игрока - скорость перемещения, скорость стрельбы, урон, количесвто снарядов за выстрел, здоровье 
    model: new Image(),
}

var BONUS = { //Бонус улучшает характеристики игрока
    x: 210,
    y: 490,
    width: 19,
    height: 18, //С первого по четвёртый параметры - начальная позиция, размеры
    show: true, //Указывает, нужно ли отображать бонус на игровом поле. Далее по логике в случае "подбора" игроком исчезает
    type: 2, //Тип бонуса. От типа бонуса зависит, какие характеристики он улучшает
    model: new Image()
}

function init() {
    GAME.background.src = "img/bg.png";
    BONUS.model.src = `img/sprites/bonus${BONUS.type}.png`;
    PLAYER.model.src = `img/sprites/player/armor${PLAYER.HP - 1}/playerMove${PLAYER.moveState}.png`;
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
    GAME.canvasContext.fillStyle = 'grey';
    for (let i = 0; i <= 1; i++) {
        GAME.canvasContext.fillRect(Platforms[i].x, Platforms[i].y, Platforms[i].width, Platforms[i].height);   
    }
    GAME.canvasContext.drawImage(PLAYER.model, PLAYER.x, PLAYER.y, PLAYER.width, PLAYER.height);
    GAME.canvasContext.fillStyle = 'orange';
    GAME.canvasContext.fillRect(BULLET.x, BULLET.y, BULLET.width, BULLET.height);
    if (BONUS.show){
        GAME.canvasContext.drawImage(BONUS.model, BONUS.x, BONUS.y, BONUS.width, BONUS.height);
    }
}

function update() {
    var collisionWithBonus = _playerhascollidedbonus(BONUS, PLAYER);
    if (PLAYER.gravity == "Jump"){
        PLAYER.yDirection =- 2;
        PLAYER.animation = setInterval(jump(), GAME.fps);
        PLAYER.animation = null;
    } else{
        for (let i = 0; i <= 1; i++){
            PLAYER.gravity = _playerGrounded(PLAYER, i);
            if (PLAYER.gravity == "Grounded"){
                break;
            }
        }
        if (PLAYER.gravity == "Fall"){
            PLAYER.yDirection =+ 2;
        } else if (PLAYER.gravity == "Grounded"){
            PLAYER.yDirection = 0;
        }
    }
    if (PLAYER.x + PLAYER.width > GAME.width){
        alert('Location secure. Congratulations, level is passed!');
    }   
    if (collisionWithBonus){
        BONUS.show = false;
        _applyBonus(BONUS, PLAYER);
        collisionWithBonus = false;
    }
    GAME.steps += 1;
    PLAYER.x += PLAYER.xDirection;
    BULLET.x += BULLET.xDirection;
    PLAYER.y += PLAYER.yDirection;
    if (GAME.steps > 20){ //разбивает перемещение на маленькие отрезки, чтобы сделать его плавным
        PLAYER.xDirection = 0;
        GAME.steps = 0;
    }
}

function _initCanvas(canvas) {
    canvas.width = GAME.width;
    canvas.height = GAME.height;
    GAME.canvasContext = canvas.getContext("2d");
}

function _initEventsListeners() {
    document.addEventListener("keydown", _onDocumentControlKeys);
}

function _playerGrounded(p, num){ //Определяет, находится ли персонаж на платформе или висит в воздухе
    var xCollision = (p.x + p.width >= Platforms[num].x) && (p.x < Platforms[num].x + Platforms[num].width);
    var yCollision = p.y + p.height  >= Platforms[num].y;
    var result = null;
    if (xCollision && yCollision){
        result = "Grounded";
    } else if(p.gravity !== "Jump"){
        result = "Fall";
    }
    return result; 
}

function _playerhascollidedbonus(bonus, p){ //Подразумевается, что ни один объект не сможет "подбирать" бонусы, кроме игрока. Исчезновение бонусов по любым причинам, кроме соприкоснования со спрайтом игрока - некорректное поведение.
    var xCollision = (p.x + p.width >= bonus.x) && (p.x <= bonus.x + bonus.width );
    var yCollision = (p.y + p.height >= bonus.y) && (p.y <= bonus.y + bonus. height);
    return xCollision && yCollision;        
}

function _onDocumentControlKeys(event) {
    if (event.key == "ArrowRight") {
        PLAYER.xDirection =+ PLAYER.speed;
    }
    if (event.key == "ArrowLeft"){
        PLAYER.xDirection =- PLAYER.speed;
    }
    if (((event.key == "ArrowRight") || (event.key == "ArrowLeft")) && (!PLAYER.animation && PLAYER.gravity == "Grounded")) {
        PLAYER.animation = setInterval(changeMovementSprite, 1000/8);
    }
    if (event.key == "Control"){
        BULLET.x = PLAYER.x + (PLAYER.width / 2 + 16);
        BULLET.y = PLAYER.y + (PLAYER.height / 2 - 12);
        BULLET.xDirection =+ 4;
        BULLET.show = true;
    }
    if (event.key == "Shift"){
        if (PLAYER.gravity == "Grounded"){
        PLAYER.gravity = "Jump";
        }
    }
}

function jump(){
    GAME.jumpHeight -= PLAYER.yDirection;
    if (GAME.jumpHeight >= 120){    
        GAME.jumpHeight = 0;
        clearInterval(PLAYER.animation);
        PLAYER.gravity = "Fall"; 
    }
}

function changeMovementSprite(){//Проигрывает анимацию ходьбы путём быстрой смены спрайтов определённое число раз за секунду
    PLAYER.moveState += 1;
    if (PLAYER.moveState > 3) {
        PLAYER.moveState = 1;
        clearInterval(PLAYER.animation);
        PLAYER.animation = null;
    }
    PLAYER.model.src = `img/sprites/player/armor${PLAYER.HP - 1}/playerMoveNShoot${PLAYER.moveState}.png`
}

function _applyBonus(bonus, p){ //Если бонус может "поднимать" только игрок, то и его эффект должен применяться исключительно на игроке. Остальные случаи - некорректное поведение. 
    switch(bonus.type){
        case 1:
            p.HP = 2;
            break;
        case 2:
            p.HP = 3;
            break;
    }
}