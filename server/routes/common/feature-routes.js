const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
} = require("../../controllers/common/feature-controller");

const router = express.Router();

router.get("/get", getFeatureImages);
router.post("/add", addFeatureImage);

module.exports = router;
