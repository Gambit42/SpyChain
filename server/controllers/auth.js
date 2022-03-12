const userModel = require("../models/user");

exports.register = async (req, res, next) => {
  const { userName, password } = req.body;
  const registeredUserUsername = await userModel.findOne({ userName });

  if (registeredUserUsername) {
    return res.status(401).json({
      success: false,
      error: "Username is already taken.",
    });
  }

  try {
    const user = await userModel.create({
      userName,
      password,
      portfolios: [{ name: "Main Portfolio", active: true, assets: [] }],
    });

    user.save();
    req.session.userId = user._id;
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Please provide username and password." });
  }

  try {
    const user = await userModel.findOne({ userName }).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    const isMatch = await user.matchPasswords(password);
    if (!isMatch) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid credentials." });
    }

    // req.session.userId = user._id;
    req.session.userId = user._id;
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
