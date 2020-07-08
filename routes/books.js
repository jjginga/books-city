const { Book, validate } = require("../models/book");
const { Author } = require("../models/author");
const { Publisher } = require("../models/publisher");
const { Category } = require("../models/category");

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const books = await Book.find().sort("title");

  res.send(books);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const author = await Author.findById(req.body.authorId);
  if (!author) return res.status(400).send("There is no author with that Id.");

  const publisher = await Publisher.findById(req.body.publisherId);
  if (!publisher)
    return res.status(400).send("There is no publisher with that Id.");

  const category = await Category.findById(req.body.categoryId);
  if (!category)
    return res.status(400).send("There is no category with that Id.");

  const book = new Book({
    title: req.body.title,
    author: {
      _id: author._id,
      firstName: author.firstName,
      lastName: author.lastName,
    },
    publisher: {
      _id: publisher._id,
      name: publisher.name,
    },
    category: {
      _id: category._id,
      name: category.name,
    },
    stock: req.body.stock,
    availableBooks: req.body.availableBooks,
    yearlyLends: req.body.yearlyLends,
  });

  await book.save();
  res.send(book);
});

router.get("/:id", async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) return res.status(404).send("The book was not found.");

  res.send(book);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const author = await Author.findById(req.body.authorId);
  if (!author) return res.status(400).send("There is no author with that Id.");

  const publisher = await Publisher.findById(req.body.publisherId);
  if (!publisher)
    return res.status(400).send("There is no publisher with that Id.");

  const category = await Category.findById(req.body.categoryId);
  if (!category)
    return res.status(400).send("There is no category with that Id.");

  const book = await Book.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      author: {
        _id: author._id,
        firstName: author.firstName,
        lastName: author.lastName,
      },
      publisher: {
        _id: publisher._id,
        name: publisher.name,
      },
      category: {
        _id: category._id,
        name: category.name,
      },
      stock: req.body.stock,
      availableBooks: req.body.availableBooks,
      yearlyLends: req.body.yearlyLends,
    },
    { new: true }
  );

  if (!book)
    return res.status(404).send("The book with the given Id was not found.");

  res.send(book);
});

router.delete("/:id", async (req, res) => {
  const book = await Book.findByIdAndRemove(req.params.id);

  if (!book)
    return res.status(404).send("The book with the given Id was not found.");

  res.send(book);
});

module.exports = router;
