import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import CourseCards from "./components/CourseCards";
import Navbar from "./components/Navbar";
import "./App.css";


const App = () => {
  return (
    <div className="home">
      <Navbar variant="guest" logoTo="reload" />

      <div className="content">

        {/* Sidebar */}
        <Sidebar />

        {/* Main */}
        <CourseCards />

      </div>
    </div>
  );
};

export default App;