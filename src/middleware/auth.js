const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const { isValidId } = require("../validation/validators");

//athentication

const authenticate = function (req, res, next) {
  try {
    let token = req.headers["authorization"];

    if (!token)
      return res.status(400).send({ status: false, message: "token is required" });

    token = token.split(" ");
    
    jwt.verify(token[1], "plutonium-63", function (error, decodedtoken) {
      if (error)
        return res
          .status(401)
          .send({ status: false, message: "token is invalid or expired" });

      req["decodedtoken"] = decodedtoken;

      next();
    });
    
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

//authorisation

const authorisation = async function (req, res, next) {
  try {
    let updateuserId = req.params.userId;

    if (!isValidId(updateuserId)) {
      return res.status(400).send({
        status: false,
        message: "Please provide valid UserId for details",
      });
    }

    let updatinguserId = await userModel.findById({ _id: updateuserId });
    if (!updatinguserId) {
      return res
        .status(404)
        .send({ status: false, message: "No user details found with this id" });
    }
    let userId = updatinguserId._id;
    let id = req.decodedtoken._id;
    if (id != userId)
      return res.status(403).send({
        status: false,
        message: "You are not authorised to perform this task",
      });

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

module.exports = { authenticate, authorisation };
