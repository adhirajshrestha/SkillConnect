import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import CourseCards from "./components/CourseCards";
import Navbar from "./components/Navbar";
import "./AfterPayment.css";


const AfterPayment = () => {
    return (
        <div className="home">
            <Navbar variant="student-rich" logoTo="reload" />

            <div className="content">

                {/* Sidebar */}
                <Sidebar />

                {/* Main */}
                <CourseCards />

            </div>
        </div>
    );
};

export default AfterPayment;