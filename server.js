const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwtVerifier = require('express-jwt');

const database = require('./utils/database');
const authentication = require('./controllers/authentication');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const app = express();
const db = database.connect();

const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json(database.users);
})

app.post('/signin', (req, res) => { authentication.handleLogin(req, res, db, bcrypt, jwt) });

app.post('/register', (req, res) => { authentication.handleRegister(req, res, db, bcrypt, jwt) });

app.get('/profile', jwtVerifier({ secret: authentication.secret }), (req, res) => { profile.handleProfile(req, res, jwt, database) });

app.put('/image', jwtVerifier({ secret: authentication.secret }), (req, res) => { image.handleImageEntry(req, res, jwt, database) });

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(500).json(err.message);
    }
});

app.listen(PORT, () => {
    console.log(`CORS-enabled web server listening on port ${PORT}`)
});