const { Publisher, validate } = require("../models/publishers");

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const publishers = await Publisher.find().sort("name");

  res.send(publishers);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  let publisher = new Publisher({
    name: req.body.name,
  });

  publisher = await publisher.save();
  res.send(publisher);
});

router.get("/:id", async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);

  if (!publisher) return res.status(404).send("The publisher was not found.");

  res.send(publisher);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const publisher = await Publisher.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
    },
    { new: true }
  );

  if (!publisher)
    return res
      .status(404)
      .send("The publisher with the given Id was not found.");

  res.send(publisher);
});

router.delete("/:id", async (req, res) => {
  const publisher = await Publisher.findByIdAndRemove(req.params.id);

  if (!publisher)
    return res
      .status(404)
      .send("The publisher with the given Id was not found.");

  res.send(publisher);
});

module.exports = router;
