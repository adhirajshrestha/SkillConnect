import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Signup from "./Signup"; 
import Login from "./Login";
import App from "./App";

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Default page → Login */}
        <Route path="/" element={<Navigate to="/Login" />} />
        
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/App" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);