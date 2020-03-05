const highScoresList = document.getElementById('highScores');
const saveScoreForm = document.getElementById('saveScoreForm');

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

saveScoreForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!username.value) return;

    //call serverless function to save score
});
