const express = require("express");
const { getCurrentUser } = require("../controllers/user");

//Use express router and store it in a variable
const router = express.Router();

router.get("/", getCurrentUser);

module.exports = router;
