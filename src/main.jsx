import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Signup from "./Signup";
import Login from "./Login";
import App from "./App";
import App1 from "./App1";

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Default page → Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/App" element={<App />} />
        <Route path="/App1" element={<App1 />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);