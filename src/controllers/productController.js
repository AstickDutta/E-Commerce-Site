const productModel = require("../models/productModel");
const aws = require("../aws/awsConfig");
const {
  isValidBody,
  isValid,
  isValidSize,
  isValidPrice,
} = require("../validation/validators");

const createProduct = async function (req, res) {
  try {
    let data = req.body;

    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
    } = data;

    if (!isValidBody(data)) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide data in request body" });
    }

    if (!title)
      return res
        .status(400)
        .send({ status: false, message: "Title is required!" });
    if (!isValid(title)) {
      return res.status(400).send({ status: false, msg: "Title is invalid!" });
    }

    let uniquetitle = await productModel.findOne({ title: title });
    if (uniquetitle)
      return res.status(400).send({
        status: false,
        msg: "This title already exists, please enter another title.",
      });

    if (!description)
      return res
        .status(400)
        .send({ status: false, message: "Description is required!" });
    if (!isValid(description)) {
      return res.status(400).send({ status: false, msg: "fname is invalid!" });
    }

    if (!price)
      return res
        .status(400)
        .send({ status: false, message: "Price is required!" });
    if (!isValid(price) && !isValidPrice(price)) {
      return res.status(400).send({ status: false, msg: "Price is invalid!" });
    }

    currencyId = currencyId.toUpperCase();

    if (!currencyId)
      return res
        .status(400)
        .send({ status: false, message: "Currency Id is required!" });
    if (currencyId != "INR")
      return res.status(400).send({
        status: false,
        msg: "Please provide the currencyId as `INR`!",
      });

    if (!currencyFormat)
      return res
        .status(400)
        .send({ status: false, message: "Currency Format is required!" });
    if (currencyFormat != "₹")
      return res.status(400).send({
        status: false,
        msg: "Please provide the currencyformat as `₹`!",
      });

    if (!(isFreeShipping == "true" || isFreeShipping == "false")) {
      return res.status(400).send({
        status: false,
        msg: "isFreeShipping should either be True, or False.",
      });
    }

    let files = req.files; //aws
    if (files && files.length > 0) {
      let uploadedFileURL = await aws.uploadFile(files[0]);

      data.productImage = uploadedFileURL;
    } else {
      return res.status(400).send({ msg: "Files are required!" });
    }

    if (!isValid(style)) {
      return res.status(400).send({ status: false, msg: "Style is invalid" });
    }

    if (!availableSizes)
      return res
        .status(400)
        .send({ status: false, message: " 'AvailableSizes' is required!" });

    if (!isValid(availableSizes) || !isValidSize(availableSizes)) {
      return res.status(400).send({
        status: false,
        message: "size should be a valid format- XS, S, M, L, XL, XXL",
      });
    }

    if (!isValid(installments) || !isValidPrice(installments)) {
      return res
        .status(400)
        .send({ status: false, msg: " 'Installments' is invalid." });
    }

    const document = await productModel.create(data);
    res.status(201).send({ status: true, data: document });
  } catch (err) {
    res.status(500).send({ staus: false, msg: err.message });
  }
};

module.exports = { createProduct };
