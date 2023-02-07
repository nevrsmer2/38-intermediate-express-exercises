const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../expressError");

// const jwt = require("jsonwebtoken");


/** User of the site. */

class User {

    constructor(username, password, first_name, last_name, phone) {
        this.username = username;
        this.password = password;
        this.first_name = first_name;
        this.last_name = last_name;
        this.phone = phone;
    };


    static async register(username, password, first_name, last_name, phone) {

        const hashedPassword = await bcrypt.hash(
            password, BCRYPT_WORK_FACTOR);
        const result = await db.query(
            `INSERT INTO users (username, password, first_name, last_name, phone, join_at,last_login_at)
            VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
            RETURNING username, password, first_name, last_name, phone`,
            [username, hashedPassword, first_name, last_name, phone]
        );
        return result.rows[0];
    };


    /** Authenticate: is this username/password valid? Returns boolean. */

    static async authenticate(username, password) {
        const results = await db.query(
            `SELECT password FROM users WHERE username = $1`,
            [username]);
        const user = results.rows[0];
        return user && await bcrypt.compare(password, user.password);
    };


    /** Update last_login_at for user */

    static async updateLoginTimestamp(username) {
        const result = await db.query(
            `UPDATE users SET last_login_at = current_timestamp WHERE username = $1 RETURNING username`,
            [username]);
        if (!result.rows[0]) {
            throw new ExpressError(`Username: ${username} not found.`, 404);
        };
    };



    /** All: basic info on all users: **/

    static async all() {
        const results = await db.query(`SELECT username, first_name, last_name, phone from users`);
        const users = results.rows.map(r => new User(r.username, r.first_name, r.last_name, r.phone));
        return users;
    };

    /** Get Details on One User via Username */
    static async get(username) {
        const user = await db.query(`SELECT username, first_name, last_name, phone, join_at, last_login_at  FROM users WHERE username=$1`, [username]);
        const u = user.rows[0];
        if (!u) {
            throw new ExpressError('User not found', 404)
        };
        // return new User(u.username, u.first_name, u.last_name, u.phone, u.join_at, u.last_login_at);
        return new User(u);
    };


    /** Return messages from this user.
     *
     * [{id, to_user, body, sent_at, read_at}]
     *
     * where to_user is
     *   {username, first_name, last_name, phone}
     */

    static async messagesFrom(username) {
        const result = await db.query(
            `SELECT m.id,
                m.to_username,
                u.first_name,
                u.last_name,
                u.phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
            JOIN users AS u ON m.to_username = u.username
          WHERE from_username = $1`,
            [username]);

        return result.rows.map(m => ({
            id: m.id,
            to_user: {
                username: m.to_username,
                first_name: m.first_name,
                last_name: m.last_name,
                phone: m.phone
            },
            body: m.body,
            sent_at: m.sent_at,
            read_at: m.read_at
        }));
    };

    /** Return messages to this user.
     *
     * [{id, from_user, body, sent_at, read_at}]
     *
     * where from_user is
     *   {username, first_name, last_name, phone}
     */

    static async messagesTo(username) {
        const result = await db.query(
            `SELECT m.id,
                m.from_username,
                u.first_name,
                u.last_name,
                u.phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
           JOIN users AS u ON m.from_username = u.username
          WHERE to_username = $1`,
            [username]);

        return result.rows.map(m => ({
            id: m.id,
            from_user: {
                username: m.from_username,
                first_name: m.first_name,
                last_name: m.last_name,
                phone: m.phone,
            },
            body: m.body,
            sent_at: m.sent_at,
            read_at: m.read_at
        }));
    };
};



module.exports = User;