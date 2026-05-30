const ESEWA_FORM_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const DEFAULT_AMOUNT = "500";

export async function initiateEsewaPayment(videoId, amount = DEFAULT_AMOUNT) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Please log in to purchase");
    }

    const res = await fetch("http://localhost:5000/api/esewa/initiate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, videoId }),
    });

    const params = await res.json();
    if (!res.ok) {
        throw new Error(params.message || "Failed to initialize payment");
    }

    sessionStorage.setItem("esewaPendingVideoId", videoId);

    const form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", ESEWA_FORM_URL);

    Object.entries(params).forEach(([key, value]) => {
        const hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", value);
        form.appendChild(hiddenField);
    });

    document.body.appendChild(form);
    form.submit();
}
