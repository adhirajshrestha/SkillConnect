import React from "react";

const PayButton = () => {
    const handlePayment = () => {
        const path = "https://esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=100&transaction_uuid=123";

        const params = {
            amt: 100,
            psc: 0,
            pdc: 0,
            txAmt: 0,
            tAmt: 100,
            pid: "ORDER123",
            scd: "EPAYTEST",
            su: "http://localhost:3000/success",
            fu: "http://localhost:3000/failure",
        };

        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", path);

        for (let key in params) {
            const hiddenField = document.createElement("input");

            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
    };

    return (
        <button onClick={handlePayment}>
            Pay with eSewa
        </button>
    );
};

export default PayButton;