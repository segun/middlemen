const express = require("express");
const path = require("path");
const fs = require("fs");
require('dotenv').config();
var cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT;
const { default: axios } = require("axios");
const CryptoJS = require("crypto-js");
const crypto = require('crypto');


let imdb = {};
app.get("/key/:id", (req, res) => {
    const id = req.params.id;
    const secretKey = crypto.randomBytes(64).toString('hex');

    const encryptedData = CryptoJS.AES.encrypt(id, secretKey).toString();

    imdb[id] = encryptedData,        
    res.json({
        status: 'success',
        passphrase: encryptedData,
        notes: 'Encrypt your sensitive data using the above passphrase as secret passphrase. e.g CryptoJS.AES.encrypt(plainKey, passphrase);'
    });
});

app.post("/cmc/:id", async (req, res) => {
    const id = req.params.id;
    const {
        url,
        cmcEncryptedKey
    } = req.body;

    const passphrase = imdb[id];
    const decryptedKey = CryptoJS.AES.decrypt(cmcEncryptedKey, passphrase).toString(CryptoJS.enc.Utf8);

    const instance = axios.create({
        headers: {
            'X-CMC_PRO_API_KEY': decryptedKey
        }
    });

    const response = await instance.get(url);
    delete imdb[id];
    res.json(response.data);
});

app.listen(port, () => {
    console.log("middlemen Started on PORT: ", port);
});
  