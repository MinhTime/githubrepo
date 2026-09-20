const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

/* ---------- Task 6: Đăng ký người dùng mới ---------- */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

/* ---------- Nguồn dữ liệu nội bộ (được Axios gọi tới) ---------- */
public_users.get('/internal/books', (req, res) => {
  return res.status(200).json(books);
});

public_users.get('/internal/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: `No book found for ISBN ${req.params.isbn}` });
  return res.status(200).json(book);
});

public_users.get('/internal/author/:author', (req, res) => {
  const result = Object.keys(books)
    .filter(k => books[k].author.toLowerCase() === req.params.author.toLowerCase())
    .map(k => ({ isbn: k, ...books[k] }));
  if (result.length === 0) return res.status(404).json({ message: `No book found by author ${req.params.author}` });
  return res.status(200).json(result);
});

public_users.get('/internal/title/:title', (req, res) => {
  const result = Object.keys(books)
    .filter(k => books[k].title.toLowerCase() === req.params.title.toLowerCase())
    .map(k => ({ isbn: k, ...books[k] }));
  if (result.length === 0) return res.status(404).json({ message: `No book found with title ${req.params.title}` });
  return res.status(200).json(result);
});

/* ---------- Task 10: Lấy tất cả sách (async/await + Axios) ---------- */
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/internal/books`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    if (error.response) return res.status(error.response.status).json(error.response.data);
    return res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

/* ---------- Task 11: Lấy sách theo ISBN (async/await + Axios) ---------- */
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/internal/isbn/${req.params.isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response) return res.status(error.response.status).json(error.response.data);
    return res.status(500).json({ message: "Error retrieving book by ISBN", error: error.message });
  }
});

/* ---------- Task 12: Lấy sách theo tác giả (Promise callbacks + Axios) ---------- */
public_users.get('/author/:author', (req, res) => {
  axios.get(`${BASE_URL}/internal/author/${encodeURIComponent(req.params.author)}`)
    .then(response => res.status(200).json(response.data))
    .catch(error => {
      if (error.response) return res.status(error.response.status).json(error.response.data);
      return res.status(500).json({ message: "Error retrieving books by author", error: error.message });
    });
});

/* ---------- Task 13: Lấy sách theo tiêu đề (Promise callbacks + Axios) ---------- */
public_users.get('/title/:title', (req, res) => {
  axios.get(`${BASE_URL}/internal/title/${encodeURIComponent(req.params.title)}`)
    .then(response => res.status(200).json(response.data))
    .catch(error => {
      if (error.response) return res.status(error.response.status).json(error.response.data);
      return res.status(500).json({ message: "Error retrieving books by title", error: error.message });
    });
});

/* ---------- Task 5: Lấy review của một cuốn sách ---------- */
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: `No book found for ISBN ${req.params.isbn}` });
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
