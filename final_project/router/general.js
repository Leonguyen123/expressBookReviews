const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const jwt = require("jsonwebtoken");

// Check if a user with the given username already exists
const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  new Promise((resolve, reject) => {
    if (!username || !password) {
      reject("Unable to register user.");
    }

    if (doesExist(username)) {
      reject("User already exists!");
    }

    users.push({ username, password });
    resolve("User successfully registered. Now you can login");
  })
    .then((message) => res.status(200).json({ message }))
    .catch((err) => res.status(400).json({ message: err }));
});

// Get the book list available in the shop
public_users.get("/", (req, res) => {
  new Promise((resolve) => {
    resolve(books);
  })
    .then((data) => res.status(200).json(data))
    .catch(() => res.status(500).json({ message: "Error fetching books" }));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("No book found with ISBN " + isbn);
    }
  })
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err }));
});

// Get book details based on author
public_users.get("/author/:author", (req, res) => {
  const author = req.params.author;

  new Promise((resolve, reject) => {
    const booksByAuthor = Object.values(books).filter(
      (book) => book.author === author,
    );

    booksByAuthor.length > 0
      ? resolve(booksByAuthor)
      : reject("No book found with author " + author);
  })
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(404).json({ message: err }));
});

// Get all books based on title
public_users.get("/title/:title", (req, res) => {
  const title = req.params.title;

  new Promise((resolve, reject) => {
    const booksByTitle = Object.values(books).filter(
      (book) => book.title === title,
    );

    booksByTitle.length > 0
      ? resolve(booksByTitle)
      : reject("No book found with title " + title);
  })
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(404).json({ message: err }));
});

//  Get book review
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn].reviews || {});
    } else {
      reject("No book found with ISBN " + isbn);
    }
  })
    .then((reviews) => res.status(200).json(reviews))
    .catch((err) => res.status(404).json({ message: err }));
});

public_users.put("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  new Promise((resolve, reject) => {
    try {
      const token = req.header("Authorization").replace("Bearer ", "");
      const decoded = jwt.verify(token, "fingerprint_customer");
      const user = users.find((u) => u.username === decoded.username);

      if (!user) reject("User not found");
      if (!books[isbn]) reject("Book not found");

      if (!books[isbn].reviews) {
        books[isbn].reviews = {};
      }

      if (books[isbn].reviews[user.username]) {
        reject("Review already exists");
      }

      books[isbn].reviews[user.username] = review;
      resolve("Review added successfully");
    } catch (error) {
      reject("Invalid token");
    }
  })
    .then((message) => res.status(200).json({ message }))
    .catch((err) => res.status(400).json({ message: err }));
});

public_users.delete("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    try {
      const token = req.header("Authorization").replace("Bearer ", "");
      const decoded = jwt.verify(token, "fingerprint_customer");
      const user = users.find((u) => u.username === decoded.username);

      if (!user) reject("User not found");
      if (!books[isbn]) reject("Book not found");

      if (books[isbn].reviews && books[isbn].reviews[user.username]) {
        delete books[isbn].reviews[user.username];
        resolve("Review deleted successfully");
      } else {
        reject("Review not found");
      }
    } catch (error) {
      reject("Invalid token");
    }
  })
    .then((message) => res.status(200).json({ message }))
    .catch((err) => res.status(400).json({ message: err }));
});

module.exports.general = public_users;
