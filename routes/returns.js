const { Lend, validateReturn } = require("../models/lending");
const { Book } = require("../models/book");
const { Customer } = require("../models/customer");

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");

router.post("/", [auth, validate(validateReturn)], async (req, res, next) => {
  const lend = await Lend.lookup(req.body.customerId, req.body.bookId);

  if (!lend)
    return res.status(404).send("no lend with given customer and book");

  if (lend.returnDate) return res.status(400).send("return already processed");

  lend.returnDate = Date.now();
  await lend.save();

  lend.return();
  await lend.save();

  await Book.update(
    { _id: lend.book.id },
    {
      $inc: { availableBooks: 1 },
    }
  );

  await Customer.update(
    { _id: lend.customer.id },
    {
      $set: { hasBook: false },
    }
  );

  res.send(lend);
});

module.exports = router;
