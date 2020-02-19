import 'babel-polyfill';
import { scoresRef, saveScore } from './firebase/firebase';
import { login, logout } from './auth/utils';
import { changeScreen, isScreenShowing } from './utils/navigation';
//Home screen
const startScreen = document.getElementById('startScreen');
const startGameBtn = document.getElementById('startGameBtn');
startGameBtn.addEventListener('click', () => {
    console.log('clicked start game');
    startGame();
});

const highScoresBtn = document.getElementById('highScoresBtn');
highScoresBtn.addEventListener('click', () => {
    changeScreen(3);
});

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
const saveScoreForm = document.getElementById('saveScoreForm');
const username = document.getElementById('username');
const highScores = document.getElementById('highScores');

let highScoresArray = [];

//high scores screen
const scoresToHomeBtn = document.getElementById('scoresToHomeBtn');
scoresToHomeBtn.addEventListener('click', () => {
    console.log('going home');
    changeScreen(0);
});

//Auth Stuff!
let auth0 = null;

window.onload = async () => {
    auth0 = await createAuth0Client({
        domain: 'jqq-intervie-test.auth0.com',
        client_id: 'nXHTUKU8xb0bie5NPgj8kQI8nt5mk3Wi'
    });

    updateUI();

    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
        // show the gated content
        return;
    }

    // NEW - check for the code and state parameters
    const query = window.location.search;
    if (query.includes('code=') && query.includes('state=')) {
        // Process the login state
        await auth0.handleRedirectCallback();

        updateUI();

        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, '/');
    }
};

const updateUI = async () => {
    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
        document.getElementById('btn-logout').classList.remove('hidden');
        document.getElementById('btn-login').classList.add('hidden');
    } else {
        document.getElementById('btn-logout').classList.add('hidden');
        document.getElementById('btn-login').classList.remove('hidden');
    }
};

//Firebase

scoresRef.on('value', (snapshot) => {
    console.log(snapshot.val());
    highScoresArray = JSON.parse(snapshot.val()).sort(
        (record1, record2) => record2.score - record1.score
    );

    highScores.innerHTML = '';

    highScoresArray.forEach((score) => {
        let scoreLI = document.createElement('li');
        scoreLI.innerText = `${score.name} - ${score.score}`;
        highScores.appendChild(scoreLI);
    });
});

const getRandomCharacter = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    const randomInt = Math.floor(Math.random() * 36);
    randomCharacterText.classList.toggle('hide');
    currentCharacter = characters[randomInt];
    randomCharacterText.innerText = currentCharacter;

    randomCharacterText.classList.toggle('hide');
};

const startGame = () => {
    console.log('trying to start game');
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
            endScoreText.innerText = `SCORE: ${score}`;
            isPlaying = changeScreen(2);
        }
        displayFormattedTimer(seconds, ms);
    }, 16.67);
    isPlaying = changeScreen(1);
};

const resetGameState = () => {
    score = 0;
    seconds = 30;
    ms = 0;
};

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
    scoreText.innerText = `SCORE: ${score}`;
    getRandomCharacter();
});

saveScoreForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!username.value) return;

    saveScore(highScoresArray, username.value, score);
});
