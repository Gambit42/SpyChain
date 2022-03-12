const userModel = require("../models/user");

exports.createPortfolio = async (req, res, next) => {
  const { portfolioName } = req.body;
  const duplicate_portfolioName = await userModel.findOne({
    _id: req.session.userId,
    portfolios: { $elemMatch: { name: portfolioName } },
  });

  if (duplicate_portfolioName) {
    return res.status(401).json({
      success: false,
      error: "Portfolio already in use.",
    });
  }

  try {
    const portfolio = await userModel.findOneAndUpdate(
      { _id: req.session.userId },
      {
        $push: {
          portfolios: {
            name: portfolioName,
            assets: [],
            active: true,
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.editPortfolio = async (req, res, next) => {
  const { _id, portfolioName } = req.body;
  const duplicate_portfolioName = await userModel.findOne({
    _id: req.session.userId,
    portfolios: { $elemMatch: { name: portfolioName } },
  });

  if (duplicate_portfolioName) {
    return res.status(401).json({
      success: false,
      error: "Portfolio already in use.",
      data: duplicate_portfolioName,
    });
  }

  try {
    const portfolio = await userModel.findOneAndUpdate(
      {
        _id: req.session.userId,
        portfolios: { $elemMatch: { _id: _id } },
      },
      {
        $set: {
          "portfolios.$.name": portfolioName,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deletePortfolio = async (req, res) => {
  const { _id } = req.body;

  //To access value not as JSON, we need to use exec function
  userModel
    .findOne({ _id: req.session.userId }, "portfolios")
    .exec(async (err, result) => {
      if (err) {
        return err;
      }

      if (result.portfolios.length !== 1) {
        try {
          const portfolio = await userModel.findOneAndUpdate(
            {
              _id: req.session.userId,
              portfolios: { $elemMatch: { _id: _id } },
            },
            {
              $pull: {
                portfolios: {
                  _id: _id,
                },
              },
            },
            { new: true }
          );

          res.status(200).json({
            success: true,
            data: portfolio,
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: error.message,
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: "Cannot delete remaining portfolio.",
        });
      }
    });
};
