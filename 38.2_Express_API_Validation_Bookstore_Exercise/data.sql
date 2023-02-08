\c books;

DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS books;

CREATE TABLE books (
  isbn TEXT PRIMARY KEY,
  amazon_url TEXT,
  author TEXT,
  language TEXT, 
  pages INTEGER,
  publisher TEXT,
  title TEXT, 
  year INTEGER
);

INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year) 
VALUES ('0691161518', 'http://a.co/eobPtX2', 'Matthew Lane','english', 264, 'Princeton University Press','Power-Up: Unlocking the Hidden Mathematics in Video Games', 2017);

