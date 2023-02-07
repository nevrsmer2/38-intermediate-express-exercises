const express = require('express');
const router = new express.Router();
const User = require("../models/user");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");


/** GET / - get list of all users. **/

// router.get("/", ensureLoggedIn, async (req, res, next) => {
//     try {
//         const users = await User.all();
//         return res.json(users);
//     } catch (error) {
//         return next(error);
//     };
// });


router.get('/', async (req, res, next) => {
    try {
        const users = await User.all();
        return res.json(users);
    } catch (error) {
        return next(error);
    };
});



/* Return Details on One User via username */

// router.get("/:username", ensureCorrectUser, async (req, res, next) => {
//     try {
//         const { username } = req.params;
//         let user = await User.get(username);
//         return res.json(user);
//     } catch (error) {
//         return next(error);
//     };
// });


router.get('/:username', async (req, res, next) => {
    try {
        const { username } = req.params;
        let user = await User.get(username);
        return res.json(user);
    } catch (error) {
        return next(error);
    };
});

/** get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


router.get('/:username/to', ensureCorrectUser, async (req, res, next) => {
    try {
        const { username } = req.params
        const messages = await User.messagesTo(username);
        return res.json({ messages });
    }
    catch (error) {
        return next(error);
    };
});

/** get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', ensureCorrectUser, async (req, res, next) => {
    try {
        const { username } = req.params
        const messages = await User.messagesFrom(username);
        return res.json({ messages });
    }
    catch (error) {
        return next(error);
    };
});


module.exports = router;