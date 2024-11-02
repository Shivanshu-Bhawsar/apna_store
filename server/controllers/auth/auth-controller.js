const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

//register
exports.registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error occured in register user!",
    });
  }
};

//login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "60m" }
    );    

    const isProduction = process.env.NODE_ENV === "production";
    console.log("por: ", isProduction)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // Use secure cookies in production
      sameSite: isProduction ? "none" : "lax", // Required for cross-origin in HTTPS
    })
    .json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error occured in login user!",
    });
  }
};

//logout
exports.logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised user!",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};
