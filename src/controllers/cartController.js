const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const aws = require("../aws/awsConfig");
const {
  isValid,
  isValidPrice,
  isValidAvailableSizes,
  isValidId,
  isValidNumbers,
  isValidBody,
  isValidWords,
  isValidName,
} = require("../validation/validators");

const createCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;
    let { productId, cartId, quantity } = data;

    if (!isValidBody(data)) {
      return res.status(400).send({
        status: false,
        message: "Please provide data in request body",
      });
    }

    if (!isValidId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid User Id" });
    }

    let findUser = await userModel.findById(userId);
    if (!findUser) {
      return res
        .status(404)
        .send({ status: false, message: `user doesn't exist ${userId}` });
    }

    if (!productId) {
      return res
        .status(400)
        .send({ status: false, message: "productId is required" });
    }

    if (!isValidId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid productId" });
    }

    let findProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!findProduct) {
      return res
        .status(404)
        .send({ status: false, message: `product doesn't exist ${productId}` });
    }

    if (quantity ) {
      if (!isValidNumbers(quantity)) {
          return res.status(400).send({ status: false, message: "Quantity is not Valid" })
      }
  }

    if (!quantity) {
      quantity = 1;
    }

    if (cartId) {
      if (!isValidId(cartId)) {
          return res.status(400).send({ status: false, message: "Cart id is not Valid" })
      };
  }

    let findUserCart = await cartModel.findOne({ userId:userId });

    if (!findUserCart) {

      let cartData = {
        userId,
        items: [{ productId: productId, quantity: quantity }],
        totalPrice: (findProduct.price * quantity).toFixed(2),
        totalItems: 1,
      };

      let newCart = await cartModel.create(cartData);
      return res.status(201).send({
        status: true,
        message: "Success",
        data: newCart,
      });
    }

    if (findUserCart) {
      if (!cartId) {
        return res.status(400).send({ status: false, message: "Please provide cart id to add items in the cart" })
    }
    if (findUserCart._id.toString() !== cartId) {
        return res.status(400).send({ status: false, message: "Cart id is not Match" })
    }

      let price = findUserCart.totalPrice + quantity * findProduct.price;
      console.log(price)

      let arr = findUserCart.items;

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].productId.toString() === productId) {
          arr[i].quantity += quantity; // arr[i].quantity= arr[i].quantity + quantity

          let updatedCart = {
            items: arr,
            totalPrice: price,
            totalItems: arr.length,
          };

          let responseData = await cartModel.findOneAndUpdate(
            { _id: findUserCart._id },
            updatedCart,
            { new: true }
          );

          return res.status(201).send({
            status: true,
            message: "Success",
            data: responseData,
          });
        }
      }

      arr.push({ productId: productId, quantity: quantity });

      let updatedCart = {
        items: arr,
        totalPrice: price,
        totalItems: arr.length,
      };

      let responseData = await cartModel.findOneAndUpdate(
        { _id: findUserCart._id },
        updatedCart,
        { new: true }
      );

      return res.status(201).send({
        status: true,
        message: "Success",
        data: responseData,
      });
    }
  } catch (err) {
    res.status(500).send({ staus: false, message: err.message });
  }
};

module.exports = { createCart };
