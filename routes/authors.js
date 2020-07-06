const { Author, validate } = require("../models/authors");

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const authors = await Author.find().sort("lastName");

  res.send(authors);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  let author = new Author({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    middleName: req.body.middleName,
  });

  author = await author.save();
  res.send(author);
});

router.get("/:id", async (req, res) => {
  const author = await Author.findById(req.params.id);

  if (!author) return res.status(404).send("The author was not found.");

  res.send(author);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const author = await Author.findByIdAndUpdate(
    req.params.id,
    {
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,
    },
    { new: true }
  );

  if (!author)
    return res.status(404).send("The author with the given Id was not found.");

  res.send(author);
});

router.delete("/:id", async (req, res) => {
  const author = await Author.findByIdAndRemove(req.params.id);

  if (!author)
    return res.status(404).send("The author with the given Id was not found.");

  res.send(author);
});

module.exports = router;
