import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Login successful");

        // store token
        localStorage.setItem("token", data.token);

        // redirect based on role
        if (data.user && data.user.role === "teacher") {
          navigate("/AppTeacher");
        } else {
          navigate("/App1");
        }
      } else {
        alert(data.message);
      }

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="login-page-container">
      <header className="navbar">
        <div className="navbar-logo">SkillConnect</div>
        <Link to="/signup" className="navbar-signup-btn">Sign up</Link>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <h1 className="hero-title">
            Connect with your <br /> <span className="hero-highlight">future skills</span>
          </h1>
          <p className="hero-description">
            Join millions of learners and experts. Log in to access your
            personalized dashboard and continue your journey.
          </p>
        </section>

        <section className="login-card-section">
          <div className="login-card">
            <h2 className="card-title">Welcome Back</h2>
            <p className="card-subtitle">Enter your details to access your account.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" className="login-btn">Login</button>
            </form>

            <p>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;