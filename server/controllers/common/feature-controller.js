const Feature = require("../../models/Feature");

exports.getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error occured in get feature images!",
    });
  }
};

exports.addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;

    const featureImages = new Feature({
      image,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error occured in add feature image!",
    });
  }
};

exports.deleteFeatureImage = async (req, res) => {
  try {
    const { imageId } = req.body;

    const image = await Feature.findByIdAndDelete(imageId);
    if (!image) {
      return res.json({
        success: false,
        message: "Image not found",
      });
    }

    res.status(201).json({
      success: true,
      message: "Feature image deleted successfully",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error occured in delete feature image!",
    });
  }
};
