import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import PayButton from "./components/PayButton";

function Home() {
    return (
        <div>
            <h1>eSewa Payment Integration</h1>
            <PayButton />
        </div>
    );
}

function Success() {
    const location = useLocation();

    React.useEffect(() => {
        const query = new URLSearchParams(location.search);

        const oid = query.get("oid");
        const amt = query.get("amt");
        const refId = query.get("refId");

        axios
            .post("http://localhost:5000/api/payment/verify", {
                oid,
                amt,
                refId,
            })
            .then((res) => {
                console.log(res.data);
            });
    }, [location]);

    return <h1>Payment Success</h1>;
}

function Failure() {
    return <h1>Payment Failed</h1>;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/success" element={<Success />} />
                <Route path="/failure" element={<Failure />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;