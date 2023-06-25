const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Staff = require("../models/staff");
const Visitor = require("../models/visitor");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.createStaff = async (req, res, next) => {
  try {
    // Get the staff data from the request body
    const {
      fullName,
      email,
      password,
      phone,
      address,
      employerId,
      department,
      dob,
      gender,
      profileImage,
    } = req.body;

    // Check if any required fields are missing
    if (
      !fullName ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !department ||
      !gender
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the staff
    const staff = await Staff.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      address,
      employerId,
      department,
      dob,
      gender,
      profileImage, // Assuming you are using a file upload middleware and storing the file path in req.file.path
    });

    // Return the created staff
    res.status(201).json({ success: true, staff });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    // Get the login credentials from the request body
    const { email, password } = req.body;

    // Check if any required fields are missing
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Find the staff by email
    const staff = await Staff.findOne({ email });

    // If the staff is not found, return an error
    if (!staff) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, staff.password);

    // If the passwords don't match, return an error
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: staff._id, name: staff.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return the token
    res.status(200).json({ success: true, token });
  } catch (err) {
    next(err);
  }
};
exports.inviteVisitor = async (req, res, next) => {
  try {
    const { email, staffId } = req.body;

    // Check if any required fields are missing
    if (!email || !staffId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Check if the staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    // Send email invite to the visitor
    const emailSubject = "Invitation to schedule a visit";
    const emailContent = `Dear Visitor, you are invited to schedule a visit. Please visit our website to schedule a visit.`;

    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "godsfavour1975@gmail.com",
        pass: "wgxlzkknrpdwofds",
      },
    });

    // Send mail with defined transport object
    await transporter.sendMail({
      from: "godsfavour1975@gmail.com",
      to: email,
      subject: emailSubject,
      text: emailContent,
    });

    res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
    });
  } catch (err) {
    next(err);
  }
};
