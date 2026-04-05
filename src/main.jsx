import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Signup from "./Signup";
import Login from "./Login";
import App from "./App";
import App1 from "./App1";
import Profile from "./Profile";
import TeacherProfile from "./TeacherProfile";
import AppTeacher from "./AppTeacher";

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="42493127138-2trnhmp48sdbg725taj127rhta5gl8no.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          {/* Default page → Login */}
          <Route path="/" element={<Navigate to="/App" />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/App" element={<App />} />
          <Route path="/App1" element={<App1 />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/TeacherProfile" element={<TeacherProfile />} />
          <Route path="/AppTeacher" element={<AppTeacher />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);