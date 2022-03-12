const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const transactionSchema = new mongoose.Schema({
  buyPrice: {
    type: Number,
    required: [true, "Set a buy price."],
  },
  quantity: {
    type: Number,
    required: [true, "Set a quantity"],
  },
});

const assetSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  img: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: false,
  },
  price_change_percentage_24hr: {
    type: Number,
    required: false,
  },
  transactions: [transactionSchema],
});

const portfolioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name."],
    unique: true,
  },
  assets: [assetSchema],
  active: {
    type: Boolean,
    default: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Please provide a username."],
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },

    portfolios: [portfolioSchema],
  },
  { collection: "users" }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("user", userSchema);
