const express = require("express");
const path = require("path");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const fetchuser = require('../middleware/getuser')
const Booking = require('../models/bookings')

// ROUTE 1 : Fetching All bookings by UserID on: GET "/api/bookings/fetchbooking/", Login Required
router.get("/fetchbooking", fetchuser, async (req, res) => {
  try {
    let bookings = await Booking.find({ userid: req.user.userid }).sort({date: -1})

    if (!bookings) {
      return res.status(404).json({ success, msg: "The booking does not Exists Anymore" })
    }
    return res.send(bookings)
  } catch (error) {
    success = false
    console.log(error);
    return res.status(500).json({ success, error: "Internal Server Error" });
  }
});

// ROUTE 2 : Adding a New booking on: POST "/api/bookings/addbooking", Login Required
router.post("/addbooking", fetchuser, [
  body('additional_info', 'Max limit 500 characters').isLength({ max: 500 }),
  body('venue', 'Max limit 250 characters').isLength({ max: 250 }),
], async (req, res) => {
  success = false
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  const {  userid, fullname, email, artist_name, artist_image, venue, additional_info, date, category, event1, budget, capacity} = req.body
  try {
    const booking = new Booking({
      artist_name: artist_name,
      artist_image:artist_image,
      venue:venue,
      additional_info: additional_info,
      date:date,
      category:category,
      event:event1,
      budget:budget,
      capacity:capacity,
      userid:userid,
      fullname:fullname,
      email:email,
    })

    await booking.save()
    success = true
    return res.json({ success, msg: "Booking Added Successfully!" })

  } catch (error) {
    success = false
    console.log(error);
    return res.status(500).json({ success, error: "Internal Server Error" });
  }
});

// ROUTE 3 : Deleting an Exisiting booking on: DELETE "/api/bookings/deletebooking/:id", Login Required
router.delete("/deletebooking/:id", fetchuser, async (req, res) => {
  success = false
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  try {
    let booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ success, msg: "The booking does not Exists Anymore" })
    }

    if (booking.userid.toString() !== req.user.userid) {
      return res.status(401).json({ success, msg: "Action Not Allowed" })
    }

    booking = await Booking.findByIdAndDelete(req.params.id)
    success = true
    return res.json({ success, msg: "Booking Deleted Successfully" })

  } catch (error) {
    success = false
    console.log(error);
    return res.status(500).json({ success, error: "Internal Server Error" });
  }
})

module.exports = router;