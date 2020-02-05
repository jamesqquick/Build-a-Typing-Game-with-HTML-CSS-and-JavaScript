const screens = [...document.querySelectorAll('.screen')]; // 0 - home, 1 - game, 2 - end

//Home screen
const startBtn = document.getElementById('startBtn');
const startScreen = document.getElementById('startScreen');
//Game Screen
const titleText = document.getElementById('titleText');
const timerText = document.getElementById('timer');
const randomCharacterText = document.getElementById('randomCharacter');
const scoreText = document.getElementById('scoreText');

//game state
let isPlaying = false;
let currentCharacter = '';
let score = 0;
let seconds = 10;
let ms = 0;

//end screen
const endScoreText = document.getElementById('endScoreText');
const playAgainBtn = document.getElementById('playAgainBtn');
const saveScoreForm = document.getElementById('saveScoreForm');
const username = document.getElementById('username');
const highScores = document.getElementById('highScores');
//Firebase
var firebaseConfig = {
    apiKey: 'AIzaSyAm5n0b88hjyRiUBYQYXj2pku5f_W9jvhg',
    authDomain: 'react-trivia-app-62db7.firebaseapp.com',
    databaseURL: 'https://react-trivia-app-62db7.firebaseio.com',
    projectId: 'react-trivia-app-62db7',
    storageBucket: 'react-trivia-app-62db7.appspot.com',
    messagingSenderId: '561250386298',
    appId: '1:561250386298:web:d619fd56f14550b5b3d6c3',
    measurementId: 'G-TLJJE0ND4V'
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const dbRef = firebase.database().ref();
const scoresRef = dbRef.child('typingScores');

const saveScore = (name, score) => {
    const scoreRecord = { name, score };
    scoresRef.push(scoreRecord, () => {
        console.log('score added');
        changeScreen(0);
    });
};

scoresRef.on('value', (snapshot) => {
    // if (!isScreenShowing(2)) return;

    console.log('showing scores');
    const val = snapshot.val();
    let highScoresString = `<ul>`;
    for (let key in val) {
        const record = val[key];
        console.log(record.name, record.score);
        highScoresString += `<li>${record.name} - ${record.score}</li>`;
    }
    highScoresString += '</ul>';
    console.log(highScoresString);
    highScores.innerHTML = highScoresString;
});

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
    seconds = 30;
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
    if (isScreenShowing(0) && e.key === 's') {
        return startGame();
    }
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
        if (screenIndex === index) {
            screen.classList.remove('hidden');
        } else {
            screen.classList.add('hidden');
        }
    });
};

const isScreenShowing = (screenIndex) => {
    const screen = screens[screenIndex];
    return !screen.classList.contains('hidden');
};

saveScoreForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!username.value) return;

    saveScore(username.value, score);
});
