require('dotenv').config();
const axios = require('axios');

exports.handler = async function(event, context, callback) {
    console.log(event);
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
    try {
        const res = await axios.get(url);
        records = res.data.records;
        if (incomingScore) {
            //check to see if it is in the top 10
            records.forEach((record) => {
                if (incomingScore > record.fields.score) {
                    isInTopTen = true;
                }
            });
        }
    } catch (er) {
        console.error(er);
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Failed to retrieve high scores' })
        };
    }

    if (event.httpMethod === 'GET') {
        console.log(incomingScore);

        return {
            statusCode: 200,
            body: JSON.stringify({ scores: records, isInTopTen })
        };
    } else if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body);
        console.log(body);
        return {
            statusCode: 200,
            body: JSON.stringify({ msg: 'YAY' })
        };
    }
};
