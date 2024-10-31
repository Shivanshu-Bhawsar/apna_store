const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const { instance } = require("../../helpers/razorpay");
const crypto = require("crypto");

exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      cartId,
    } = req.body;

    // Create the Razorpay order
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `order_rcptid_${Math.random(Date.now()).toString()}`,
      notes: {
        userId,
        orderStatus,
        paymentMethod,
      },
    };

    const order = await instance.orders.create(options);

    // Create your order in the database
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      razorpayOrderId: order.id,
    });

    await newlyCreatedOrder.save();

    res.status(201).json({
      success: true,
      orderId: newlyCreatedOrder._id,
      data: order,
      message: "Order created successfully",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error occured in create order!",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(404).json({
        success: false,
        message: "Please provide all details",
      });
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: "Payment Verified",
      });
    }
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Payment Failed",
    });
  }
};

exports.capturePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(404).json({
        success: false,
        message: "Order id not found",
      });
    }

    let order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }
      product.totalStock -= item.quantity;
      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    return res.status(200).json({
      success: true,
      // data: order,
      message: "Payment captured successfully",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Payment captured failed",
    });
  }
};

exports.getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error occured in getAllOrdersByUser!",
    });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error occured in get order details!",
    });
  }
};
