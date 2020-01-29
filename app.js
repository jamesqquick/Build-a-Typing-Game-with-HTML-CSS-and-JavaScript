const timerText = document.getElementById('timer');
const randomCharacterText = document.getElementById('randomCharacter');
randomCharacterText.style.display = 'none';
const scoreText = document.getElementById('scoreText');
scoreText.style.display = 'none';
const startBtn = document.getElementById('startBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const titleText = document.getElementById('titleText');
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
    score = 0;
    seconds = 3;
    ms = 0;
    startGame();
});

const startGame = () => {
    const timerInterval = setInterval(() => {
        if (ms <= 0) {
            seconds--;
            ms = 59;
        } else {
            ms--;
        }

        if (seconds <= 0 && ms <= 0) {
            console.log('Game over!');
            clearInterval(timerInterval);
            startBtn.style.display = 'block';
            //titleText.innerText = 'Good stuff!! Play again?';
            playAgainBtn.style.display = 'block';
            startBtn.style.display = 'none';
            randomCharacterText.style.display = 'none';
            titleText.style.display = 'none';
            startBtn.innerText = 'Play again!';
        }
        displayFormattedTimer(seconds, ms);
    }, 16.67);
};

startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none';
    titleText.style.display = 'none';
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
    console.log(e.key);
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

getRandomCharacter();

// setInterval(getRandomCharacter, 1000);
