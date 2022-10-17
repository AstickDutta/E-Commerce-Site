let productModel = require("../models/productModel");
let aws = require("../aws/awsConfig");
let {
  isValidBody,
  isValid,
  isValidPrice,
  isValidAvailableSizes,
  isValidId,
  isValidNumbers,
  isValidWords,
  isValidName,
} = require("../validation/validators");

//============================================== createProduct =============================================//

let createProduct = async function (req, res) {
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

    // let keys = [
    //   "title",
    //   "description",
    //   "price",
    //   "currencyId",
    //   "currencyFormat",
    //   "isFreeShipping",
    //   "style",
    //   "availableSizes",
    //   "installments",
    //   "productImage",
    // ];

    // if (!Object.keys(req.body).every((elem) => keys.includes(elem))) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "wrong Parameters" });
    // }

    if (title) {
      if (!isValidWords(title)) {
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
    }

    if (!isValidWords(description)) {
      return res
        .status(400)
        .send({ status: false, msg: "descritions is invalid!" });
    }

    if (price) {
      if (!isValidPrice(price)) {
        return res
          .status(400)
          .send({ status: false, message: "Price is invalid!" });
      }
    }

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

    if (!isValidName(style)) {
      return res.status(400).send({ status: false, msg: "Style is invalid" });
    }

    if (availableSizes || availableSizes == "") {
      availableSizes = availableSizes.split(",").map((x) => x.trim());
      data.availableSizes = availableSizes;

      if (!isValidAvailableSizes(availableSizes))
        return res.status(400).send({
          status: false,
          message: "availableSizes is required or put valid sizes",
        });
    }

    if (!isValid(installments) || !isValidNumbers(installments)) {
      return res
        .status(400)
        .send({ status: false, message: "Installments' is invalid" });
    }

    let document = await productModel.create(data);
    res.status(201).send({ status: true, data: document });
  } catch (err) {
    res.status(500).send({ staus: false, message: err.message });
  }
};

//============================================== getProduct ===============================================//

let getProduct = async function (req, res) {
  try {
    let { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query;

    let filter = { isDeleted: false };

    if (size) {
      let newsize = size.split(",").map((x) => x.trim());
      if (!isValidAvailableSizes(newsize))
        return res.status(400).send({
          status: false,
          message: "availableSizes is required or put valid sizes",
        });
      filter["availableSizes"] = size;
    }

    if (name) {
      if (!isValid(name))
        return res
          .status(400)
          .send({ stastus: false, message: "Invalid naming format!" });
      let productByname = new RegExp(name, "g");
      filter["title"] = productByname;
    }

    if (priceGreaterThan) {
      if (!isValidPrice(priceGreaterThan))
        return res.status(400).send({
          status: false,
          message: "Invalid GreaterThan price format !",
        });
      filter["price"] = { $gt: priceGreaterThan };
    }

    if (priceLessThan) {
      if (!isValidPrice(priceLessThan))
        return res.status(400).send({
          status: false,
          message: "Invalid priceLessThan price format !",
        });
      filter["price"] = { $lt: priceLessThan };
    }

    if (priceGreaterThan && priceLessThan) {
      if (
        priceGreaterThan < priceLessThan ||
        priceGreaterThan > priceLessThan
      ) {
        filter["price"] = { $gt: priceGreaterThan, $lt: priceLessThan };
        
      } else
        return res.status(400).send({
          status: false,
          message: "priceGreaterThan is always higher than priceLessThan",
        });
    }

    if (priceSort) {
      if (priceSort == 1) {
        let pro = await productModel.find(filter).sort({ price: 1 });
        if (!pro) {
          return res.status(400).send({
            status: false,
            msg: "No data found fo assending that matches your search",
          });
        }
        return res.status(200).send({ status: true, message: pro });
      }

      if (priceSort == -1) {
        let newpro = await productModel.find(filter).sort({ price: -1 });
        if (!newpro) {
          return res.status(404).send({
            status: false,
            msg: "No data found that matches your search1",
          });
        }
        return res.status(200).send({ status: true, message: newpro });
      }
    }

    let finaldata = await productModel.find({ ...filter });

    if (!finaldata || finaldata == null || finaldata.length == 0) {
      return res.status(404).send({
        status: false,
        message: "No data found that matches your search 2",
      });
    }

    return res.status(200).send({ status: true, msg: finaldata });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

//==================================================== getProductById =================================================//

let getProductById = async function (req, res) {
  try {
    let productId = req.params.productId;

    if (!isValidId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "ProductId not valid" });
    }

    let productData = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!productData) {
      return res
        .status(404)
        .send({ status: false, message: "Product not exist" });
    }

    return res
      .status(200)
      .send({ status: true, message: "Successfull", data: productData });
  } catch (err) {
    return res.status(500).send({ satus: false, err: err.message });
  }
};

