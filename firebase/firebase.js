import firebaseConfig from './firebaseConfig';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const dbRef = firebase.database().ref();
const scoresRef = dbRef.child('typeScores');

const saveScore = (highScoresArray, name, score) => {
    highScoresArray.push({ name, score });
    highScoresArray = highScoresArray.sort((a, b) => b.score - a.score);
    highScoresArray.splice(10);
    scoresRef.set(JSON.stringify(highScoresArray), () => {
        changeScreen(0);
    });
};

export { scoresRef, saveScore };
