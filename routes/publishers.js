const { Publisher, validatePublisher } = require("../models/publisher");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");

const _ = require("lodash");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const publishers = await Publisher.find().sort("name");

  res.send(publishers);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);
  if (!publisher) return res.status(404).send("The publisher was not found.");

  res.send(publisher);
});

router.post("/", [auth, validate(validatePublisher)], async (req, res) => {
  const publisher = new Publisher(_.pick(req.body, ["name"]));

  await publisher.save();
  res.send(publisher);
});

router.put(
  "/:id",
  [auth, validateObjectId, validate(validatePublisher)],
  async (req, res) => {
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
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const publisher = await Publisher.findByIdAndRemove(req.params.id);

  if (!publisher)
    return res
      .status(404)
      .send("The publisher with the given Id was not found.");

  res.send(publisher);
});

module.exports = router;
