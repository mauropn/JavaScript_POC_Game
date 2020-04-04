var canvas, canvasContext;

//Onde eu quero que a minha bolinha começe?
var ballX = 15; 
var ballY = 15; 

const BRICK_W = 80;
const BRICK_H = 20;
const BRICK_COLUMNS = 10;
const BRICK_ROWS = 14;
const BRICK_GAP = 2;

var brickGrid = new Array(BRICK_COLUMNS * BRICK_ROWS);
var bricksLeft = 0;
//posição do mouse, no eixo X e no eixo Y..
var mouseX = 0; 
var mouseY = 0;

var ballSpeedX = 5;
var ballSpeedY = 7;
        
const PADDLE_WIDTH = 100;
const PADDLE_THICKNESS = 10;
const PADDLE_DIST_FROM_EDGE = 60; //levanto a raquete da borda....
var paddleActualPosition = 400; //Começo na posição 400.... 

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');

    brickReset();
    ballReset();
    canvas.addEventListener('mousemove', updateMousePosition)

    var framesPerSecond = 60; //Velocidade da bolinha...
    this.setInterval(updateAll, 1000/framesPerSecond);
}

function drawBricks(){
    for (let eachRow = 0; eachRow < BRICK_ROWS; eachRow++) {
        for (let eachCol = 0; eachCol < BRICK_COLUMNS; eachCol++) {

            //var arrayIndex = BRICK_COLUMNS * eachRow + eachCol;

            var arrayIndex = rowColToArrayIndex(eachCol, eachRow);

            if (brickGrid[arrayIndex])
                callRect(BRICK_W * eachCol, BRICK_H * eachRow, BRICK_W - BRICK_GAP , BRICK_H - BRICK_GAP, 'blue');
        }
    }  
} 

function brickReset(){
    bricksLeft = 0;
    var i;
    for (i = 0; i < 3*BRICK_COLUMNS; i++) {
        brickGrid[i] = false;
    }

    for (;i < BRICK_COLUMNS * BRICK_ROWS; i++) {
        brickGrid[i] = true;
        bricksLeft++;
    }

    //brickGrid[15] = false;
}

function ballReset(){
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
}

function updateMousePosition(evt){
    //https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    var rectLimites = canvas.getBoundingClientRect();

    //https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement
    var root = document.documentElement;
    
    mouseX = evt.clientX - rectLimites.left - root.scrollLeft;
    mouseY = evt.clientY - rectLimites.top - root.scrollTop;

    paddleActualPosition = mouseX - PADDLE_WIDTH / 2 ;


    //  PARA TESTAR: Movo o mouse para reposicionar a bolinha
    //  ballX = mouseX;
    //  ballY = mouseY;
    //  ballSpeedX = 4;
    //  ballSpeedY = -4;

}

function updateAll(){
    moveAll();
    drawAll();
}

function ballMove(){
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if(ballX < 0 && ballSpeedX < 0.0){
        ballSpeedX *= -1;
    }

    if(ballX > canvas.width && ballSpeedX > 0.0){
        ballSpeedX *= -1;
    }

    if(ballY < 0  && ballSpeedY < 0.0){
        ballSpeedY *= -1;
    }

    if(ballY > canvas.height){
        brickReset();
        ballReset();
    }
}


function isBrickAtColRow(col, row){
    if(col >= 0             && 
        col < BRICK_COLUMNS &&
        row >= 0            && 
        row < BRICK_ROWS){
        var brickIndexUnderCoord  = rowColToArrayIndex(col, row);
        return brickGrid[brickIndexUnderCoord];
    }else{
        return false;
    }
}


function ballBrickHandling(){
    var ballBrickCol = Math.floor(ballX / BRICK_W);
	var ballBrickRow = Math.floor(ballY / BRICK_H);

    var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);
    //colorText("(" + mouseBrickCol +"," + mouseBrickRow + ")", mouseX, mouseY, 'yellow');
    //colorText("(" + mouseBrickCol +"," + mouseBrickRow + ") : " + brickIndexUnderMouse , mouseX, mouseY, 'yellow');


    if (ballBrickCol >= 0 && 
        ballBrickCol < BRICK_COLUMNS &&
        ballBrickRow >= 0 && 
        ballBrickRow < BRICK_ROWS
        ){

            if(isBrickAtColRow(ballBrickCol, ballBrickRow)){

                var prevPositionBallX = ballX - ballSpeedX;
                var prevPositionBallY = ballY - ballSpeedY;
                
                var prevBrickColumn = Math.floor(prevPositionBallX / BRICK_W);
                var prevBrickRow    = Math.floor(prevPositionBallY / BRICK_W);

                var ifBothTestFailed = true;

                if(prevBrickColumn != ballBrickCol){
                    if(!isBrickAtColRow(prevBrickColumn, ballBrickRow)){
                        ifBothTestFailed = false;
                        ballSpeedX *= -1;
                    }
                }

                if(prevBrickRow != ballBrickRow){
                    if (!isBrickAtColRow(ballBrickCol, prevBrickRow)){
                        ifBothTestFailed = false;
                        ballSpeedY *= -1;
                    }
                        
                }
                    
                if(ifBothTestFailed){
                    ballSpeedX *= -1;
                    ballSpeedY *= -1; 
                }

                brickGrid[brickIndexUnderBall] = false;
                bricksLeft--;
                //console.log(bricksLeft + ' - ' + BRICK_ROWS * BRICK_COLUMNS);

                if (bricksLeft == 0){
                    brickReset();
                    ballReset();
                }
            }
    }
}

function ballPaddleHandling(){
    var paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
    var paddleBottonEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;

    var paddleLeftEdgeX = paddleActualPosition;
    var paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH;

 
    if(ballY > paddleTopEdgeY && 
        ballY < paddleBottonEdgeY &&
        ballX > paddleLeftEdgeX && 
        ballX < paddleRightEdgeX)
        {
            var centerOfThePaddleX = paddleActualPosition + PADDLE_WIDTH / 2;
            var ballDistanceFromPaddleCenterX = ballX - centerOfThePaddleX;

            ballSpeedX = ballDistanceFromPaddleCenterX * 0.35;
            ballSpeedY *= -1;
        }
}

function moveAll(){
    
    ballMove();
    ballBrickHandling();
    ballPaddleHandling();
}

function rowColToArrayIndex(col, row){
    return col + BRICK_COLUMNS * row;
}

function drawAll(){
    callRect(0, 0, canvas.width, canvas.height, 'black');

    colorCircle(ballX, ballY, 10, 'white' );
    
    callRect(paddleActualPosition, canvas.height - PADDLE_DIST_FROM_EDGE , PADDLE_WIDTH, PADDLE_THICKNESS);
    
    drawBricks();
    
    //console.log(mouseX + " = " + BRICK_W);

    
}

function callRect(topLeftX, topLeftY, boxWidth, boxHeight, color){
     //Toda vez que eu for desenhar a bola em uma nova posição, eu apago a posição antiga, preenchendo ela com o preto. /
     canvasContext.fillStyle=color
     canvasContext.fillRect(topLeftX,topLeftY, boxWidth,boxHeight);
}

function colorCircle(centerX, centerY, radius, fillColor){
    canvasContext.fillStyle=fillColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI*2, true);
    canvasContext.fill();
}

function colorText(texto, textX, textY, fillColor){
    //console.log("bateu");
    canvasContext.fillStyle= fillColor;
    canvasContext.fillText(texto, textX + 15, textY + 25);
}