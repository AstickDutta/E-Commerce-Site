const productModel = require("../models/productModel");
const aws = require("../aws/awsConfig");
const {
  isValid,
  isValidAvailableSizes,
  isValidBody,
  isValidInstallment,
  isValidPrice,
  isValidId,
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

    // if (title || title == "") {
    if (!isValid(title)) {
      return res.status(400).send({ status: false, msg: "Title is invalid!" });
    }
    // }

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
    // if (description || description == "") {
    if (!isValid(description)) {
      return res
        .status(400)
        .send({ status: false, msg: "descritions is invalid!" });
    }
    // }

    if (!price)
      return res
        .status(400)
        .send({ status: false, message: "Price is required!" });
    // if (price || price == "") {
    if (!isValidPrice(price)) {
      return res
        .status(400)
        .send({ status: false, message: "Price is invalid!" });
    }
    // }

    // currencyId = currencyId.toUpperCase();

    if (!currencyId)
      return res
        .status(400)
        .send({ status: false, message: "Currency Id is required!" });
    // if (currencyId || currencyId == "") {
    if (currencyId != "INR")
      return res.status(400).send({
        status: false,
        msg: "Please provide the currencyId as `INR`!",
      });
    // }

    if (!currencyFormat)
      return res
        .status(400)
        .send({ status: false, message: "Currency Format is required!" });
    // if (currencyFormat || currencyFormat == "") {
    if (currencyFormat != "₹")
      return res.status(400).send({
        status: false,
        message: "Please provide the currencyformat as `₹`!",
      });
    // }

    // if (isFreeShipping || isFreeShipping == "") {
    if (!(isFreeShipping == "true" || isFreeShipping == "false")) {
      return res.status(400).send({
        status: false,
        message: "isFreeShipping should either be True, or False.",
      });
    }
    // }

    let files = req.files; //aws

    if (files && files.length > 0) {
      let uploadedFileURL = await aws.uploadFile(files[0]);

      data.productImage = uploadedFileURL;
    } else {
      return res.status(400).send({ message: "Files are required!" });
    }

    // if (style || style == "") {
    if (!isValid(style)) {
      return res
        .status(400)
        .send({ status: false, message: "Style is invalid" });
    }
    // }

    if (availableSizes || availableSizes == "") {
      availableSizes = availableSizes.split(",").map((x) => x.trim());
      data.availableSizes = availableSizes;
      if (!isValidAvailableSizes(availableSizes))
        return res.status(400).send({
          status: false,
          message: "availableSizes is required or put valid sizes",
        });
    }
    if (installments) {
      if (!isValidInstallment(installments))
        return res.status(400).send({
          status: false,
          message: "Installments should be a Number only",
        });
    }

    const document = await productModel.create(data);
    res.status(201).send({ status: true, data: document });
  } catch (err) {
    res.status(500).send({ staus: false, message: err.message });
  }
};

//===================================================================================

