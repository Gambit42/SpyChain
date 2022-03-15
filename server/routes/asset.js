//Imports
const express = require("express");
const {
  addTransaction,
  deleteAsset,
  deleteTransaction,
} = require("../controllers/asset");

//Use express router and store it in a variable
const router = express.Router();

router.post("/add", addTransaction);
router.post("/delete", deleteAsset);
router.post("/transaction/delete", deleteTransaction);

module.exports = router;
