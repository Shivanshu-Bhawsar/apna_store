import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
// import { useLocation } from "react-router-dom";

function PaypalReturnPage() {
  const dispatch = useDispatch();
  // const location = useLocation();

  useEffect(() => {
    const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));
    dispatch(capturePayment(orderId)).then((data) => {
      if (data?.payload?.success) {
        sessionStorage.removeItem("currentOrderId");
        window.location.href = "/shop/payment-success";
      }
    });
  }, [dispatch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Payment...Please wait!</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default PaypalReturnPage;
