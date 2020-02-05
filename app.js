const screens = [...document.querySelectorAll('.screen')]; // 0 - home, 1 - game, 2 - end

//Home screen
const startBtn = document.getElementById('startBtn');

//Game Screen
const titleText = document.getElementById('titleText');
const timerText = document.getElementById('timer');
const randomCharacterText = document.getElementById('randomCharacter');
const scoreText = document.getElementById('scoreText');
let isPlaying = false;

//end screen
const endScoreText = document.getElementById('endScoreText');
const playAgainBtn = document.getElementById('playAgainBtn');

//game state
let currentCharacter = '';
let score = 0;
let seconds = 10;
let ms = 0;

const getRandomCharacter = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    const randomInt = Math.floor(Math.random() * 36);
    currentCharacter = characters[randomInt];
    randomCharacterText.innerText = currentCharacter;
};

playAgainBtn.addEventListener('click', () => {
    startGame();
});

const startGame = () => {
    resetGameState();
    getRandomCharacter();

    const timerInterval = setInterval(() => {
        if (ms <= 0) {
            seconds--;
            ms = 59;
        } else {
            ms--;
        }

        if (seconds <= 0 && ms <= 0) {
            clearInterval(timerInterval);
            endScoreText.innerText = `Score: ${score}`;
            changeScreen(2);
        }
        displayFormattedTimer(seconds, ms);
    }, 16.67);
    changeScreen(1);
};

const resetGameState = () => {
    score = 0;
    seconds = 3;
    ms = 0;
};

startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none';
    startGame();
    randomCharacterText.style.display = 'block';
    scoreText.style.display = 'block';
});

const displayFormattedTimer = (seconds, ms) => {
    const formattedSeconds = ('0' + seconds).slice(-2);
    const formattedMs = ('0' + ms).slice(-2);

    timerText.innerText = `${formattedSeconds}:${formattedMs}`;
};
document.addEventListener('keyup', (e) => {
    if (!isPlaying) {
        return;
    }
    if (e.key == currentCharacter) {
        score++;
    } else {
        if (score >= 1) {
            score--;
        }
    }
    scoreText.innerText = `Score: ${score}`;
    getRandomCharacter();
});

const changeScreen = (screenIndex) => {
    isPlaying = screenIndex === 1 ? true : false;
    console.log(isPlaying);
    screens.forEach((screen, index) => {
        const display = screenIndex === index ? 'block' : 'none';
        screen.style.display = display;
    });
};
