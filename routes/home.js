const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to the Books City");
});

module.exports = router;
