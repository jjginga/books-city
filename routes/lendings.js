const { Lend, validate: validateLend } = require("../models/lending");
const { Customer } = require("../models/customer");
const { Book } = require("../models/book");

const auth = require("../middleware/auth");
const validate = require("../middleware/validate");

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const lendings = await Lend.find().sort("-outDate");
  return res.send(lendings);
});

router.post("/", [auth, validate(validateLend)], async (req, res) => {
  const customer = await Customer.findById(req.body.customerId);
  if (!customer)
    return res.status(400).send("There is no customer with this Id.");

  const book = await Book.findById(req.body.bookId);
  if (!book) return res.status(400).send("There is no Book with this Id.");

  if (customer.hasBook) return res.status(400).send("Please return book first");

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

  await lend.save();

  await Book.update(
    { _id: lend.book.id },
    {
      $inc: { availableBooks: -1 },
    }
  );

  await Customer.update(
    { _id: lend.customer.id },
    {
      $set: { hasBook: true },
    }
  );
  res.send(lend);
});

router.put("/", [auth, validate(validateLend)], async (req, res) => {
  const lend = await Lend.lookup(req.body.customerId, req.body.bookId);

  if (!lend)
    return res.status(404).send("no lend with given customer and book");

  if (lend.returnDate) return res.status(400).send("return already processed");

  lend.dueDate = Date.now() + 7 * 24 * 60 * 60 * 1000;

  lend.save();
  return res.send(lend);
});

module.exports = router;
