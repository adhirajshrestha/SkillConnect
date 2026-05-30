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
import Payment from "./Payment";
import AfterPayment from "./AfterPayment";
import MyClasses from "./MyClasses";
import Video from "./Video";
import TeacherVideo from "./TeacherVideo";
import CategoryPage from "./CategoryPage";
import SearchResults from "./SearchResults";
import TeacherPending from "./TeacherPending";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import EsewaSuccess from "./EsewaSuccess";
import EsewaFailure from "./EsewaFailure";

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="42493127138-2trnhmp48sdbg725taj127rhta5gl8no.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          {/* Default page → Login */}
          <Route path="/" element={<Navigate to="/Signup" />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/App" element={<App />} />
          <Route path="/App1" element={<App1 />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/TeacherProfile" element={<TeacherProfile />} />
          <Route path="/AppTeacher" element={<AppTeacher />} />
          <Route path="/Payment" element={<Payment />} />
          <Route path="/AfterPayment" element={<AfterPayment />} />
          <Route path="/my-classes" element={<MyClasses />} />
          <Route path="/video" element={<Video />} />
          <Route path="/video/:id" element={<Video />} />
          <Route path="/teacher-video/:id" element={<TeacherVideo />} />
          <Route path="/category/:name" element={<CategoryPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/teacher-pending" element={<TeacherPending />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/esewa-success" element={<EsewaSuccess />} />
          <Route path="/esewa-failure" element={<EsewaFailure />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);