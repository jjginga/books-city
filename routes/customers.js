const { Customer, validate: validateCustomer } = require("../models/customer");

const _ = require("lodash");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");

router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("name");

  res.send(customers);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).send("The customer doesn't exist.");

  res.send(customer);
});

router.post("/", [auth, validate(validateCustomer)], async (req, res) => {
  const customer = new Customer(_.pick(req.body, ["name", "phone"]));
  await customer.save();

  res.send(customer);
});

router.put(
  "/:id",
  [auth, validateObjectId, validate(validateCustomer)],
  async (req, res) => {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      _.pick(req.body, ["name", "phone"]),
      { new: true }
    );

    if (!customer)
      res.status(404).send("The customer with the given ID doesn't exist.");

    res.send(customer);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID wasn't not found.");

  res.send();
});

module.exports = router;
