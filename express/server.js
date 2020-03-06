'use strict';
require('dotenv').config();
const axios = require('axios');

const express = require('express');
const serverless = require('serverless-http');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const app = express();
app.use(express.json());

const router = express.Router();

const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),

    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithm: ['RS256']
});

router.get('/scores', async (req, res) => {
    const records = await getHighScores();
    if (!records) {
        return res.status(500).send({ msg: 'Failed to retrieve high scores' });
    }
    const lowestScoreRecord = findLowestScoreRecord(records);

    let isInTopTen = false;
    if (req.query.score) {
        const incomingScore = parseInt(req.query.score);
        isInTopTen = incomingScore > lowestScoreRecord.fields.score;
    }

    return res.send({ scores: records, isInTopTen });
});

router.post('/scores', checkJwt, async (req, res) => {
    const body = req.body;

    if (!body.score || !body.username) {
        return res
            .status(400)
            .send({ msg: 'Records should include a score and a name' });
    }

    const records = await getHighScores();
    if (!records) {
        return res.status(500).send({ msg: 'Failed to retrieve high scores' });
    }
    const lowestScoreRecord = findLowestScoreRecord(records);

    const isInTopTen = body.score > lowestScoreRecord.fields.score;

    if (isInTopTen) {
        const lowestRecordId = lowestScoreRecord.id;
        const newLowestScoreRecord = {
            id: lowestRecordId,
            fields: {
                score: body.score.toString(),
                name: body.username
            }
        };
        console.log(newLowestScoreRecord);

        const url = `https://api.airtable.com/v0/appfga7wDbu6UslG0/Table%201?api_key=${process.env.AIRTABLE_API_KEY}`;

        try {
            const putBody = {
                records: [newLowestScoreRecord]
            };
            console.log(putBody);
            await axios.put(url, putBody);

            return res.send(newLowestScoreRecord);
        } catch (err) {
            console.error(err);
            return res.status(500).send({ msg: 'Failed to save high score' });
        }
    } else {
        return res.status(400).send({ msg: 'Not a top 10 score' });
    }

    res.send(body);
});

app.use('/.netlify/functions/server', router); // path must route to lambda

app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).send({ msg: 'Invalid token' });
    }

    next(err, req, res);
});

module.exports.handler = serverless(app);

const getHighScores = async () => {
    const url = `https://api.airtable.com/v0/appfga7wDbu6UslG0/Table%201?api_key=${process.env.AIRTABLE_API_KEY}&maxRecords=10&sort%5B0%5D%5Bfield%5D=score&sort%5B0%5D%5Bdirection%5D=desc`;

    let records = [];

    try {
        const res = await axios.get(url);
        records = res.data.records;
        return records;
    } catch (er) {
        console.error(er);
        return null;
    }
};

const findLowestScoreRecord = (scores) => {
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
