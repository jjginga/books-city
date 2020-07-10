const { Publisher, validate } = require("../models/publisher");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");

const _ = require("lodash");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const publishers = await Publisher.find().sort("name");

  res.send(publishers);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const publisher = new Publisher(_.pick(req.body, ["name"]));

  await publisher.save();
  res.send(publisher);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);

  if (!publisher) return res.status(404).send("The publisher was not found.");

  res.send(publisher);
});

router.put("/:id", [validateObjectId, auth], async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const publisher = await Publisher.findByIdAndUpdate(
    req.params.id,
    _.pick(req.body, ["name"]),
    { new: true }
  );

  if (!publisher)
    return res
      .status(404)
      .send("The publisher with the given Id was not found.");

  res.send(publisher);
});

router.delete("/:id", [validateObjectId, auth, admin], async (req, res) => {
  const publisher = await Publisher.findByIdAndRemove(req.params.id);

  if (!publisher)
    return res
      .status(404)
      .send("The publisher with the given Id was not found.");

  res.send(publisher);
});

module.exports = router;
