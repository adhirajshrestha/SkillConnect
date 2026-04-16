
import React, { useState } from "react";
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";


const Signup = () => {
  const navigate = useNavigate();
  // state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  //handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup successful");
        if (role === "teacher") {
          navigate("/AppTeacher");
        } else {
          navigate("/App1");
        }
      } else {
        alert(data.message);
      }

    } catch (err) {
      console.error(err);
      alert("Cannot connect to server ❌");
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log("Google Login Success:", credentialResponse);
    if (role === "teacher") {
      navigate("/AppTeacher");
    } else {
      navigate("/App1");
    }
  };

  const handleGoogleError = () => {
    console.log("Login Failed");
    alert("Google Login Failed ❌");
  };

  return (
    <div className="page-wrapper">
      <header className="header">
        <div className="logo">SkillConnect</div>
        <div className="nav-right">
          <span>Already have an account?</span>
          <Link to="/login" className="login-nav-btn">Log In</Link>
        </div>
      </header>

      <main className="main-content">
        <div className="auth-card">

          {/* Left Section */}
          <div className="card-left">
            <div className="hero-content">
              <h1>Start your journey.</h1>
              <p>Join the world's leading community for tech talent and creative minds.</p>
            </div>
            <div className="social-proof">
              <div className="mini-avatars">
                <div className="m-avatar"></div>
                <div className="m-avatar"></div>
                <div className="m-avatar"></div>
              </div>
              <span>10k+ joined recently</span>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="card-right">
            <h2>Create an account</h2>
            <p className="subtitle">Enter your details below to get started.</p>

            {/* FORM CONNECTED */}
            <form className="auth-form" onSubmit={handleSubmit}>

              <input
                className="text1"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />

              {/* Optional: Role selection */}
              <select
                className="options"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>

              <button type="submit" className="signup-btn">Sign Up</button>
            </form>

            <div className="divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                shape="pill"
                width="350px"
              />
            </div>

            <div className="legal-links">
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>

        </div>
      </main>

      <footer className="footer">
        © 2024 SkillConnect. All rights reserved.
      </footer>
    </div>
  );
};

export default Signup;
