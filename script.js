const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

let playerScore = 0;
let aiScore = 0;
let running = false;

const FIXED_UPDATE = 1000 / 120;

let previousTime = 0;
let accumulator = 0;

const paddleWidth = 12;
const paddleHeight = 90;

const player = {
    x: 25,
    y: H / 2 - paddleHeight / 2,
    speed: 7
};

const ai = {
    x: W - 37,
    y: H / 2 - paddleHeight / 2,
    speed: 5
};

const ball = {
    x: W / 2,
    y: H / 2,
    radius: 9,
    vx: 5,
    vy: 3
};

const keys = {};

document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

function resetBall(direction) {
    ball.x = W / 2;
    ball.y = H / 2;

    ball.vx = 5 * direction;
    ball.vy = (Math.random() - 0.5) * 7;
}

function startGame() {
    playerScore = 0;
    aiScore = 0;

    document.getElementById("playerScore").textContent = 0;
    document.getElementById("aiScore").textContent = 0;

    player.y = H / 2 - paddleHeight / 2;
    ai.y = H / 2 - paddleHeight / 2;

    resetBall(Math.random() > 0.5 ? 1 : -1);

    previousTime = 0;
    accumulator = 0;

    running = true;

    requestAnimationFrame(gameLoop);
}


function gameLoop(currentTime) {
    if (!running) return;

    if (previousTime === 0) {
        previousTime = currentTime;
    }

    let frameTime = currentTime - previousTime;
    previousTime = currentTime;

    frameTime = Math.min(frameTime, 250);

    accumulator += frameTime;

    while (accumulator >= FIXED_UPDATE) {
        FixedUpdate();
        accumulator -= FIXED_UPDATE;
    }

    Render();

    requestAnimationFrame(gameLoop);
}

function FixedUpdate() {
    PlayerMovement();
    AIMovement();
    BallMovement();
    CollisionDetection();
    ScoreDetection();
}


function PlayerMovement() {
    if (keys["w"] || keys["arrowup"]) {
        player.y -= player.speed;
    }

    if (keys["s"] || keys["arrowdown"]) {
        player.y += player.speed;
    }

    player.y = Math.max(
        0,
        Math.min(H - paddleHeight, player.y)
    );
}


function AIMovement() {
    const center = ai.y + paddleHeight / 2;

    if (center < ball.y - 10) {
        ai.y += ai.speed;
    } else if (center > ball.y + 10) {
        ai.y -= ai.speed;
    }

    ai.y = Math.max(
        0,
        Math.min(H - paddleHeight, ai.y)
    );
}

function BallMovement() {
    ball.x += ball.vx;
    ball.y += ball.vy;
}


function CollisionDetection() {

    if (
        ball.y - ball.radius <= 0 ||
        ball.y + ball.radius >= H
    ) {
        ball.vy *= -1;
    }

    if (
        ball.vx < 0 &&
        ball.x - ball.radius <= player.x + paddleWidth &&
        ball.x + ball.radius >= player.x &&
        ball.y >= player.y &&
        ball.y <= player.y + paddleHeight
    ) {
        ball.vx *= -1.05;

        ball.vy +=
            (ball.y - (player.y + paddleHeight / 2)) * 0.12;
    }

    if (
        ball.vx > 0 &&
        ball.x + ball.radius >= ai.x &&
        ball.x - ball.radius <= ai.x + paddleWidth &&
        ball.y >= ai.y &&
        ball.y <= ai.y + paddleHeight
    ) {
        ball.vx *= -1.05;

        ball.vy +=
            (ball.y - (ai.y + paddleHeight / 2)) * 0.12;
    }

    ball.vx = Math.max(-12, Math.min(12, ball.vx));
    ball.vy = Math.max(-9, Math.min(9, ball.vy));
}


function ScoreDetection() {

    if (ball.x < 0) {
        aiScore++;

        document.getElementById("aiScore").textContent = aiScore;

        resetBall(1);
    }

    if (ball.x > W) {
        playerScore++;

        document.getElementById("playerScore").textContent = playerScore;

        resetBall(-1);
    }
}


function Render() {
    ctx.clearRect(0, 0, W, H);

    DrawCenterLine();

    DrawRect(
        player.x,
        player.y,
        paddleWidth,
        paddleHeight,
        "#00e5a0"
    );

    DrawRect(
        ai.x,
        ai.y,
        paddleWidth,
        paddleHeight,
        "#ff4d6d"
    );

    DrawBall();
}

function DrawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function DrawBall() {
    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";
    ctx.fill();
}

function DrawCenterLine() {
    ctx.setLineDash([10, 15]);

    ctx.strokeStyle = "#444450";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();

    ctx.setLineDash([]);
}

Render();