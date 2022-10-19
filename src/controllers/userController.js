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
  isValidFile,
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

    // const keys = [
    //   "fname",
    //   "lname",
    //   "email",
    //   "phone",
    //   "password",
    //   "address",
    //   "profileImage",
    // ];

    // if (!Object.keys(req.body).every((elem) => keys.includes(elem))) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "wrong Parameters" });
    // }

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

      if (!isValidFile(files[0].originalname))
        return res
          .status(400)
          .send({ status: false, message: `Enter formate jpeg/jpg/png only.` });

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
      return res.status(404).send({
        status: false,
        Msg: "Please provide data in the request body!",
      });

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Email is required!" });

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email is invalid!" });
    }

    let checkEmail = await userModel.findOne({ email: email });
    if (!checkEmail) {
      return res
        .status(401)
        .send({ status: false, message: "Email Is incorrect!" });
    }
    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "Please enter password " });

    if (!isValidPassword(password)) {
      return res.status(400).send({
        status: false,
        message:
          "Password should be strong, please use one number, one upper case, one lower case and one special character and characters should be between 8 to 15 only!",
      });
    }

    let encryptPwd = checkEmail.password;

    await bcrypt.compare(password, encryptPwd, function (err, result) {
      if (result) {
        let token = jwt.sign(
          { _id: checkEmail._id.toString() },
          "plutonium-63",
          {
            expiresIn: "72h",
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

const getUserProfile = async function (req, res) {
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
      .send({
        status: true,
        message: "User profile details",
        data: userProfile,
      });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//upadateProfile

const updateProfile = async function (req, res) {
  try {
    const data = req.body;
    const userId = req.params.userId;
    const files = req.files;
    const update = {};

    const { fname, lname, email, phone, password, address } = data;

    if (!isValidBody(data) && !files) {
      return res.status(400).send({
        status: false,
        message: "Please provide data in the request body!",
      });
    }

    // const keys = [
    //   "fname",
    //   "lname",
    //   "email",
    //   "phone",
    //   "password",
    //   "address",
    //   "profileImage",
    // ];

    // if (!Object.keys(req.body).every((elem) => keys.includes(elem))) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "wrong Parameters" });
    // }

    if (fname) {
      if (!isValid(fname) || !isValidName(fname)) {
        return res
          .status(400)
          .send({ status: false, message: "fname is invalid" });
      }

      update["fname"] = fname;
    }

    if (lname) {
      if (!isValid(lname) || !isValidName(lname)) {
        return res
          .status(400)
          .send({ status: false, message: "lname is invalid" });
      }
      update["lname"] = lname;
    }

    if (email) {
      if (!isValidEmail(email)) {
        return res
          .status(400)
          .send({ status: false, message: "Email is invalid!" });
      }

      let userEmail = await userModel.findOne({ email: email });
      if (userEmail) {
        return res.status(409).send({
          status: false,
          message:
            "This email address already exists, please enter a unique email address!",
        });
      }
      update["email"] = email;
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
      update["phone"] = phone;
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

      let encryptPassword = data.password;
      update["password"] = encryptPassword;
    }

    if (address) {
      const { shipping, billing } = address;

      if (shipping) {
        const { street, city, pincode } = shipping;

        if (street) {
          if (!isValid(address.shipping.street)) {
            return res
              .status(400)
              .send({ status: false, message: "Invalid shipping street!" });
          }
          update["address.shipping.street"] = street;
        }

        if (city) {
          if (!isValid(address.shipping.city)) {
            return res
              .status(400)
              .send({ status: false, message: "Invalid shipping city!" });
          }
          update["address.shipping.city"] = city;
        }

        if (pincode) {
          if (!isValidPincode(address.shipping.pincode)) {
            return res
              .status(400)
              .send({ status: false, message: "Invalid shipping pincode!" });
          }
          update["address.shipping.pincode"] = pincode;
        }
      }

      if (billing) {
        const { street, city, pincode } = billing;

        if (street) {
          if (!isValid(address.billing.street)) {
            return res
              .status(400)
              .send({ status: false, message: "Invalid billing street!" });
          }
          update["address.billing.street"] = street;
        }

        if (city) {
          if (!isValid(address.billing.city)) {
            return res
              .status(400)
              .send({ status: false, message: "Invalid billing city!" });
          }
          update["address.billing.city"] = city;
        }

        if (pincode) {
          if (!isValidPincode(address.billing.pincode)) {
            return res
              .status(400)
              .send({ status: false, message: "Invalid billing pincode!" });
          }
          update["address.billing.pincode"] = pincode;
        }
      }
    }

    if (files && files.length > 0) {
      let uploadedFileURL = await aws.uploadFile(files[0]);

      update["profileImage"] = uploadedFileURL;
    } else if (Object.keys(data).includes("profileImage")) {
      return res
        .status(400)
        .send({ status: false, message: "please put the profileimage" });
    }

    const updateUser = await userModel.findOneAndUpdate(
      { _id: userId },
      update,
      { new: true }
    );
    return res.status(200).send({
      status: true,
      message: "user profile successfully updated",
      data: updateUser,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { createUser, loginUser, getUserProfile, updateProfile };
