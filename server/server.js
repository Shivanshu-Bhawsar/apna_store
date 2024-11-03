const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const dbConnect = require("./helpers/database");
const { upload, imageUploadUtil } = require("./helpers/cloudinary");

const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
dbConnect();

// middleware setup
app.use(cookieParser());
app.use(express.json());

const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: isProduction
      ? "https://apna-store-client.netlify.app" // Replace with your actual frontend production URL
      : "http://localhost:5173", // Development URL
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true, // Allow cookies to be sent in CORS requests
  })
);

// Add route to handle image upload using Cloudinary
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const result = await imageUploadUtil(req.file);
    res.json({ message: "Upload successful", url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: "Upload failed", details: error.message });
  }
});

// route handlers
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/common/feature", commonFeatureRouter);

// start server
app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));

// default route
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Your server is up and running....",
  });
});
