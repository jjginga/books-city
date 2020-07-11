const { Author, validate: validateAuthor } = require("../models/author");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");

const _ = require("lodash");

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const authors = await Author.find().sort("lastName");

  res.send(authors);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (!author) return res.status(404).send("The author was not found.");

  res.send(author);
});

router.post("/", [auth, validate(validateAuthor)], async (req, res) => {
  const author = new Author(
    _.pick(req.body, ["firstName", "middleName", "lastName"])
  );

  await author.save();
  res.send(author);
});

router.put(
  "/:id",
  [auth, validateObjectId, validate(validateAuthor)],
  async (req, res) => {
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      _.pick(req.body, ["firstName", "middleName", "lastName"]),
      { new: true }
    );

    if (!author)
      return res
        .status(404)
        .send("The author with the given Id was not found.");

    res.send(author);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const author = await Author.findByIdAndRemove(req.params.id);

  if (!author)
    return res.status(404).send("The author with the given Id was not found.");

  res.send(author);
});

module.exports = router;
