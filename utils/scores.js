const highScoresList = document.getElementById('highScores');

export const loadHighScores = async (score) => {
    try {
        const url = `.netlify/functions/highScores?score=${score}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log(data);
        displayHighScores(data.scores);
        return data;
    } catch (err) {
        console.error(err);
    }
};

export const saveHighScore = async (score, username) => {
    const postBody = { score, username };
    const url = `.netlify/functions/highScores`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(postBody)
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
