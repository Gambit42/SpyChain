//Imports
const express = require("express");
const { login, register } = require("../controllers/auth");

//Use express router and store it in a variable
const router = express.Router();

router.post("/register", register);

router.post("/login", login);

module.exports = router;
