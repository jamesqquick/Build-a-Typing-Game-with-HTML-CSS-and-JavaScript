require('dotenv').config();
var jwt = require('jsonwebtoken');
const axios = require('axios');
const jwksClient = require('jwks-rsa');
const { promisify } = require('util');

const client = jwksClient({
    cache: true, // Default Value
    cacheMaxEntries: 5, // Default value
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

let signingKey;

// jwksClient.getSigningKey(process.env.AUTH0_KEY_ID, (err, key) => {
//     if (err) {
//         console.error('Failed to get signing key', err);
//     }
//     signingKey = key.getPublicKey();
// });

exports.handler = async function(event, context, callback) {
    const url = `https://api.airtable.com/v0/appfga7wDbu6UslG0/Table%201?api_key=${process.env.AIRTABLE_API_KEY}&maxRecords=10&sort%5B0%5D%5Bfield%5D=score&sort%5B0%5D%5Bdirection%5D=desc`;

    let isInTopTen = false;
    let records = [];
    let lowestScoreRecord = null;
    try {
        const res = await axios.get(url);
        records = res.data.records;
        lowestScoreRecord = findLowerScoreRecord(records);
    } catch (er) {
        console.error(er);
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Failed to retrieve high scores' })
        };
    }

    if (event.httpMethod === 'GET') {
        try {
            incomingScore = parseInt(event.queryStringParameters.score);
        } catch (err) {
            return {
                statusCode: 500,
                body: JSON.stringify({ msg: 'Invalid Score!!' })
            };
        }
        const isInTopTen = incomingScore > lowestScoreRecord.fields.score;

        return {
            statusCode: 200,
            body: JSON.stringify({ scores: records, isInTopTen })
        };
    } else if (event.httpMethod === 'POST') {
        console.log(event.headers);
        const rawAuthorizationHeader = event.headers['authorization'];
        let user = null;
        try {
            user = await checkHeaderForValidToken(rawAuthorizationHeader);
        } catch (err) {
            return {
                statusCode: 401,
                body: JSON.stringify({ msg: err })
            };
        }
        console.log(user);

        const body = JSON.parse(event.body);

        if (!body.score || !body.username) {
            //return bad request
            return {
                statusCode: 400,
                body: JSON.stringify({
                    msg: 'Records should include a score and name!'
                })
            };
        }

        const isInTopTen = body.score > lowestScoreRecord.fields.score;

        console.log('****IS IN TOP 10', lowestScoreRecord, body.score);

        if (isInTopTen) {
            const lowestRecordId = lowestScoreRecord.id;
            console.log(lowestRecordId);
            const newLowestScoreRecord = {
                id: lowestRecordId,
                fields: { score: body.score.toString(), name: body.username }
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

const checkHeaderForValidToken = async (rawAuthorizationHeader) => {
    console.log(rawAuthorizationHeader);
    if (!rawAuthorizationHeader) {
        throw 'Unauthorized. No access token included';
    }

    const accessToken = rawAuthorizationHeader.split(' ')[1];
    if (!accessToken) {
        throw 'Unauthorized. Token is invalid.';
    }

    if (!signingKey) {
        const getSigningKey = promisify(client.getSigningKey);
        try {
            const key = await getSigningKey(process.env.AUTH0_KEY_ID);
            signingKey = key.getPublicKey();
        } catch (err) {
            throw 'Failed to verify key';
        }
    }

    try {
        var decoded = jwt.verify(accessToken, signingKey);
    } catch (err) {
        throw err.message;
    }

    if (!decoded) {
        throw 'Failed to verify token';
    }
    console.log(decoded);
    return decoded;
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
    return lowestScoreRecord;
};
