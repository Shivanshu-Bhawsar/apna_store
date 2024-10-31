import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

const initialState = {
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
};

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData) => {
    const toastId = toast.loading(
      "Please wait while we redirect you to payment gateway",
      {
        position: "bottom-center",
        autoClose: false,
      }
    );

    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      toast.dismiss(toastId);
      return;
    }

    const orderResponse = await axios.post(
      "http://localhost:5000/api/shop/order/create",
      orderData
    );

    if (!orderResponse?.data?.success) {
      toast.error(orderResponse?.data?.message);
      toast.dismiss(toastId);
      return;
    }

    const options = {
      key: "rzp_test_4Pd7FCcIYATYXN",
      currency: orderResponse.data.data.currency,
      amount: orderResponse.data.data.amount,
      order_id: orderResponse.data.data.id,
      name: "My_Store_Lala",
      description: "Thank you for purchasing the product.",
      // image: rzplogo,
      // prefill: {
      //   name: userDetails?.firstName + " " + userDetails?.lastName,
      //   email: userDetails?.email,
      // },
      handler: async function (response) {
        verifypayment(response);
      },
      theme: {
        color: "#686CFD",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    paymentObject.on("payment.failed", function (response) {
      toast.error("Payment Failed");
    });

    toast.dismiss(toastId);
    return orderResponse.data;
  }
);

async function verifypayment(response) {
  const toastId = toast.loading("Please wait while we verify your payment");
  try {
    const res = await axios.post(
      "http://localhost:5000/api/shop/order/verifyPayment",
      {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      }
    );

    if (!res.data.success) {
      toast.error(res.message);
      toast.dismiss(toastId);
      return;
    }

    toast.success("Payment Successfull");
    window.location.href = "/shop/paypal-return";
  } catch (err) {
    toast.error("Could not Verify Payment");
  }
  toast.dismiss(toastId);
}

export const capturePayment = createAsyncThunk(
  "/order/capturePayment",
  async (orderId) => {
    const res = await axios.post(
      "http://localhost:5000/api/shop/order/capture",
      {
        orderId,
      }
    );

    if (!res.data.success) {
      toast.error(res.message);
      return;
    }

    toast.success("Payment Successfull");
    return res.data;
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/order/list/${userId}`
    );

    return response.data;
  }
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/order/details/${id}`
    );

    return response.data;
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        console.log("state: ", action.payload);
        state.isLoading = false;
        state.orderId = action.payload.orderId;
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(action.payload.orderId)
        );
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
        window.location.href = "/shop/paypal-cancel";
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      });
  },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
