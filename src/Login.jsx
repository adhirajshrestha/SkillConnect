import React, { useState, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./Login.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Toast from "./components/Toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  const getStudentRedirect = () => redirectPath || "/App1";

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window.atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      );
      const payload = JSON.parse(jsonPayload);
      const { name: googleName, email: googleEmail, picture: googlePicture } = payload;

      const res = await fetch("http://localhost:5000/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: googleName, email: googleEmail, avatar: googlePicture })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user && data.user.role) {
          localStorage.setItem("userRole", data.user.role);
        }

        if (data.user && data.user.role === "teacher") {
          const status = data.user.verificationStatus;
          if (status === "pending") {
            navigate("/teacher-pending");
          } else if (status === "rejected") {
            showToast(
              `Your teacher application was rejected.\n\nReason: ${data.user.rejectionReason || "Did not meet our requirements."}`,
              "error"
            );
          } else {
            navigate("/AppTeacher");
          }
        } else {
          navigate(getStudentRedirect());
        }
      } else {
        showToast(data.message || "Google Login failed. Please try again.", "error");
      }
    } catch (err) {
      console.error("Google Login failed:", err);
      showToast("Something went wrong with Google Login. Please try again.", "error");
    }
  };

  const handleGoogleError = () => {
    showToast("Google Login failed. Please try again or use email & password.", "error");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        if (data.user && data.user.role) {
          localStorage.setItem("userRole", data.user.role);
        }

        if (data.user && data.user.role === "teacher") {
          const status = data.user.verificationStatus;
          if (status === "pending") {
            navigate("/teacher-pending");
          } else if (status === "rejected") {
            showToast(
              `Your teacher application was rejected.\n\nReason: ${data.user.rejectionReason || "Did not meet our requirements."}`,
              "error"
            );
          } else {
            navigate("/AppTeacher");
          }
        } else {
          navigate(getStudentRedirect());
        }
      } else {
        showToast(data.message || "Login failed. Please check your credentials.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Cannot connect to the server. Please make sure the backend is running.", "error");
    }
  };

  return (
    <div className="page-wrapper">
      {/* Custom Toast — replaces browser alert() */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <header className="header">
        <div className="logo" onClick={() => window.location.reload()} style={{ cursor: "pointer" }}>SkillConnect</div>
        <div className="nav-right">
          <Link to="/signup" className="signup-nav-btn">Sign up</Link>
        </div>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <h1 className="hero-title">
            Connect with your <br /> <span className="hero-highlight">future skills</span>
          </h1>
          <p className="hero-description">
            Join millions of learners and experts. Log in to access your personalized dashboard and continue your journey.
          </p>
        </section>

        <section className="login-card-section">
          <div className="login-card">
            <h2 className="card-title">Welcome Back</h2>
            <p className="card-subtitle">Enter your details to access your account.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="login-btn">Login</button>
            </form>

            <div className="divider"><span>OR CONTINUE WITH</span></div>

            <div className="google-login-container">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap theme="outline" size="large" shape="pill" width="350px" />
            </div>

            <p className="NoAcc">
              Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;