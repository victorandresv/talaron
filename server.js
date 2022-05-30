const jwt = require('jsonwebtoken');
const express = require('express');
const fs = require('fs');
const redis = require('redis');
const crypto = require('crypto');
const app = express();

require('dotenv').config();

const redisClient = redis.createClient({
    url: process.env.TALARON_REDIS
});

redisClient.connect();


/**
 * CREATE TOKEN
 */
const generateToken = async (req, res) => {
    const json = {
        id: req.params.id,
        rand: Math.random(),
        ts: new Date().getTime().toString()
    }
    const refresh_token = crypto.createHash('sha256').update(JSON.stringify(json)).digest('base64');
    await redisClient.set(req.params.id, refresh_token);
    
    var privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH);
    var token = jwt.sign({
        id: req.params.id,
        refresh_token: refresh_token
    }, privateKey, { 
        algorithm: 'RS256',
        expiresIn: '1m'
    });
    res.send(token);
}
app.get('/generate/:id', generateToken);


/**
 * REFRESH TOKEN
 */
app.get('/refresh/:token', async (req, res) => {
    try {
        var decoded = jwt.decode(req.params.token);
        refresh_token = await redisClient.get(decoded.id)
        if(refresh_token == decoded.refresh_token){
            req.params.id = decoded.id;
            generateToken(req, res);
        } else {
            res.send({
                success: false,
                error: "Invalid refresh token"
            });
        }
    } catch(e){
        res.send({
            success: false,
            error: e
        });
    }
});


/**
 * CHECK IF IS VALID TOKEN
 */
app.get('/validate/:token', function (req, res) {
    var privateKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH);
    try {
        var decoded = jwt.verify(req.params.token, privateKey, { 
            algorithm: 'RS256'
        });
        res.send({
            success: true,
            data: decoded
        });
    } catch(e){
        res.send({
            success: false,
            error: e
        });
    }
});


app.listen(process.env.TALARON_PORT);