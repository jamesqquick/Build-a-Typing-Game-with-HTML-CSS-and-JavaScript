require('dotenv').config();
const axios = require('axios');

exports.handler = async function(event, context, callback) {
    const url = `https://api.airtable.com/v0/appfga7wDbu6UslG0/Table%201?api_key=${process.env.AIRTABLE_API_KEY}&maxRecords=10&sort%5B0%5D%5Bfield%5D=score&sort%5B0%5D%5Bdirection%5D=desc`;

    try {
        const res = await axios.get(url);
        console.log(res.data);
        return {
            statusCode: 200,
            body: JSON.stringify({ msg: 'SUCCESS', scores: res.data.records })
        };
    } catch (er) {
        console.error(er);
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Failed to retrieve high scores' })
        };
    }
};
