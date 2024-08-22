document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameState === 0) {
            gameState = 1;
            fadeIn();
            frameAction();
            
            // 첫 번째 스페이스바 입력 후 메시지 숨김
            const instructionElement = document.querySelector('#instruction');
            if (instructionElement) {
                instructionElement.style.display = 'none';
            }
        } else if (gameState === 1 && firstSpacePressed) {
            // 첫 번째 스페이스바 이후부터 점프 가능
            dino.jump();
        }
        firstSpacePressed = true;
    }
});

let canvas = document.querySelector('#canvas');
let ctx = canvas.getContext('2d');

canvas.width = 900;  // 캔버스 너비 조정
canvas.height = 400; // 캔버스 높이 조정

let dinoImg = new Image();
dinoImg.src = 'resized_image_80x100.jfif'; // 공룡 이미지 크기도 증가

let firstSpacePressed = false; // 첫 번째 스페이스바 플래그

let dino = {
    x: 10,
    y: 200, // 공룡의 y 위치 수정
    width: 80,  // 공룡 너비 조정
    height: 100, // 공룡 높이 조정
    dy: 0, // 속도
    gravity: 1.5, // 중력
    jumpPower: -22, // 점프 힘
    grounded: true, // 공룡이 바닥에 있는지 여부
    draw() {
        ctx.drawImage(dinoImg, this.x, this.y, this.width, this.height);
    },
    jump() {
        if (this.grounded) {
            this.dy = this.jumpPower;
            this.grounded = false;
        }
    },
    update() {
        this.dy += this.gravity;
        this.y += this.dy;

        if (this.y > 200) {  // 공룡이 바닥에 착지하도록 위치 수정
            this.y = 200;
            this.dy = 0;
            this.grounded = true;
        }
    }
};

// 부모 클래스: Cactus
class Cactus {
    constructor(color) {
        this.width = 40 + getRandomInt(-5, 5);  // 선인장 크기
        this.height = 60 + getRandomInt(-5, 5); // 선인장 크기
        this.x = canvas.width;
        this.y = 300 - this.height;  // 선인장 위치 조정
        this.speed = 8; // 선인장 이동 속도 (모든 장애물 동일 속도)
        this.color = color; // 색상
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    update() {
        this.x -= this.speed;
    }
}

// 자식 클래스: RedCactus
class RedCactus extends Cactus {
    constructor() {
        super('red');
    }
}

// 자식 클래스: GreenCactus
class GreenCactus extends Cactus {
    constructor() {
        super('green');
    }
}

let timer = 0;
let cactusArr = [];
let gameState = 0;
let animation;
let life = 5;
let score = 0;
let nextCactusTime = getRandomInt(60, 180); // 랜덤한 시간에 선인장 생성
let speedIncreaseInterval = 300; // 5초 (300프레임)마다 속도 증가

function frameAction() {
    animation = requestAnimationFrame(frameAction);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    timer++;

    // 일정 시간마다 점수 증가
    if (timer % 10 === 0) { // 10프레임마다 점수 1점 증가
        score++;
        document.querySelector('#score').innerHTML = score;
    }

    // 5초(300프레임)마다 장애물 속도 증가
    if (timer % speedIncreaseInterval === 0) {
        cactusArr.forEach(cactus => cactus.speed += 1);
    }

    if (timer > nextCactusTime) {
        // 랜덤으로 빨간색 또는 초록색 선인장 생성
        let cactus;
        if (Math.random() < 0.5) {
            cactus = new RedCactus();
        } else {
            cactus = new GreenCactus();
        }
        cactusArr.push(cactus);
        nextCactusTime = timer + getRandomInt(50, 90); // 다음 선인장 생성 시간 설정
    }

    cactusArr.forEach((cactus, i, arr) => {
        cactus.update();
        cactus.draw();

        if (cactus.x + cactus.width < 0) {
            arr.splice(i, 1);
        }

        if (collisionDetection(dino, cactus) < 0) {
            arr.splice(i, 1);
        }
    });

    dino.update();
    dino.draw();

    drawLine();
}

function collisionDetection(dino, cactus) {
    let dinoRight = dino.x + dino.width;
    let dinoBottom = dino.y + dino.height;
    let cactusRight = cactus.x + cactus.width;
    let cactusBottom = cactus.y + cactus.height;

    if (dinoRight > cactus.x && dino.x < cactusRight &&
        dinoBottom > cactus.y && dino.y < cactusBottom) {
        // 충돌 시 실행되는 코드
        life--;
        document.querySelector('#life').innerHTML = life;
        if (life === 0) {
            fadeOut(); // 게임 오버 시 페이드아웃 효과
        }
        return -1;
    } else {
        return 1;
    }
}

function fadeIn() {
    let opacity = 0;
    const interval = setInterval(() => {
        if (opacity < 1) {
            opacity += 0.05;
            canvas.style.opacity = opacity;
            document.getElementById('game-header').style.opacity = opacity;
        } else {
            clearInterval(interval);
        }
    }, 50);
}

function fadeOut() {
    let opacity = 1;
    const interval = setInterval(() => {
        if (opacity > 0) {
            opacity -= 0.05;
            canvas.style.opacity = opacity;
            document.getElementById('game-header').style.opacity = opacity;
        } else {
            clearInterval(interval);
            // 점수 출력
            alert(`최종 점수: ${score}`);
            cancelAnimationFrame(animation);
            location.reload();
        }
    }, 50);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function drawLine() {
    ctx.beginPath();
    ctx.moveTo(0, 300);  // 바닥 위치를 300으로 조정하여 공룡이 선 위에 있도록 함
    ctx.lineTo(canvas.width, 300);
    ctx.stroke();
}
