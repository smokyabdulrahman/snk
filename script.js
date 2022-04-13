const CONSTS = {
    SNAKE_PIXEL_WIDTH_HEIGHT: 10,
    NUM_OF_PIXELS_WIDTH: 50,
    NUM_OF_PIXELS_HEIGHT: 40,
    FPS: 15,
    APPLE_COLOR: '#999',
    SNAKE_COLOR: '#333',
}

const GAME_STATES = {
    PLAYING: 'PLAYING',
    ENDED: 'ENDED',
}

const linkedListLoop = (list, callback) => {
    let i = list;
    while (i.next != null) {
        callback(i);

        i = i.next;
    }
}

class SnakePart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.next = null;
    }
}

class Snake {
    ROTATIONS = [
        {
            id: 0,
            rotateX: 1,
            rotateY: 0
        },
        {
            id: 1,
            rotateX: 0,
            rotateY: 1
        },
        {
            id: 2,
            rotateX: -1,
            rotateY: 0
        },
        {
            id: 3,
            rotateX: 0,
            rotateY: -1
        }
    ];

    constructor() {
        this.length = 1;
        this.tail = this.head = new SnakePart(0, 0);
        this.rot = this.ROTATIONS[0];
    }

    addPart() {
        this.head.next = new SnakePart(this.head.x + this.rot.rotateX * CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT,
            this.head.y + this.rot.rotateY * CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT);
        this.head = this.head.next;
    }

    nextMove() {
        if (this.tail.next) {
            this.tail = this.tail.next;
        }

        this.addPart();
    }

    goRight() {
        this.rot = this.ROTATIONS[(this.rot.id + 1) % this.ROTATIONS.length];
    }

    goLeft() {
        this.rot = this.ROTATIONS[this.rot.id - 1 < 0 ? this.ROTATIONS.length - this.rot.id - 1 : this.rot.id - 1 % this.ROTATIONS.length];
    }
}

class Apple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Game {
    constructor() {
        this.snake = new Snake();
        this.apple = new Apple();
        this.state = GAME_STATES.PLAYING
    }

    spawnSnake() {
        this.snake = new Snake();
    }

    spawnApple() {
        this.apple = new Apple();

        const x = Math.floor(Math.random() * (CONSTS.NUM_OF_PIXELS_WIDTH - 1)) * CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT;
        const y = Math.floor(Math.random() * (CONSTS.NUM_OF_PIXELS_HEIGHT - 1)) * CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT;
        let shouldAssign = true;
        linkedListLoop(this.snake.tail, (part) => {
            if (part.x === x && part.y === y) {
                shouldAssign = false;
                this.spawnApple();
            }
        });

        if (!shouldAssign) {
            console.log('Hmmmm...');
        }
        if (shouldAssign) {
            this.apple.x = x;
            this.apple.y = y;
        }
    }

    start() {
        this.state = GAME_STATES.PLAYING;
        this.spawnSnake();
        this.spawnApple();

        document.addEventListener('keydown', this.handleController);
    }

    handleController = (event) => {
        event.preventDefault();
        if (event.key === 'd') {
            this.snake.goRight();
        }

        if (event.key === 'a') {
            this.snake.goLeft();
        }
    }

    endGame(message) {
        this.state = GAME_STATES.ENDED;
        document.removeEventListener('keydown', this.handleController);
        if (confirm(
            message +
            '\n' +
            '\n' +
            'Do you want to play again?')
        ) {
            this.start();
        }
    }

    nextState() {
        this.snake.nextMove();
    }

    checkStatus() {
        const head = this.snake.head;
        // check head hits boarders
        if (head.x < 0 || head.x > CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT * CONSTS.NUM_OF_PIXELS_WIDTH) {
            this.endGame('X BREACHED!');
        }
        if (head.y < 0 || head.y > CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT * CONSTS.NUM_OF_PIXELS_HEIGHT) {
            this.endGame('Y BREACHED!');
        }
        // check head hits body
        linkedListLoop(this.snake.tail, (part) => {
            if (part === this.snake.head) console.log("DOESN'T COUNT!");
            else if (part.x === this.snake.head.x && part.y === this.snake.head.y) this.endGame("BOOM");
        });
        // check head hits apple
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.snake.addPart();
            this.spawnApple();
        }
    };
}

const canvas = document.getElementById("canvas");
canvas.width = CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT * CONSTS.NUM_OF_PIXELS_WIDTH;
canvas.height = CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT * CONSTS.NUM_OF_PIXELS_HEIGHT;
canvas.style.width = CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT * CONSTS.NUM_OF_PIXELS_WIDTH + 'px';
canvas.style.height = CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT * CONSTS.NUM_OF_PIXELS_HEIGHT + 'px';

const ctx = canvas.getContext("2d");
const game = new Game();
game.start();

window.setInterval(() => {
    game.nextState();
    if (game.state !== 'PLAYING') return;

    draw();

    game.checkStatus();
}, 1000 / CONSTS.FPS);

const draw = () => {
    const { snake, apple } = game;
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw apple
    ctx.fillStyle = CONSTS.APPLE_COLOR;
    ctx.fillRect(apple.x, apple.y, CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT, CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT);

    // draw snake
    let iteraitor = snake.tail;
    while (iteraitor.next != null) {
        ctx.fillStyle = CONSTS.SNAKE_COLOR;
        ctx.fillRect(iteraitor.x, iteraitor.y, CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT, CONSTS.SNAKE_PIXEL_WIDTH_HEIGHT);

        iteraitor = iteraitor.next;
    }
};