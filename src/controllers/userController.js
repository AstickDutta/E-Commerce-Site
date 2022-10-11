const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const aws = require("../aws/awsConfig");
const jwt = require("jsonwebtoken");

const {
  isValidBody,
  isValidName,
  isValidEmail,
  isValidNumber,
  isValid,
  isValidPassword,
  isValidPincode,
  isValidId,
} = require("../validation/validators");

const createUser = async function (req, res) {
  try {
    let data = req.body;

    const { fname, lname, email, phone, password, address } = data;

    if (!isValidBody(data)) {
      return res.status(400).send({
        status: false,
        message: "Please provide data in the request body!",
      });
    }

    if (!fname)
      return res
        .status(400)
        .send({ status: false, message: "First Name is required!" });
    if (!isValid(fname) || !isValidName(fname)) {
      return res
        .status(400)
        .send({ status: false, message: "fname is invalid" });
    }

    if (!lname)
      return res
        .status(400)
        .send({ status: false, message: "Last Name is required!" });
    if (!isValid(lname) || !isValidName(lname)) {
      return res
        .status(400)
        .send({ status: false, message: "lname is invalid" });
    }

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Email is required!" });
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email is invalid!" });
    }
    let userEmail = await userModel.findOne({ email: email });
    if (userEmail)
      return res.status(401).send({
        status: false,
        message:
          "This email address already exists, please enter a unique email address!",
      });

    if (!phone)
      return res
        .status(400)
        .send({ status: false, message: "Phone number is required!" });
    if (!isValidNumber(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Phone is invalid" });
    }
    let userNumber = await userModel.findOne({ phone: phone });
    if (userNumber)
      return res.status(409).send({
        status: false,
        message:
          "This phone number already exists, please enter a unique phone number!",
      });

    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "Password is required!" });
    if (!isValidPassword(password)) {
      return res.status(400).send({
        status: false,
        message:
          "Password should be strong, please use one number, one upper case, one lower case and one special character and characters should be between 8 to 15 only!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);

    if (!address.shipping.street)
      return res
        .status(400)
        .send({ status: false, message: "Shipping Street is required!" });
    if (!isValid(address.shipping.street)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid shipping street!" });
    }

    if (!address.shipping.city)
      return res
        .status(400)
        .send({ status: false, message: "Shipping City is required!" });
    if (!isValid(address.shipping.city)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid shipping city!" });
    }

    if (!address.shipping.pincode)
      return res
        .status(400)
        .send({ status: false, message: "Shipping Pincode is required!" });
    if (!isValidPincode(address.shipping.pincode)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid shipping pincode!" });
    }

    if (!address.billing.street)
      return res
        .status(400)
        .send({ status: false, message: "Billing Street is required!" });
    if (!isValid(address.billing.street)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid billing street!" });
    }

    if (!address.billing.city)
      return res
        .status(400)
        .send({ status: false, message: "Billing City is required!" });
    if (!isValid(address.billing.city)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid billing city!" });
    }

    if (!address.billing.pincode)
      return res
        .status(400)
        .send({ status: false, message: "Billing Pincode is required!" });
    if (!isValidPincode(address.billing.pincode)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid billing pincode!" });
    }

    let files = req.files; //aws
    if (files && files.length > 0) {
      let uploadedFileURL = await aws.uploadFile(files[0]);

      data.profileImage = uploadedFileURL;
    } else {
      return res.status(400).send({ msg: "Files are required!" });
    }

    const document = await userModel.create(data);
    return res.status(201).send({
      status: true,
      message: "user successfully created",
      data: document,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

//logIn

const loginUser = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;

    if (!isValidBody(data))
      return res.status(404).send({ status: false, Msg: "body cant be empty" });

    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter email" });
    }

    let checkEmail = await userModel.findOne({ email: email });
    if (!checkEmail) {
      return res
        .status(401)
        .send({ status: false, message: "Email Is incorrect!" });
    }
    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter password " });
    }

    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).send({ status: false, message: "NO user found" });
    }

    let encryptPwd = user.password;

    await bcrypt.compare(password, encryptPwd, function (err, result) {
      if (result) {
        let token = jwt.sign(
          { _id: checkEmail._id.toString() },
          "plutonium-63",
          {
            expiresIn: "24h",
          }
        );
        res.setHeader("x-api-key", token);

        return res.status(200).send({
          status: true,
          message: "User login successfull",
          data: { userId: checkEmail._id, token: token },
        });
      } else {
        return res
          .status(401)
          .send({ status: false, message: "Invalid password!" });
      }
    });
  } catch (err) {
    res.status(500).send({ staus: false, msg: err.message });
  }
};

