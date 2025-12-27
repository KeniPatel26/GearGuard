import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { genToken } from "../utils/generateToken.js";
import transporter from "../../config/nodemailer.js";

export const sendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpMailData = {
      from: `"AuthSystem" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Verification OTP",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; background-color: #f9f9f9;">
      <h2 style="color: #333;">Verification OTP</h2>
      <p>Hi <b>${email || "User"}</b>,</p>
      <p>We received a request to verify your account. Use the OTP below to verify your account:</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; padding: 10px 20px; font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #e0e0e0; border-radius: 8px; color: #333;">
          ${otp}
        </span>
      </div>
      <p>This OTP is valid for <b>10 minutes</b>. If you didn’t request a verification, you can safely ignore this email.</p>
      <p>Thanks,<br/>The AuthSystem Team</p>
    </div>
  `,
    };

    const existingUser = await User.findOne({ email: email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // If user does not exist, create a new user document
    if (!existingUser) {
      const newUser = new User({
        email: email,
        otp: otp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      });
      await newUser.save();
      await transporter.sendMail(otpMailData);
      return res.status(200).json({
        success: true,
        message: "OTP Sent Successfully",
      });
    }

    // If user exists, update the OTP and expiry time
    existingUser.otp = otp;
    existingUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await existingUser.save();
    await transporter.sendMail(otpMailData);

    return res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

//Register
export const register = async (req, res) => {
  const { email, password, otp } = req.body;

  if (!email || !password || !otp) {
    return res.json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({
        success: false,
        message: "User does not exist",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpiresAt < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    user.password = hashedPass;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.isVerified = true;
    await user.save();

    // const mailData = {
    //   from: `"AuthSystem" <${process.env.SENDER_EMAIL}>`,
    //   to: email,
    //   subject: "Registered Successfully",
    //   html: `
    //   <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
    //   <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    //   <h2 style="color: #333;">Welcome <span style="color: #4CAF50;">${userName}</span> to <strong>AuthSystem</strong>...!</h2>
    //   <p style="font-size: 16px; color: #555;">Your account has been created successfully with the following email:</p>
    //   <ul style="list-style: none; padding-left: 0;">
    //   <li style="padding: 10px 0; font-size: 16px; color: #333;"><strong>Email ID:</strong> ${email}</li>
    //     </ul>
    //     <p style="margin-top: 30px; font-size: 14px; color: #888;">Thank you for registering with us.</p>
    //     </div>
    //     </div>
    //     `,
    // };

    // try {
    //   await transporter.sendMail(mailData);
    // } catch (mailError) {
    //   console.error("Registration email failed:", mailError);
    // }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

//login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if ((user && !user.isVerified) || !user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    const token = genToken(user._id);
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 24 * 60 * 60 * 1000, //1day
      })
      .json({
        success: true,
        message: "Logged in successfully",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
  } catch (e) {
    console.log(e);
    return res.json({
      success: false,
      message: e.message,
    });
  }
};

//Logout
export const logout = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
    })
    .json({ success: true, message: "Logged out successfully" });
};

//Send-Reset-Password-Otp
export const sendResetPassOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "Invalid email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const otpMailData = {
      from: `"AuthSystem" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Reset Password",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; background-color: #f9f9f9;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hi <b>${email || "User"}</b>,</p>
      <p>We received a request to reset your password for your account. Use the OTP below to reset your password:</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; padding: 10px 20px; font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #e0e0e0; border-radius: 8px; color: #333;">
          ${otp}
        </span>
      </div>
      <p>This OTP is valid for <b>10 minutes</b>. If you didn’t request a password reset, you can safely ignore this email.</p>
      <p>Thanks,<br/>The AuthSystem Team</p>
    </div>
  `,
    };
    await transporter.sendMail(otpMailData);
    return res.json({
      success: true,
      message: "OTP Sent Successfully",
    });
  } catch (e) {
    console.error(e);
    return res.json({
      success: false,
      message: e.message,
    });
  }
};

//Reset-Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    //Check email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid email" });

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    //Check if OTP is expired
    if (user.otpExpiresAt < new Date())
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });

    //Hash the new password
    const hashedPass = await bcrypt.hash(newPassword, 10);
    user.password = hashedPass;

    // 5. Clear OTP data
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    //Send success email to user
    const passChangeSuccessMailData = {
      from: `"AuthSystem" <${process.env.SENDER_EMAIL}>`,
      to: email, // recipient's email
      subject: "Your Password Has Been Changed",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
      <h2 style="color: #4CAF50;">Password Changed Successfully</h2>
      <p>Hi <b>${email || "User"}</b>,</p>
      <p>This is a confirmation that your account password was changed successfully.</p>
      
      <div style="margin: 20px 0; padding: 15px; background-color: #ffffff; border-left: 5px solid #4CAF50;">
        <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleString(
          "en-IN",
          { timeZone: "Asia/Kolkata" }
        )}</p>
        <p style="margin: 0;"><strong>Account Email:</strong> ${email}</p>
      </div>
      <p>Thanks,<br/>The AuthSystem Team</p>
    </div>
  `,
    };

    await transporter.sendMail(passChangeSuccessMailData);
    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (e) {
    console.error(e);
    return res.json({
      success: false,
      message: e.message,
    });
  }
};
