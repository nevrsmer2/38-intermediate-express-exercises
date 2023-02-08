/** Integration tests for books route */

process.env.NODE_ENV = "test"
const app = require("../app");
const db = require("../db");
const request = require("supertest");


// Sample Book's ISBN
let book_isbn;

beforeEach(async () => {
    let result = await db.query(`
    INSERT INTO
      books (isbn, amazon_url,author,language,pages,publisher,title,year)
      VALUES(
        '8675309',
        'https://amazon.com',
        'Miguel Cervantes',
        'Espanol',
        1100,
        'Real Academia Espanola',
        'Don Quixote de la mancha', 1605)
      RETURNING isbn`);
    book_isbn = result.rows[0].isbn
});


describe("POST /books", function () {
    test("If a new book is created", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({
                isbn: '111222333',
                amazon_url: "https://amazon.com/books/fiction",
                author: "Prolific",
                language: "all languages",
                pages: 500,
                publisher: "McMullin",
                title: "By the Grace of ...",
                year: 1800
            });
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty("pages");
    });

    test("If book missing the required title reults in an error", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({ year: 2022 });
        expect(response.statusCode).toBe(400);
    });
});


describe("GET /books", function () {
    test("If one book is returned based on ISBN (Primary Key) in a list", async function () {
        const response = await request(app).get(`/books`);
        const books = response.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty("isbn");
        expect(books[0]).toHaveProperty("amazon_url");
    });
});


describe("GET /books/:isbn", function () {
    test("If a single book is returned based on ISBN (Primary Key)", async function () {
        const response = await request(app)
            .get(`/books/${book_isbn}`)
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe(book_isbn);
    });

    test("If a 404 code is returned if a single book is not found.", async function () {
        const response = await request(app)
            .get(`/books/999`)
        expect(response.statusCode).toBe(404);
    });
});


describe("PUT /books/:id", function () {
    test("If a single book based on its ISBN is updated", async function () {
        const response = await request(app)
            .put(`/books/${book_isbn}`)
            .send({
                amazon_url: "https://updated-book",
                author: "Julio Cortazar",
                language: "Spanish",
                pages: 140,
                publisher: "El fantastico. S.A.",
                title: "UPDATED BOOK",
                year: 1963
            });
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.title).toBe("UPDATED BOOK");
    });

    test("If a book with an incorrect ISBN is not updated", async function () {
        const response = await request(app)
            .put(`/books/${book_isbn}`)
            .send({
                isbn: "000999888654",
                badField: "INCORRECT BOOK",
                amazon_url: "https://wrongbook.com",
                author: "Wrong book author",
                language: "morse codee",
                pages: 100,
                publisher: "wrong book publishers",
                title: "NO BOOK NO",
                year: 1900
            });
        expect(response.statusCode).toBe(400);
    });

    test("If a 404 is returned if a book is not found", async function () {
        // delete book first
        await request(app)
            .delete(`/books/${book_isbn}`)
        const response = await request(app).delete(`/books/${book_isbn}`);
        expect(response.statusCode).toBe(404);
    });
});


describe("DELETE /books/:id", function () {
    test("Deletes a single a book from the table", async function () {
        const response = await request(app)
            .delete(`/books/${book_isbn}`)
        expect(response.body).toEqual({ message: "Book deleted" });
    });
});


afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
});


afterAll(async function () {
    await db.end()
});
