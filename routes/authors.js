const { Author, validate } = require("../models/author");

const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const authors = await Author.find().sort("lastName");

  res.send(authors);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const author = new Author(
    _.pick(req.body, ["firstName", "middleName", "lastName"])
  );

  await author.save();
  res.send(author);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const author = await Author.findById(req.params.id);

  if (!author) return res.status(404).send("The author was not found.");

  res.send(author);
});

router.put("/:id", [validateObjectId, auth], async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const author = await Author.findByIdAndUpdate(
    req.params.id,
    _.pick(req.body, ["firstName", "middleName", "lastName"]),
    { new: true }
  );

  if (!author)
    return res.status(404).send("The author with the given Id was not found.");

  res.send(author);
});

router.delete("/:id", [validateObjectId, auth, admin], async (req, res) => {
  const author = await Author.findByIdAndRemove(req.params.id);

  if (!author)
    return res.status(404).send("The author with the given Id was not found.");

  res.send(author);
});

module.exports = router;
