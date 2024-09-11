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
    } else if (e.code === 'ArrowDown') {
        // 아래키를 눌렀을 때 숙이기
        dino.crouch();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown') {
        // 아래키에서 손을 뗄 때 숙이기 상태 해제
        dino.standUp();
    }
});

let canvas = document.querySelector('#canvas');
let ctx = canvas.getContext('2d');

canvas.width = 900;  // 캔버스 너비 조정
canvas.height = 400; // 캔버스 높이 조정

let dinoImg = new Image();
dinoImg.src = 'resized_image_80x100.jfif'; // 공룡 이미지 크기도 증가

let dinoCrouchImg = new Image();
dinoCrouchImg.src = 'rotated_uploaded_dinosaur.png'; // 숙일 때 공룡 이미지 변경

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
    isCrouching: false, // 숙이기 상태
    draw() {
        if (this.isCrouching) {
            ctx.drawImage(dinoCrouchImg, this.x, this.y, this.width, this.height / 2); // 숙일 때 이미지 크기 조정 (피격 범위만 축소)
        } else {
            ctx.drawImage(dinoImg, this.x, this.y, this.width, this.height);
        }
    },
    jump() {
        if (this.grounded) {
            this.dy = this.jumpPower;
            this.grounded = false;
        }
    },
    crouch() {
        this.isCrouching = true;
        this.height = 50; // 숙일 때 공룡의 피격 범위만 줄어듦
    },
    standUp() {
        this.isCrouching = false;
        this.height = 100; // 다시 일어설 때 공룡 높이 조정
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

let cactusSpeed = 8; // 전역 변수로 장애물 속도를 관리
let minCactusInterval = 70; // 최소 선인장 생성 간격
let maxCactusInterval = 90; // 최대 선인장 생성 간격
let lastObstacleWasFlying = false; // 마지막 장애물이 공중 장애물이었는지 추적

// 부모 클래스: Cactus
class Cactus {
    constructor(color) {
        this.width = 40 + getRandomInt(-5, 5);  // 선인장 크기
        this.height = 60 + getRandomInt(-5, 5); // 선인장 크기
        this.x = canvas.width;
        this.y = 300 - this.height;  // 선인장 위치 조정
        this.speed = cactusSpeed; // 전역 속도 값을 사용하여 생성된 모든 장애물이 동일한 속도를 갖게 함
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

// 공중 장애물 클래스
class FlyingObstacle {
    constructor() {
        this.width = 50;  // 공중 장애물 크기
        this.height = 40;
        this.x = canvas.width;
        this.y = 220;  // 공중에 위치하도록 y 값 조정
        this.speed = cactusSpeed; // 동일한 속도로 이동
    }
    draw() {
        ctx.fillStyle = 'blue';  // 공중 장애물 색상
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
let nextCactusTime = getRandomInt(minCactusInterval, maxCactusInterval); // 랜덤한 시간에 선인장 생성
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

    // 5초(300프레임)마다 장애물 속도 및 생성 간격 증가
    if (timer % speedIncreaseInterval === 0) {
        cactusSpeed += 1; // 장애물 속도를 증가시킴
        minCactusInterval = Math.max(30, minCactusInterval - 5); // 최소 생성 시간 감소, 최소 20
        maxCactusInterval = Math.max(40, maxCactusInterval - 10); // 최대 생성 시간 감소, 최소 40
    }

    if (timer > nextCactusTime) {
        // 랜덤으로 세 가지 장애물 중 하나 생성 (RedCactus, GreenCactus, FlyingObstacle)
        let obstacle;
        const randomChoice = Math.random();
        if (randomChoice < 0.33 && !lastObstacleWasFlying) {
            obstacle = new FlyingObstacle();
            lastObstacleWasFlying = true;  // 공중 장애물이 나오면 플래그를 true로 설정
        } else if (randomChoice < 0.66 || lastObstacleWasFlying) {
            obstacle = new RedCactus();
            lastObstacleWasFlying = false;  // 하단 장애물이 나오면 공중 장애물 플래그를 false로 설정
        } else {
            obstacle = new GreenCactus();
            lastObstacleWasFlying = false;  // 하단 장애물이 나오면 공중 장애물 플래그를 false로 설정
        }

        cactusArr.push(obstacle);
        nextCactusTime = timer + getRandomInt(minCactusInterval, maxCactusInterval); // 다음 장애물 생성 시간 설정
    }

    cactusArr.forEach((obstacle, i, arr) => {
        obstacle.update();
        obstacle.draw();

        if (obstacle.x + obstacle.width < 0) {
            arr.splice(i, 1);
        }

        // 공룡이 서있을 때만 공중 장애물과 충돌 판정
        if (obstacle instanceof FlyingObstacle) {
            if (!dino.isCrouching && collisionDetection(dino, obstacle) < 0) {
                arr.splice(i, 1);
            }
        } else {
            if (collisionDetection(dino, obstacle) < 0) {
                arr.splice(i, 1);
            }
        }
    });

    dino.update();
    dino.draw();

    drawLine();
}

function collisionDetection(dino, obstacle) {
    let dinoRight = dino.x + dino.width;
    let dinoBottom = dino.y + dino.height;
    let obstacleRight = obstacle.x + obstacle.width;
    let obstacleBottom = obstacle.y + obstacle.height;

    if (dinoRight > obstacle.x && dino.x < obstacleRight &&
        dinoBottom > obstacle.y && dino.y < obstacleBottom) {
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
