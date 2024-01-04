const express = require("express");
const User = require("../models/user");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getuser = require("../middleware/getuser");
require("dotenv").config()
const JWT_SECRET = process.env.JWT_SECRET_KEY;

//ROUTE 1 : Creating a User using: POST "/api/auth/createuser", No Login Required

router.post(
  "/createuser",
  [ 
    body("password", "Password should be atleast 8 characters").isLength({
      min: 8,
    }),
    body("email", "Enter a valid email address").isEmail(),
  ],
  async (req, res) => {
    success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ success, error: "Email Already Exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        email: req.body.email,
        password: secPass,
        fullname: req.body.fullname
      });
      const data = {
          userid: user.id,
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true
      return res.json({ success, authtoken: authtoken });
    } catch (error) {
      success = false
      console.log(error);
      return res.status(500).json({ success, error: "Internal Server Error" });
    }
  }
);

// ROUTE 2 : Logging in using: POST "/api/auth/login", No Login Required

router.post(
  "/login",
  [
    body("email", "Enter a valid email address").isEmail(),
    body("password", "Password should be atleast 8 characters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ success, error: "No Such User Exists" });
      }
      const passCompare = await bcrypt.compare(password, user.password);
      if (!passCompare) {
        return res.status(400).json({ success, error: "Enter Valid Credentials" });
      }

      const data = {
          userid: user.id,
          fullname: user.fullname,
          email: user.email,
          date: user.date
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true
      return res.json({ success, authtoken: authtoken });
    } catch (error) {
      success = false
      console.log(error);
      return res.status(500).json({ success, error: "Internal Server Error" });
    }
  }
);

// ROUTE 3 : Fetch details of user Logged in using: GET "/api/auth/getuser", Login Required

router.get("/getuser", getuser, async (req, res) => {
  try {
    success = true
    let userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    return res.json({ success, user });
  } catch (error) {
    success = false
    console.log(error);
    return res.status(500).json({ success, error: "Interal Server Error" });
  }

});

module.exports = router;