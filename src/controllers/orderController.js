const userModel = require("../models/userModel");
const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const {
  isValidId,
  isValidBody,
  isValid
} = require("../validation/validators");

const createOrder = async function (req, res) {
    try {
      let userId = req.params.userId;
      let data = req.body;
      let cartId = data.cartId;
  
      if (!isValidBody(data))
        return res.status(400).send({
          status: false,
          message: "Please provide data in request body",
        });
  
      if (!isValidId(userId))
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid User Id" });
      let findUser = await userModel.findOne({ _id: userId });
      if (!findUser)
        return res
          .status(404)
          .send({ status: false, message: "not found userId" });
  
      if (!cartId)
        return res
          .status(400)
          .send({ status: false, message: "cartId is required" });
      if (!isValidId(cartId))
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid cart Id" });
  
      let findCart = await cartModel.findOne({ _id: cartId });
      if (!findCart)
        return res
          .status(404)
          .send({ status: false, message: "not found cartId" });
      if (findCart.userId != userId)
        return res.status(403).send({
          status: false,
          message: "you are not allow to create this order",
        });
  
      let obj = {
        userId: userId,
        items: findCart.items,
        totalPrice: findCart.totalPrice,
        totalItems: findCart.totalItems,
        totalQuantity: 0,
        status: "pending",
        cancellable: true,
      };
  
      let count = 0;
      let items = findCart.items;
      for (let i = 0; i < items.length; i++) {
        count += items[i].quantity;
      }
  
      obj["totalQuantity"] = count;
  
      let finalData = await orderModel.create(obj);
  
      const updateOrder = await cartModel.findOneAndUpdate(
        { userId },
        { $set: { items: [], totalItems: 0, totalPrice: 0 } },
        { new: true }
      );
  
      return res
        .status(201)
        .send({ status: true, message: "Success", data: finalData });
    } catch (error) {
      res.status(500).send({ status: false, message: error.message });
    }
  };
//=====================================================================================================================

const updateOrder = async function (req, res) {
    try {
      let userId = req.params.userId;
  
      if (!isValid(userId) || !isValidId(userId))
        return res.status(400).send({ status: false, message: "Invalid userId" });
  
      let data = req.body;
      let { status, orderId } = data;
  
      if (!isValid(orderId) || !isValidId(orderId))
        return res
          .status(400)
          .send({ status: false, message: "Invalid orderId" });
  
      let orderDetails = await orderModel.findOne({
        _id: orderId,
        isDeleted: false,
      });
  
      if (!["pending", "completed", "cancelled"].includes(status)) {
        return res.status(400).send({
          status: false,
          message: "status should be from [pending, completed, cancelled]",
        });
      }
  
      if (orderDetails.status === "completed") {
        return res.status(400).send({
          status: false,
          message: "Order completed, now its status can not be updated",
        });
      }
  
      if (orderDetails.cancellable === false && status == "cancelled") {
        return res
          .status(400)
          .send({ status: false, message: "Order is not cancellable" });
      } else {
        if (status === "pending") {
          return res
            .status(400)
            .send({ status: false, message: "order status is already pending" });
        }
  
        let orderStatus = await orderModel.findOneAndUpdate(
          { _id: orderId },
          { $set: { status: status } },
          { new: true }
        );
        return res
          .status(200)
          .send({
            status: true,
            message: "Success",
            data: orderStatus,
          });
      }
    } catch (error) {
      res.status(500).send({ status: false, error: error.message });
    }
  };
 

  module.exports ={createOrder, updateOrder}