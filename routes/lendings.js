const { Lend, validate, validateReturn } = require("../models/lendings");
const { Customer } = require("../models/customers");
const { Book } = require("../models/books");

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const lendings = await Lend.find().sort("-outDate");
  res.send(lendings);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer)
    return res.status(400).send("There is no customer with this Id.");
  if (customer.hasBook) return res.status(400).send("Please return book first");

  const book = await Book.findById(req.body.bookId);
  if (!book) return res.status(400).send("There is no Book with this Id.");

  if (book.availableBooks === 0)
    return res.status(400).send("Book not available");

  let lend = new Lend({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    book: {
      _id: book._id,
      title: book.title,
    },
  });

  lend = await lend.save();

  customer.hasBook = true;
  customer.save();
  book.availableBooks--;
  book.save();

  res.send(lend);
});

router.put("/:id", async (req, res) => {
  const { error } = validateReturn(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const lend = await Lend.findById(req.params.id);

  if (!lend)
    return res.status(404).send("The lend with the given Id was not found");

  lend.hasReturned = req.body.hasReturned;

  if (!lend.hasReturned) {
    lend.returnDate = () => Date.now() + 7 * 24 * 60 * 60 * 1000;
    lend.save();
    res.send(lend);
  }

  const customer = await Customer.findById(lend.customer._id);
  const book = await Book.findById(lend.book._id);

  book.availableBooks++;
  customer.hasBook = false;

  customer.save();
  book.save();
  lend.save();

  res.send(lend);
});

module.exports = router;
