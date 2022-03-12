//Imports
const express = require("express");
const { addTransaction, deleteAsset } = require("../controllers/asset");

//Use express router and store it in a variable
const router = express.Router();

router.post("/add", addTransaction);
router.post("/delete", deleteAsset);

module.exports = router;
