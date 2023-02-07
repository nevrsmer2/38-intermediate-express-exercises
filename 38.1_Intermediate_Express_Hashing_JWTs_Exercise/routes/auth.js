const express = require('express');
const router = new express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");


/* Register a User and DD JWT WHEN USER CREATED*/

router.post('/register', async (req, res, next) => {
    try {
        const { username, password, first_name, last_name, phone } = req.body;
        let user = await User.register(username, password, first_name, last_name, phone);
        let token = jwt.sign({ user }, SECRET_KEY);
        User.updateLoginTimestamp(user);
        return res.json({ token });
    } catch (err) {
        return next(err);
    };
});

// object for creating user in Insomnia - http://localhost:3000/auth/register
// { "username": "janeDoe", "password": "password", "first_name": "Jane", "last_name": "Doe", "phone": 7773339898}



/* Login a User * * MAKE SURE TO ADD JWT TOEKN UPDATE LAST LOGIN*/

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.authenticate(username, password);
        if (user) {
            let token = jwt.sign({ username }, SECRET_KEY);
            User.updateLoginTimestamp(username);
            return res.json({ token });
        } else {
            throw new ExpressError('Invalid username and password combination', 400);
        };
    } catch (err) {
        return next(err);
    };
});


















module.exports = router;