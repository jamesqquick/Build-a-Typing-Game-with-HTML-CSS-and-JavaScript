const randomCharacterText = document.getElementById('randomCharacter');
const scoreText = document.getElementById('scoreText');
const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
const timerText = document.getElementById('timer');

export const getRandomCharacter = () => {
    const randomInt = Math.floor(Math.random() * 36);
    const currentCharacter = characters[randomInt];
    randomCharacterText.innerText = currentCharacter;
    return currentCharacter;
};

export const displayScore = (score) => {
    scoreText.innerText = `SCORE: ${score}`;
};

export const displayFormattedTimer = (seconds, ms) => {
    const formattedSeconds = ('0' + seconds).slice(-2);
    const formattedMs = ('0' + ms).slice(-2);

    timerText.innerText = `${formattedSeconds}:${formattedMs}`;
};
