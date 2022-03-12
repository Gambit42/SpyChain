const userModel = require("../models/user");

exports.getCurrentUser = async (req, res) => {
  const user = await userModel.findById(req.session.userId);
  try {
    return res.status(200).json({ success: true, user: user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};
