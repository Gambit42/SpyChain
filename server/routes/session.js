//Imports
const express = require("express");
const { ongoing, terminate } = require("../controllers/session");

//Use express router and store it in a variable
const router = express.Router();

router.get("/ongoing", ongoing);
router.get("/terminate", terminate);

module.exports = router;
