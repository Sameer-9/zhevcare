import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { findOne, save } from "../models/user.js";
import redisClient from "../config/redis.js";
import { verifyRegistrationNo } from "../services/index.js";

/**
 * Utility function to generate JWT
 * @param {Object} user - The user object containing id, email, phone, and role
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

/**
 * Utility function to hash password
 * @param {string} password - The plain text password
 * @returns {Promise<string>} - The hashed password
 */
const hashPassword = async (password) => {
  return await argon2.hash(password);
};

/**
 * Register a new user (Patient or Doctor)
 * @route POST /register
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} role - Role of the user, either 'PATIENT' or 'DOCTOR'
 * @body {string} name - User's name
 * @body {string} phone - User's phone number
 * @body {string} email - User's email
 * @body {string} password - User's password
 * @body {string} confirmPassword - User's confirmation password
 * @body {string} [registrationNo] - Doctor's registration number (optional for 'PATIENT')
 * @returns {Object} JSON response with success or error message
 */
const registerUser = async (req, res, role) => {
  const { name, phone, email, password, confirmPassword, registrationNo } =
    req.body;

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  try {
    const existingUser = await findOne({ phone });
    console.log("existingUser", existingUser);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    let isVerified = false;
    if (role === "DOCTOR" && registrationNo) {
      isVerified = await verifyRegistrationNo(registrationNo);
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
      name,
      phone,
      email,
      password: hashedPassword,
      role,
      registrationNo: role === "DOCTOR" ? registrationNo : null,
      isverified: isVerified,
    };

    await save(newUser);
    return res
      .status(201)
      .json({ success: true, message: "Registration Successfull!" });
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Register a new patient
 * @route POST /register/patient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * sample json body
 * {
    "name": "Sameer Shaikh",
    "phone": "8879338546",
    "email": "sameer.shaikh.EXT@nmims.edu",
    "password": "pass@123",
    "confirmPassword": "pass@123"
  }
 */
export const registerPatient = (req, res) => registerUser(req, res, "PATIENT");

/**
 * Register a new doctor
 * @route POST /register/doctor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * sample json body
 * {
    "name": "Sameer Shaikh",
    "phone": "8879338546",
    "email": "sameer.shaikh.EXT@nmims.edu",
    "password": "pass@123",
    "confirmPassword": "pass@123",
    "registrationNo": "121212"
  }
 */
export const registerDoctor = (req, res) => registerUser(req, res, "DOCTOR");

/**
 * Authenticate user and generate JWT
 * @route POST /login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @body {string} phone - User's phone number
 * @body {string} password - User's password
 * @returns {Object} JSON response with success message and JWT token in headers
 */
export const authenticate = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await findOne({ phone });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordMatch = await argon2.verify(user.password, password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = generateToken(user);

    console.log("token", token);
    // Store the token in Redis with an expiration of 1 day
    await redisClient.setEx(JSON.stringify(user), 86400, token);
  
    // Send token in response header
    res.setHeader("token", token);
    return res
      .status(200)
      .json({ success: true, message: "User authenticated" });
  } catch (error) {
    console.error("Authentication error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Logout user and invalidate JWT
 * @route POST /logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @header {string} Authorization - Bearer JWT token
 * @returns {Object} JSON response with success message
 */
export const logout = (req, res) => {
  const token = req.headers.token;
  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verify error:", err);
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const userId = decoded.id;

    // Remove the token from Redis to invalidate it
    redisClient.del(userId.toString(), (err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Error logging out" });
      }

      return res
        .status(200)
        .json({ success: true, message: "User logged out" });
    });
  });
};