//=================================================== updateProduct =================================================//

let updateProduct = async function (req, res) {
  try {
    let data = req.body;
    //data = JSON.parse(JSON.stringify(data));
    let productId = req.params.productId;
    let files = req.files;
    let update = {};
    let addtoSet = {};

    let {
      title,
      description,
      price,
      isFreeShipping,
      style,
      availableSizes,
      installments,
    } = data;

    if (!isValidBody(data)) {
      return res.status(400).send({
        status: false,
        message: "Please provide data in the request body!",
      });
    }

    // let keys = [
    //   "title",
    //   "description",
    //   "price",
    //   "isFreeShipping",
    //   "style",
    //   "availableSizes",
    //   "installments",
    //   "productImage",
    // ];

    // if (Object.keys(req.body).length < 7) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "wrong Parameters" });
    // }

    if (title) {
      if (!isValidWords(title)) {
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
      update["title"] = title;
    }

    if (description) {
      if (!isValidWords(description)) {
        return res
          .status(400)
          .send({ status: false, message: "description is invalid" });
      }
      update["description"] = description;
    }

    if (price) {
      if (!isValidPrice(price)) {
        return res
          .status(400)
          .send({ status: false, message: "Price is invalid!" });
      }
      update["price"] = price;
    }

    if (files && files.length > 0) {
      let uploadedFileURL = await aws.uploadFile(files[0]);

      update["productImage"] = uploadedFileURL;
    } else if (Object.keys(data).includes("productImage")) {
      return res
        .status(400)
        .send({ status: false, message: "please put the productImage" });
    }

    if (style) {
      if (!isValidName(style)) {
        return res
          .status(400)
          .send({ status: false, message: "Style is invalid!" });
      }
      update["style"] = style;
    }

    if (installments) {
      if (!isValidNumbers(installments)) {
        return res.status(400).send({
          status: false,
          message: "Installments should be a Number only",
        });
      }
      update["installments"] = installments;
    }

    if (availableSizes) {
      availableSizes = availableSizes.split(",").map((x) => x.trim());
      if (!isValidAvailableSizes(availableSizes))
        return res.status(400).send({
          status: false,
          message: "availableSizes is required or put valid sizes",
        });
      addtoSet["availableSizes"] = { $each: availableSizes };
    }

    if (isFreeShipping) {
      if (!(isFreeShipping == "true" || isFreeShipping == "false")) {
        return res.status(400).send({
          status: false,
          message: "isFreeShipping should either be True, or False.",
        });
      }
      update["isFreeShipping"] = isFreeShipping;
    }

    if (!isValidId(productId)) {
      return res
        .status(400)
        .send({ status: false, msg: "Product-id is not valid!" });
    }

    let CheckProduct = await productModel.findById(productId);
    if (!CheckProduct) {
      return res.status(404).send({ status: false, msg: "Product not found!" });
    }

    let updateProduct = await productModel.findOneAndUpdate(
      { _id: productId },
      { update, $addToSet: addtoSet },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      message: "Product successfully updated",
      data: updateProduct,
    });
  } catch (error) {
    res.status(500).send({ status: false, err: error.message });
  }
};

//================================================== deleteProduct ===============================================//

let deleteProduct = async (req, res) => {
  try {
    let productId = req.params.productId;

    if (!isValidId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "ProductId not valid" });
    }

    let productData = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!productData) {
      return res
        .status(404)
        .send({ status: false, message: "Product not exist" });
    }

    await productModel.updateOne(
      { _id: productId },
      { isDeleted: true, deletedAt: Date.now() }
    );

    return res
      .status(200)
      .send({ status: true, message: "Product Successfully Deleted" });
  } catch (err) {
    return res.status(500).send({ satus: false, err: err.message });
  }
};

module.exports = {
  createProduct,
  getProduct,
  getProductById,
  deleteProduct,
  updateProduct,
};
