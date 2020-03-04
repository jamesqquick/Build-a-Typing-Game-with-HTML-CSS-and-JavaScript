require('dotenv').config();
const axios = require('axios');

exports.handler = async function(event, context, callback) {
    const url = `https://api.airtable.com/v0/appfga7wDbu6UslG0/Table%201?api_key=${process.env.AIRTABLE_API_KEY}&maxRecords=10&sort%5B0%5D%5Bfield%5D=score&sort%5B0%5D%5Bdirection%5D=desc`;

    let incomingScore;
    try {
        incomingScore = parseInt(event.queryStringParameters.score);
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Invalid Score!!' })
        };
    }

    let isInTopTen = false;
    let records = [];
    let lowestScoreRecord = null;
    try {
        const res = await axios.get(url);
        records = res.data.records;
        lowestScoreRecord = findLowerScoreRecord(records);
        isInTopTen = incomingScore > lowestScoreRecord.fields.score;
    } catch (er) {
        console.error(er);
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Failed to retrieve high scores' })
        };
    }

    if (event.httpMethod === 'GET') {
        return {
            statusCode: 200,
            body: JSON.stringify({ scores: records, isInTopTen })
        };
    } else if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body);

        if (!body.score || !body.name) {
            //return bad request
            return {
                statusCode: 400,
                body: JSON.stringify({
                    msg: 'Records should include a score and name!'
                })
            };
        }

        if (isInTopTen) {
            const lowestRecordId = lowestScoreRecord.id;
            console.log(lowestRecordId);
            const newLowestScoreRecord = {
                id: lowestRecordId,
                fields: { score: body.score.toString(), name: body.name }
            };
            console.log(newLowestScoreRecord);

            const url = `https://api.airtable.com/v0/appfga7wDbu6UslG0/Table%201?api_key=${process.env.AIRTABLE_API_KEY}`;

            try {
                const putBody = { records: [newLowestScoreRecord] };
                console.log(putBody);
                await axios.put(url, putBody);

                return {
                    statusCode: 200,
                    body: JSON.stringify(newLowestScoreRecord)
                };
            } catch (err) {
                console.error(err);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ msg: 'Failed to save high score' })
                };
            }
        } else {
            return {
                statusCode: 200,
                body: JSON.stringify({ msg: 'Not a top 10 score' })
            };
        }
    }
};

const findLowerScoreRecord = (scores) => {
    let lowestScoreRecord = null;

    scores.forEach((record) => {
        if (
            !lowestScoreRecord ||
            parseInt(record.fields.score) <
                parseInt(lowestScoreRecord.fields.score)
        ) {
            lowestScoreRecord = record;
        }
    });
    console.log(lowestScoreRecord);
    return lowestScoreRecord;
};
