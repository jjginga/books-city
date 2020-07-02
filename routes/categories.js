const Joi = require("@hapi/joi");

const express = require("express");
const router = express.Router();

const categories = [
  { id: 1, name: "arts & music" },
  { id: 2, name: "biographies" },
  { id: 3, name: "business" },
  { id: 4, name: "comics" },
  { id: 5, name: "computers & tech" },
  { id: 6, name: "cooking" },
  { id: 7, name: "edu & reference" },
  { id: 8, name: "entertainment" },
  { id: 9, name: "health & fitness" },
  { id: 10, name: "history" },
  { id: 11, name: "hobbies & crafts" },
  { id: 12, name: "home & garden" },
  { id: 13, name: "horror" },
  { id: 14, name: "kids" },
  { id: 15, name: "literature & fiction" },
  { id: 16, name: "medical" },
  { id: 17, name: "mysteries" },
  { id: 18, name: "parenting" },
  { id: 19, name: "religion" },
  { id: 20, name: "romance" },
  { id: 21, name: "sci-fi & fantasy" },
  { id: 22, name: "sports" },
  { id: 23, name: "teen" },
  { id: 24, name: "true crime" },
];

router.get("/", (req, res) => {
  res.send(categories);
});

router.post("/", (req, res) => {
  const { error } = validateCategory(req.body);

  if (error) return res.status(400).send(error[0].message);

  const category = {
    if: categories.length + 1,
    name: req.body.name,
  };

  categories.push(category);
  res.send(category);
});

router.get("/:id", (req, res) => {
  const category = getCategory(parseInt(req.params.id));

  if (!category) return res.status(404).send("The category was not found");

  res.send(category);
});

router.put("/:id", (req, res) => {
  const category = getCategory(parseInt(req.params.id));

  if (!category)
    return res
      .status(404)
      .send("The category with the given ID was not found!");

  const { error } = validateCategory(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  category.name = req.body.name;

  res.send(category);
});

router.delete("/:id", (req, res) => {
  const category = getCategory(parseInt(req.params.id));

  if (!category)
    return res.status(404).send("The category with the given ID was not found");

  const index = categories.indexOf(category);

  categories.splice(index, 1);

  res.send(category);
});

function getCategory(id) {
  return categories.find((c) => c.id === id);
}

function validateCategory(category) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });

  return schema.validate(category);
}

module.exports = router;
