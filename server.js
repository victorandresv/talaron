const jwt = require('jsonwebtoken');
const express = require('express');
const fs = require('fs');
const redis = require('redis');
const crypto = require('crypto');
const app = express();

require('dotenv').config();

const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASS
});

redisClient.connect();


/**
 * CREATE TOKEN
 */
const generateToken = async (req, res) => {
    var privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH);

    const json = {
        id: req.params.id,
        rand: Math.random(),
        ts: new Date().getTime().toString()
    }
    const refresh_token = crypto.createHash('sha256').update(JSON.stringify(json)).digest('base64');
    try{
        await redisClient.set(refresh_token, JSON.stringify(json));
    
        var token = jwt.sign({
            id: req.params.id
        }, privateKey, { 
            algorithm: 'RS256',
            expiresIn: '1m'
        });
        res.send({
            success: true,
            access_token: token,
            refresh_token: refresh_token
        });
    } catch(e){
        res.send({
            success: false,
            error: e,
        });
    }
    
}
app.get('/generate/:id', generateToken);


/**
 * REFRESH TOKEN
 */
app.get('/refresh/:token', async (req, res) => {
    data = await redisClient.get(req.params.token)
    if(data == null){
        res.send({
            success: false,
            error: "Refresh token expired or invalid"
        });
    } else {
            await redisClient.del(req.params.token)
            generateToken({
                params: {
                    id: data.id
                }
            }, res)
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