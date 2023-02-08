const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const Book = require('../models/book');

const { validate } = require('jsonschema');
const bookSchema = require('../schemas/bookSchema');
const bookSchemaUpdate = require("../schemas/bookSchemaUpdate");


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
    try {
        const books = await Book.findAll(req.query);
        return res.json({ books });
    } catch (err) {
        return next(err);
    }
});


/** GET /[id]  => {book: book} */
//id refers to the ISBN.  The books table has  no "id" column.  "isbn is the PK"

router.get("/:id", async function (req, res, next) {
    try {
        const book = await Book.findOne(req.params.id);
        return res.json({ book });
    } catch (err) {
        return next(err);
    }
});


/** POST /   bookData => {book: newBook}  */

router.post("/", async (req, res, next) => {
    try {
        const validation = validate(req.body, bookSchema);
        if (!validation.valid) {
            let listOfErrors = validation.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        };
        const book = await Book.create(req.body);
        return res.status(201).json({ book });
    } catch (error) {
        return next(error)
    }
});


/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async (req, res, next) => {

    if ('isbn' in req.body) {
        return next({
            status: 400,
            message: "Not allowed"
        });
    }
    try {
        const validation = validate(req.body, bookSchemaUpdate);
        if (!validation.valid) {
            let listOfErrors = validation.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        };
        const book = await Book.update(req.params.isbn, req.body)

        return res.status(201).json({ book });
    } catch (error) {
        return next(error)
    };
});


/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
    try {
        await Book.remove(req.params.isbn);
        return res.json({ message: "Book deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;




//JSON object to test creating a book
// {
//     "book": {
//       "isbn": "0691161518",
//       "amazon_url": "http://a.co/eobPtX2",
//       "author": "Matthew Lane",
//       "language": "english",
//       "pages": 264,
//       "publisher": "Princeton University Press",
//       "title": "Power-Up: Unlocking Hidden Math in Video Games",
//       "year": 2017
//     }
//   }

