const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{ username: "nguyenhoangthang", password: "123456" }];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  return !users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  return users.some(
    (user) => user.username === username && user.password === password,
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  let username = req.body.username;
  let password = req.body.password;
  if (username && password) {
    if (authenticatedUser(username, password)) {
      //create a JWT token

      let token = jwt.sign({ username: username }, "my-secret-key", {
        expiresIn: "1h",
      });
      req.session.authorization = {
        token,
        username,
      };
      return res
        .status(200)
        .json({ message: "User logged in successfully", token: token });
    } else {
      return res
        .status(400)
        .json({ message: "Username or password is incorrect" });
    }
  }
  return res.status(300).json({ message: "Yet to be implemented" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