//get user

const getUserProfile = async (req, res) => {
  try {
    let userId = req.params.userId;
    if (!isValidId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: " Invalid userId" });
    }

    const userProfile = await userModel.findById(userId);

    if (!userProfile) {
      return res
        .status(404)
        .send({ status: false, message: "User Profile Not Found" });
    }
    res
      .status(200)
      .send({ status: true, message: "success", data: userProfile });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//upadateProfile

const updateProfile = async function (req, res) {
  try {
    let data = req.body;
    let userId = req.params.userId;

    const { fname, lname, email, phone, password, address } = data;

    if (!isValidId(userId))
      return res
        .status(400)
        .send({ status: false, message: "UserId is invalid" });

    let verifyUser = await userModel.findOne({ _id: userId });
    if (!verifyUser)
      return res
        .status(404)
        .send({
          status: false,
          message: "This userId userId doesn't exist"
        });

    if (!isValidBody(data)) {
      return res.status(400).send({
        status: false,
        message: "Please provide data in the request body!",
      });
    }

    if (fname) {
      if (!isValid(fname) || !isValidName(fname)) {
        return res
          .status(400)
          .send({ status: false, message: "fname is invalid" });
      }
    }

    if (lname) {
      if (!isValid(lname) || !isValidName(lname)) {
        return res
          .status(400)
          .send({ status: false, message: "lname is invalid" });
      }
    }

    if (email) {
      if (!isValidEmail(email)) {
        return res
          .status(400)
          .send({ status: false, message: "Email is invalid!" });
      }

      let userEmail = await userModel.findOne({ email: email });
      if (userEmail)
        return res.status(409).send({
          status: false,
          message:
            "This email address already exists, please enter a unique email address!",
        });
    }

    if (phone) {
      if (!isValidNumber(phone)) {
        return res
          .status(400)
          .send({ status: false, message: "Phone is invalid" });
      }
      let userNumber = await userModel.findOne({ phone: phone });
      if (userNumber)
        return res.status(409).send({
          status: false,
          message:
            "This phone number already exists, please enter a unique phone number!",
        });
    }

    if (password) {
      if (!isValidPassword(password)) {
        return res.status(400).send({
          status: false,
          message:
            "Password should be strong, please use one number, one upper case, one lower case and one special character and characters should be between 8 to 15 only!",
        });
      }

      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    if (address) {
      const { shipping, billing } = address;


    if (address.shipping.street) {
      if (!isValid(address.shipping.street)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid shipping street!" });
      }
    }

    if (address.shipping.city) {
      if (!isValid(address.shipping.city)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid shipping city!" });
      }
    }

    if (address.shipping.pincode) {
      if (!isValidPincode(address.shipping.pincode)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid shipping pincode!" });
      }
    }

    if (address.billing.street) {
      if (!isValid(address.billing.street)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid billing street!" });
      }
    }

    if (address.billing.city) {
      if (!isValid(address.billing.city)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid billing city!" });
      }
    }

    if (address.billing.pincode) {
      if (!isValidPincode(address.billing.pincode)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid billing pincode!" });
      }
    }
  }
    let files = req.files; //aws

    let uploadedFileURL = await aws.uploadFile(files[0]);

    data.profileImage = uploadedFileURL;

    const updateUser = await userModel.findOneAndUpdate(
      { _id: userId },
      { $set: data, new: true }
    );
    return res.status(200).send({
      status: true,
      message: "user successfully created",
      data: updateUser,
    });

  
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { createUser, loginUser, getUserProfile, updateProfile };