const getProduct = async function (req, res) {
  try {
    const { size, name, priceGreaterThan, priceLessThan, priceSort } =
      req.query;

    const filter = { isDeleted: false };
    if (size) {
      let newsize = size.split(",").map((x) => x.trim());
      if (!isValidAvailableSizes(newsize))
        return res.status(400).send({
          status: false,
          message: "availableSizes is required or put valid sizes",
        });
      filter.availableSizes = size;
    }
    if (name) {
      if (!isValid(name))
        return res
          .status(400)
          .send({ status: false, message: "Invalid naming format!" });
      filter.title = name;
    }

    if (priceGreaterThan) {
      if (!isValidPrice(priceGreaterThan))
        return res
          .status(400)
          .send({ status: false, message: "Invalid price format 1!" });
      filter.price = { $gte: priceGreaterThan };
    }
    if (priceLessThan) {
      if (!isValidPrice(priceLessThan))
        return res
          .status(400)
          .send({ status: false, message: "Invalid price format 2!" });
      filter.price = { $lte: priceLessThan };
    }
    if (priceGreaterThan && priceLessThan) {
      if (!isValidPrice(priceGreaterThan) || !isValidPrice(priceLessThan))
        return res
          .status(400)
          .send({ status: false, message: "Invalid price format 3!" });
      if (priceGreaterThan < priceLessThan) {
        filter.price = { $gte: priceGreaterThan, $lte: priceLessThan };
      } else
        return res.status(400).send({
          status: false,
          message: "priceGreaterThan is always higher than priceLessThan",
        });
    }

    if (priceSort) {
      if (priceSort == 1) {
        const pro = await productModel.find(filter).sort({ price: 1 });
        if (!pro) {
          return res.status(404).send({
            status: false,
            message: "No data found that matches your search 1",
          });
        }
        return res.status(200).send({ status: true, message: pro });
      }
      if (priceSort == -1) {
        const newpro = await productModel.find(filter).sort({ price: -1 });
        if (!newpro) {
          return res.status(404).send({
            status: false,
            message: "No data found that matches your search 2",
          });
        }
        return res.status(200).send({ status: true, message: newpro });
      }
    }
    //  const finaldata = await productModel.find({title : /ABCD/})
    const finaldata = await productModel.find({ ...filter });

    if (!finaldata || finaldata == null || finaldata.length == 0) {
      return res.status(404).send({
        status: true,
        message: "No data found that matches your search 3",
      });
    }

    return res.status(200).send({ status: true, message: finaldata });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

//=============================================================================================================

const updateProduct = async function (req, res) {
  try {
    const data = req.body;
    const productId = req.params.productId;
    const files = req.files;
    const update = {};

    const {
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

    if (!isValidBody(data) && !files) {
      return res.status(400).send({
        status: false,
        message: "Please provide data in the request body!",
      });
    }

    const keys = [
      "title",
      "description",
      "price",
      "currencyId",
      "currencyFormat",
      "isFreeShipping",
      "style",
      "availableSizes",
      "installments",
    ];

    if (!Object.keys(req.body).every((elem) => keys.includes(elem))) {
      return res
        .status(400)
        .send({ status: false, message: "wrong Parameters" });
    }

    if (title || title === "") {
      title = title.trim();
      if (!isValid(title)) {
        return res
          .status(400)
          .send({ status: false, message: "title is invalid" });
      }
      const uniquetitle = await productModel.findOne({ title: title });
      if (uniquetitle) {
        return res
          .status(409)
          .send({ status: false, message: "title is already present" });
      }
      update.title = title;
    }

    if (description || description === "") {
      description = description.trim();
      if (!isValid(description)) {
        return res
          .status(400)
          .send({ status: false, message: "description is invalid" });
      }
      update.description = description;
    }

    if (price || price === "") {
      price = price.trim();
      if (!isValidPrice(price)) {
        return res
          .status(400)
          .send({ status: false, message: "Price is invalid!" });
      }
      update.price = price;
    }

    if (currencyId || currencyId === "") {
      currencyId = currencyId.trim();
      if (!isValid(currencyId)) {
        return res
          .status(400)
          .send({ status: false, message: "currencyId is invalid!" });
      }
      if (currencyId !== "INR") {
        return res.status(400).send({
          status: false,
          message: "Please provide the currencyId as `INR`!",
        });
      }
      update.currencyId = currencyId;
    }

    if (currencyFormat || currencyFormat === "") {
      currencyFormat = currencyFormat.trim();
      if (!isValid(currencyFormat)) {
        return res
          .status(400)
          .send({ status: false, message: "currencyFormat is invalid!" });
      }

      if (currencyFormat != "₹") {
        return res
          .status(400)
          .send({
            status: false,
            message: "Please provide the currencyformat as `₹`!",
          });
      }
      update.currencyFormat = currencyFormat;
    }

    if (files && files.length > 0) {
      let uploadedFileURL = await aws.uploadFile(files[0]);

      update["profileImage"] = uploadedFileURL;
    }

    if (style || style === "") {
      style = style.trim();
      if (!isValid(style)) {
        return res
          .status(400)
          .send({ status: false, message: "Style is invalid!" });
      }
      update.style = style;
    }

    if (installments || installments === "") {
      installments = installments.trim();
      if (!isValidInstallment(installments)) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Installments should be a Number only",
          });
      }
      update.installments = installments;
    }

    if (availableSizes || availableSizes == "") {
      availableSizes = availableSizes.split(",").map((x) => x.trim());
      // data.availableSizes = availableSizes;
      if (!isValidAvailableSizes(availableSizes))
        return res.status(400).send({
          status: false,
          message: "availableSizes is required or put valid sizes",
        });
      update.availableSizes = availableSizes;
    }

    if (!(isFreeShipping == "true" || isFreeShipping == "false")) {
      return res.status(400).send({
        status: false,
        message: "isFreeShipping should either be True, or False.",
      });
    }

    if (!isValidId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Product-id is not valid!" });
    }

    const CheckProduct = await productModel.findById(productId);
    if (!CheckProduct) {
      return res.status(404).send({ status: false, message: "Product not found!" });
    }
  } catch (error) {
    res.status(500).send({ status: false, err: error.message });
  }
};


module.exports = { createProduct, getProduct, updateProduct };
