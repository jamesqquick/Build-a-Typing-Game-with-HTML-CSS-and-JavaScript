import 'babel-polyfill';
import { changeScreen, isScreenShowing } from './utils/navigation';
import { loadHighScores, getHighScores } from './utils/scores';
import { login, logout, updateNav } from './utils/auth';
import {
    getRandomCharacter,
    displayScore,
    displayFormattedTimer
} from './utils/game';

//Home screen
const startGameBtn = document.getElementById('startGameBtn');
startGameBtn.addEventListener('click', () => {
    console.log('clicked start game');
    startGame();
});
const homeBtn = document.getElementById('homeBtn');
homeBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    resetGameState();
    changeScreen(0);
});

const highScoresBtn = document.getElementById('highScoresBtn');
highScoresBtn.addEventListener('click', () => {
    changeScreen(3);
});

//Game Screen
const GAME_SECONDS = 5;
//game state
let isPlaying = false;
let currentCharacter = '';
let score = 0;
let seconds = 0;
let ms = 0;
let timerInterval = null;

//end screen
const endScoreText = document.getElementById('endScoreText');
const username = document.getElementById('username');
const playAgainBtn = document.getElementById('playAgainBtn');
playAgainBtn.addEventListener('click', () => {
    startGame();
});

loadHighScores();

const startGame = () => {
    resetGameState();
    currentCharacter = getRandomCharacter();

    timerInterval = setInterval(async () => {
        if (ms <= 0) {
            seconds--;
            ms = 59;
        } else {
            ms--;
        }

        if (seconds <= 0 && ms <= 0) {
            clearInterval(timerInterval);
            saveScoreForm.classList.add('hidden');

            if (score > 0) {
                const data = await loadHighScores(score);
                console.log(data);
                if (data.isInTopTen) {
                    saveScoreForm.classList.remove('hidden');
                }
            }
            endScoreText.innerText = `SCORE: ${score}`;
            isPlaying = changeScreen(2);
        }
        displayFormattedTimer(seconds, ms);
    }, 16.67);
    isPlaying = changeScreen(1);
};

const resetGameState = () => {
    score = 0;
    seconds = GAME_SECONDS;
    ms = 0;
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
    displayScore(score);
    currentCharacter = getRandomCharacter();
});
