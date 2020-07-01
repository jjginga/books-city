const Joi = require("@hapi/joi");

const express = require("express");
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

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

app.get("/", (req, res) => {
  res.send("Welcome to the Books City");
});

app.get("/api/categories", (req, res) => {
  res.send(categories);
});

app.get("/api/categories/:id", (req, res) => {
  const category = getCategory(parseInt(req.params.id));

  if (!category) return res.status(404).send("The category was not found");

  res.send(category);
});

app.post("/api/categories", (req, res) => {
  const { error } = validateCategory(req.body);

  if (error) return res.status(400).send(error[0].message);

  const category = {
    if: categories.length + 1,
    name: req.body.name,
  };

  categories.push(category);
  res.send(category);
});

app.put("/api/categories/:id", (req, res) => {
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

app.delete("/api/categories/:id", (req, res) => {
  const category = getCategory(parseInt(req.params.id));

  if (!category)
    return res.status(404).send("The category with the given ID was not found");

  const index = categories.indexOf(category);
  categories.splice(index, 1);

  res.send(category);
});

app.listen(port, () => console.log(`Listening on port ${port}...`));

function getCategory(id) {
  return categories.find((c) => c.id === id);
}

function validateCategory(category) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });

  return schema.validate(category);
}
