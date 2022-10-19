const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const { isValidId, isValidBody, isValid } = require("../validation/validators");


//=============================================== createCart ==============================================//

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

    if (quantity) {
      if (!isValidNumbers(quantity)) {
        return res
          .status(400)
          .send({ status: false, message: "Quantity is not Valid" });
      }
    }

    if (!quantity) {
      quantity = 1;
    }

    if (cartId) {
      if (!isValidId(cartId)) {
        return res
          .status(400)
          .send({ status: false, message: "Cart id is not Valid" });
      }
    }

    let findUserCart = await cartModel.findOne({ userId: userId });

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
        return res
          .status(400)
          .send({
            status: false,
            message: "Please provide cart id to add items in the cart",
          });
      }
      if (findUserCart._id.toString() !== cartId) {
        return res
          .status(400)
          .send({ status: false, message: "Cart id is not Match" });
      }

      let price = findUserCart.totalPrice + quantity * findProduct.price;

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

//==================================================== updateCart ==============================================//

const updateCart = async function (req, res) {
  try {
    userId = req.params.userId;

    if (!isValidId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: `${userId} is invalid` });
    }

    const findUser = await userModel.findOne({ _id: userId });
    if (!findUser) {
      return res
        .status(404)
        .send({ status: false, message: "User does not exist" });
    }

    const data = req.body;
    let { cartId, productId, removeProduct } = data;

    if (!isValidBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Request body cannot remain empty" });
    }

    if (!productId)
      return res
        .status(400)
        .send({ status: false, message: "Please provide productId" });

    if (!isValidId(productId))
      return res.status(400).send({
        status: false,
        message: `The given productId: ${productId} is not in proper format`,
      });

    const findProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!findProduct) {
      return res.status(404).send({
        status: false,
        message: `Product details are not found with this productId: ${productId}, it must be deleted or not exists`,
      });
    }

    if (!cartId)
      return res
        .status(400)
        .send({ status: false, message: "Please provide cartId" });

    if (!isValidId(cartId))
      return res.status(400).send({
        status: false,
        message: `The given cartId: ${cartId} is not in proper format`,
      });

    const findCart = await cartModel.findOne({ _id: cartId });
    if (!findCart)
      return res.status(404).send({
        status: false,
        message: `Cart does not exists with this provided cartId: ${cartId}`,
      });

    if (findCart.items.length == 0)
      return res.status(400).send({
        status: false,
        message: "You have not added any products in your cart",
      });

    if (!isValid(removeProduct))
      return res
        .status(400)
        .send({ status: false, message: "removeProduct is required" });

    if (!(removeProduct === 0 || removeProduct === 1))
      return res.status(400).send({
        status: false,
        message: "Please enter valid removeproduct it can be only  `0` or `1`",
      });

    let cart = findCart.items;
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].productId == productId) {
        const priceChange = cart[i].quantity * findProduct.price;

        //when removeProduct is 0

        if (removeProduct == 0) {
          const productRemove = await cartModel.findOneAndUpdate(
            { _id: cartId },
            {
              $pull: { items: { productId: productId } },
              totalPrice: findCart.totalPrice - priceChange,
              totalItems: findCart.totalItems - 1,
            },
            { new: true }
          );
          return res.status(200).send({
            status: true,
            message: "Success",
            data: productRemove,
          });
        }

        //when removeProduct is 1

        
          if (cart[i].quantity == 1 && removeProduct == 1) {
            const priceUpdate = await cartModel.findOneAndUpdate(
              { _id: cartId },
              {
                $pull: { items: { productId : productId} },
                totalPrice: findCart.totalPrice - priceChange,
                totalItems: findCart.totalItems - 1,
              },
              { new: true }
            );
            return res.status(200).send({
              status: true,
              message: "Success",
              data: priceUpdate,
            });
          }

       // decrease the products quantity by 1

          cart[i].quantity = cart[i].quantity - 1;
          const updatedCart = await cartModel.findByIdAndUpdate(
            { _id: cartId },
            {
              items: cart,
              totalPrice: findCart.totalPrice - findProduct.price,
            },
            { new: true }
          );
          return res.status(200).send({
            status: true,
            message: "Success",
            data: updatedCart,
          });
        
      }
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//====================================================== GetCart =======================================================//

const getCart = async function (req, res) {
  try {
    const userId = req.params.userId;

    const checkCart = await cartModel
      .findOne({ userId: userId })
      .populate("items.productId", { title: 1, price: 1, productImage: 1 });

    if (!checkCart) {
      return res.status(404).send({ status: false, Message: "Cart not found" });
    }

    res.status(200).send({ status: true, message: "Success", data: checkCart });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//=================================================== DeleteCart ======================================================//

const deleteCart = async function (req, res) {
  try {
    let userId = req.params.userId;

    if (!userId)
      return res
        .status(400)
        .send({ status: false, message: "userid must be present in params" });
    if (!isValidId(userId))
      return res.status(400).send({ status: false, message: "invalid Id" });

    const checkUser = await userModel.findById({ _id: userId });
    if (!checkUser) {
      return res.status(404).send({
        status: false,
        message: `User details are not found with this userId ${userId}`,
      });
    }

    // To check cart is present or not
    const checkCart = await cartModel.findOne({ userId });
    if (!checkCart) {
      return res
        .status(404)
        .send({ status: false, message: "Cart details are not found " });
    }

    const cartDelete = await cartModel.findOneAndUpdate(
      { userId },
      { $set: { items: [], totalItems: 0, totalPrice: 0 } },
      { new: true }
    );
    return res.status(204).send({
      status: true,
      message: "Success",
      data: "Cart is deleted successfully",
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createCart, updateCart, getCart, deleteCart };
