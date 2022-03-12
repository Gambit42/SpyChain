//Imports
const express = require("express");
const {
  createPortfolio,
  editPortfolio,
  deletePortfolio,
} = require("../controllers/portfolio");

//Use express router and store it in a variable
const router = express.Router();

router.post("/create", createPortfolio);
router.post("/edit", editPortfolio);
router.post("/delete", deletePortfolio);

module.exports = router;
