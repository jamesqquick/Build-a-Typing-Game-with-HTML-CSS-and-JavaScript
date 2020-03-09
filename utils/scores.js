import { auth0 } from './auth';
import { changeScreen } from './navigation';
const highScoresList = document.getElementById('highScores');

export const loadHighScores = async (score) => {
    try {
        const url = `.netlify/functions/highScores?score=${score}`;
        const res = await fetch(url);
        const data = await res.json();
        displayHighScores(data.scores);
        return data;
    } catch (err) {
        console.error(err);
    }
};

export const saveHighScore = async (score) => {
    let token;
    let user;
    try {
        token = await auth0.getTokenSilently();
        user = await auth0.getUser();
    } catch (ex) {
        //maybe the user wasn't authenticated
        changeScreen(0);
    }

    const username = user['https://learnbuildtype/username'];
    if (!username) return false;
    const postBody = { score, username };
    const url = `.netlify/functions/highScores`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(postBody),
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return true;
    } catch (err) {
        return false;
    }
};

const displayHighScores = (scores) => {
    highScoresList.innerHTML = '';
    scores.forEach((record) => {
        //fields => name, score
        if (record.fields.name && record.fields.score) {
            const li = document.createElement('li');
            li.innerText = `${record.fields.name} - ${record.fields.score}`;
            highScoresList.appendChild(li);
        }
    });
};
