const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Address = require("../models/addressModel");
const Wishlist = require("../models/wishlistModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");

const Otp = require("../models/otpModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

/*****************      To Secure the password Using bcrypt     *********************/

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

/*****************      To Create a Transport     *********************/

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function VerifyMail(recieverEmail, recieverName) {
  const otpValue = generateOTP();

  await Otp.deleteMany({ email: recieverEmail });

  const info = await transporter.sendMail({
    from: '"PhoneZee.com" <afsalrahmanm25@gmail.com>',
    to: recieverEmail,
    subject: "Your PhoneZee OTP Code",
    html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="text-align: center; color: #333;">Hello ${recieverName},</h2>
            <p style="font-size: 16px; color: #555;">
              Thank you for using <strong>PhoneZee</strong>! To continue, please use the following OTP to verify your identity.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; background-color: #1e88e5; color: white; font-size: 28px; padding: 15px 30px; border-radius: 8px; letter-spacing: 5px;">
                ${otpValue}
              </span>
            </div>
            <p style="font-size: 14px; color: #888;">
              This OTP is valid for the next 10 minutes. If you did not request this, please ignore this message or contact support.
            </p>
            <p style="font-size: 14px; color: #888; margin-top: 40px;">
              Best regards,<br/>
              <strong>PhoneZee Team</strong>
            </p>
          </div>
        </div>
        `,
  });

  const otp = await new Otp({
    otp: otpValue,
    email: recieverEmail,
    expire_at: new Date(Date.now() + 10 * 60 * 1000),
  });

  const otpData = await otp.save();
}

// Generate a random 6-digit number
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

/*****************      To load the OTP page     *********************/

const loadOtpPage = async (req, res) => {
  try {
    // const otpData = await Otp.find({});
    res.render("otp");
  } catch (error) {
    console.log(error.message);
  }
};

/*****************      To Validate the otp entered by user     *********************/

const validateOTP = async (req, res) => {
  try {
    const joinedOTP =
      req.body["otp-digit-1"] +
      req.body["otp-digit-2"] +
      req.body["otp-digit-3"] +
      req.body["otp-digit-4"] +
      req.body["otp-digit-5"] +
      req.body["otp-digit-6"];

      console.log("User entered the OTP", joinedOTP);
    const otpData = await Otp.findOne({ otp: joinedOTP });

    if (!otpData) {
      const lastFourDigits = req.session.user_number.toString().slice(-4);
      return res.render("otp", {
        message: "Entered OTP is Incorrect",
        userEmail: req.session.user_email,
        userMobile: lastFourDigits,
      });
    } else {
      const Email = await otpData.email;
      const userData = await User.updateOne(
        { email: Email },
        {
          $set: {
            is_verified: 1,
          },
        }
      );

      userData.is_verified = 1;
      req.flash("successMessage", "User Registered successfully.");
      res.redirect("/login");
    }
  } catch (error) {
    res.render("404", { loginOrCart: req.session });
    console.log(error.message);
  }
};

/*****************      To Resend the OTP     *********************/

const resendOtp = async (req, res) => {
  try {
    const userMail = req.query.mail;
    const userName = req.query.name;
    const userMobileNumber = req.query.number;
    await Otp.deleteOne({ email: userMail });

    // Sending the VerifyMail
    let ans = await VerifyMail(userMail, userName).catch(console.error);

    res.render("otp", {
      UserMobileNumber: userMobileNumber,
      userEmail: userMail,
      userName: userName,
    });
  } catch (error) {
    res.render("404", { loginOrCart: req.session });
    console.log(error.message);
  }
};

/*********************
 *
 *
 *
 *
 *   Forgot Passwowrd
 *
 *
 *
 *
 *********************/

/*****************      To load the Forgot Password Page     *********************/

async function passwordResetMail(recieverEmail) {
  const info = await transporter.sendMail({
    from: '"PhoneZee.com " <afsalrahmanm25@gmail.com>',
    to: recieverEmail,
    subject: "Click link to Reset Password",
    html: `<p>Please, Click this link to Open 👉 <a href='http://phonezee.live/resetPassword?user=${recieverEmail}' >Click Here!</a> 👈 a Page. From there You can change the Password</p>`,
  });
}

const loadForgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword", {
      pageTitle: "Forgot Password | PhoneZee",
      loginOrCart: req.session,
    });
  } catch (error) {
    console.log(error.message);
  }
};

/*****************      To Send mail for Reser The Password     *********************/

const sendOtpForResetPassword = async (req, res) => {
  try {
    const { emailOfUser } = req.body;

    const userData = await User.findOne({ email: emailOfUser });

    if (userData.password == null) {
      res.status(200).json({ message: "User not Found" });
    } else {
      res.status(200).json({ message: "Success" });

      let ans = await passwordResetMail(emailOfUser).catch(console.error);

      if (ans) {
        console.log(ans);
      } else {
        console.log("Reset Email Success Delivered");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

/*****************      To load the Reset Password Page     *********************/

const loadResetPassword = async (req, res) => {
  try {
    res.render("resetPassword", {
      pageTitle: "Reset Password | PhoneZee",
      loginOrCart: req.session,
    });
  } catch (error) {
    console.log(error.message);
  }
};

/*****************      Controller for Resetting the Password      *********************/

const resetPassword = async (req, res) => {
  try {
    const userEmail = req.query.user;

    const { newPassword, confirmPassword } = req.body;

    const userData = await User.findOne({ email: userEmail });

    if (req.body.newPassword.trim() === "") {
      res.render("resetPassword", {
        validationMessage: "Please enter your password.",
        pageTitle: "Reset Password | PhoneZee",
        loginOrCart: req.session,
      });
    } else if (req.body.confirmPassword.trim() === "") {
      res.render("resetPassword", {
        validationMessage: "Please enter your password.",
        pageTitle: "Reset Password | PhoneZee",
        loginOrCart: req.session,
      });
    } else if (req.body.newPassword.includes(" ")) {
      res.render("resetPassword", {
        validationMessage: "Password should not contain spaces.",
        pageTitle: "Reset Password | PhoneZee",
        loginOrCart: req.session,
      });
    } else if (req.body.newPassword.length < 8) {
      res.render("resetPassword", {
        validationMessage: "Password must be at least 8 characters long.",
        pageTitle: "Reset Password | PhoneZee",
        loginOrCart: req.session,
      });
    } else if (!/[A-Z]/.test(req.body.newPassword)) {
      res.render("resetPassword", {
        validationMessage:
          "Password must contain at least one uppercase letter.",
        pageTitle: "Reset Password | PhoneZee",
        loginOrCart: req.session,
      });
    } else if (!/[a-z]/.test(req.body.newPassword)) {
      res.render("resetPassword", {
        validationMessage:
          "Password must contain at least one uppercase letter.",
        pageTitle: "Reset Password | PhoneZee",
        loginOrCart: req.session,
      });
    } else if (!/\d/.test(req.body.newPassword)) {
      res.render("resetPassword", {
        validationMessage: "Password must contain at least one number.",
        pageTitle: "Reset Password | PhoneZee",
        loginOrCart: req.session,
      });
    } else if (!/[@$!%*?&]/.test(req.body.newPassword)) {
      res.render("resetPassword", {
        validationMessage:
          "Password must contain at least one special character (@, $, !, %, *, &, ?)",
        pageTitle: "Reset Password | PhoneZee",
        loginOrCart: req.session,
      });
    } else {
      if (newPassword == confirmPassword) {
        const passwordMatch = await bcrypt.compare(
          newPassword,
          userData.password
        );

        if (!passwordMatch) {
          const hashedPassword = await securePassword(newPassword);

          userData.password = hashedPassword;

          const ans = await userData.save();

          if (ans) {
            req.flash("successMessage", "User Password Changed successfully.");
            res.redirect("/login");
          } else {
            res.render("resetPassword", {
              pageTitle: "Reset Password | PhoneZee",
              loginOrCart: req.session,
              validationMessage: "An Error Occured While Changing Password",
            });
          }
        } else {
          res.render("resetPassword", {
            pageTitle: "Reset Password | PhoneZee",
            loginOrCart: req.session,
            validationMessage: 'New Password can"t be the Old Password',
          });
        }
      } else {
        res.render("resetPassword", {
          pageTitle: "Reset Password | PhoneZee",
          loginOrCart: req.session,
          validationMessage: "Incorrect Confirm Password",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadOtpPage,
  validateOTP,
  resendOtp,
  VerifyMail,
  loadForgotPassword,
  loadResetPassword,
  sendOtpForResetPassword,
  resetPassword,
};
