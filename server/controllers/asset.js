const userModel = require("../models/user");

exports.addTransaction = async (req, res, next) => {
  const { _id, id, img, name, symbol, buyPrice, quantity } = req.body;

  const assetExist = await userModel.findOne({
    _id: req.session.userId,
    portfolios: {
      $elemMatch: { _id: _id, "assets.id": id },
    },
  });

  if (assetExist) {
    try {
      const asset = await userModel.findOneAndUpdate(
        {
          _id: req.session.userId,

          portfolios: {
            $elemMatch: { _id: _id, "assets.id": id },
          },
        },
        {
          $push: {
            "portfolios.$[p].assets.$[a].transactions": {
              buyPrice: buyPrice,
              quantity: quantity,
            },
          },
        },
        { arrayFilters: [{ "p._id": _id }, { "a.id": id }], new: true }
      );

      res.status(200).json({
        success: true,
        data: asset,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  } else {
    try {
      const asset = await userModel.findOneAndUpdate(
        {
          _id: req.session.userId,
          portfolios: { $elemMatch: { _id: _id } },
        },
        {
          $push: {
            "portfolios.$.assets": {
              id: id,
              img: img,
              name: name,
              symbol: symbol,
              transactions: {
                buyPrice: buyPrice,
                quantity: quantity,
              },
            },
          },
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        data: asset,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
};

exports.deleteAsset = async (req, res, next) => {
  const { _id, asset_id } = req.body;
  try {
    const asset = await userModel.findOneAndUpdate(
      { _id: req.session.userId, portfolios: { $elemMatch: { _id: _id } } },
      {
        $pull: {
          "portfolios.$.assets": {
            _id: asset_id,
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
