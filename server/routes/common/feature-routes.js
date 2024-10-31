const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
} = require("../../controllers/common/feature-controller");

const router = express.Router();

router.get("/get", getFeatureImages);
router.post("/add", addFeatureImage);
router.post("/delete", deleteFeatureImage);

module.exports = router;
