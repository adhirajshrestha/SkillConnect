import React from "react";
import "./App.css";

const courses = [
  { title: "CASEY NEISTAT", desc: "Learn the basics of starting your own business", img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d" },
  { title: "CASEY NEISTAT", desc: "AI annotation and Data Analysis as a beginner", img: "https://images.unsplash.com/photo-1552664730-d307ca884978" },
  { title: "CASEY NEISTAT", desc: "One month course for beginners with a guitar", img: "https://images.unsplash.com/photo-1524594154908-edd7c16dfd1f" },
  { title: "CASEY NEISTAT", desc: "Learn to code with HTML, CSS and JS as a beginner", img: "https://images.unsplash.com/photo-1584697964403-0f6b8f2e2f57" },
  { title: "CASEY NEISTAT", desc: "professionalize your CV according to your style", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e" },
  { title: "CASEY NEISTAT", desc: "Learn the basics of Content Creation and Video Editing", img: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6" }
];

const App = () => {
  return (
    <div className="home">

      {/* Navbar */}
      <div className="navbar">
        <h2 className="logo">SkillConnect</h2>

        <div className="nav-center">
          <span className="Explore">Explore ▼</span>
        </div>
        <div className="Search"><input type="text" className="search-box" placeholder="What's on your mind" /></div>

        <div className="nav-right">
          <h1 className="login-btn">Log in</h1>
           <h1 className="signup-btn">Signup</h1>
        </div>
      </div>

      <div className="content">

        {/* Sidebar */}
        <div className="sidebar">
          <p>Music & instruments</p><br/>
          <p>ART & Illustration</p><br/>
          <p>Mathematics</p><br/>
          <p>Film & Video</p><br/>
          <p>Business & Marketing</p><br/>
          <p>Photography</p><br/>
          <p>Productivity</p><br/>
          <p>Home & Lifestyles</p><br/>
          <p>Plants and Care</p>
        </div>

        {/* Main */}
        <div className="main">
          <h2>Music & instruments</h2>

          <div className="cards">
            {courses.map((course, index) => (
              <div className="card" key={index}>
                <img src={course.img} alt="" />
                <div className="card-body">
                  <h4>{course.title}</h4><br/>
                  <p>{course.desc}</p><br/>
                  <span>📘 End the course with a certificate</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;