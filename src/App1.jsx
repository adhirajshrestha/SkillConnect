import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import CourseCards from "./components/CourseCards";
import StudentNavbar from "./components/StudentNavbar";
import "./App1.css";


const App1 = () => {
    return (
        <div className="home">
            <StudentNavbar />

            <div className="content">

                {/* Sidebar */}
                <Sidebar />

                {/* Main */}
                <CourseCards />

            </div>
        </div>
    );
};

export default App1;