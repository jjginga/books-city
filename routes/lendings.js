const { Lend, validate, validateReturn } = require("../models/lending");
const { Customer } = require("../models/customer");
const { Book } = require("../models/book");

const mongoose = require("mongoose");
const Fawn = require("fawn");

const express = require("express");
const router = express.Router();

Fawn.init(mongoose);

router.get("/", async (req, res) => {
  const lendings = await Lend.find().sort("-outDate");
  return res.send(lendings);
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

  const lend = new Lend({
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

  try {
    new Fawn.Task()
      .save("lends", lend)
      .update(
        "books",
        { _id: book._id },
        {
          $inc: { availableBooks: -1 },
        }
      )
      .update(
        "customers",
        { _id: customer._id },
        {
          $set: { hasBook: true },
        }
      )
      .run();

    return res.send(lend);
  } catch (error) {
    return res.status(500).send("Something went wrong.");
  }
});

router.put("/:id", async (req, res) => {
  const { error } = validateReturn(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const lend = await Lend.findById(req.params.id);

  if (!lend)
    return res.status(404).send("The lend with the given Id was not found");

  if (!req.body.hasReturned) {
    lend.returnDate = Date.now() + 7 * 24 * 60 * 60 * 1000;

    lend.save();
    return res.send(lend);
  }

  try {
    new Fawn.Task()
      .update(
        "lends",
        { _id: lend._id },
        {
          $set: { hasReturned: true },
        }
      )
      .update(
        "customers",
        { _id: lend.customer._id },
        {
          $set: { hasBook: false },
        }
      )
      .update(
        "books",
        { _id: lend.book._id },
        {
          $inc: { availableBooks: +1 },
        }
      )
      .run();

    return res.send(lend);
  } catch (error) {
    return res.status(500).send("Something went wrong.", error.message);
  }
});

module.exports = router;
