import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import CourseCards from "./components/CourseCards";
import Navbar from "./components/Navbar";
import "./AppTeacher.css";


const AppTeacher = () => {
    return (
        <div className="home">
            <Navbar variant="teacher" logoTo="reload" />

            <div className="content">

                {/* Sidebar */}
                <Sidebar />

                {/* Main */}
                <CourseCards />

            </div>
        </div>
    );
};

export default AppTeacher;
