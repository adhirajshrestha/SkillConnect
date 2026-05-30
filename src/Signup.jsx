import React, { useState, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Toast from "./components/Toast";

const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

const Signup = () => {
  const navigate = useNavigate();

  // Toast state
  const [toast, setToast]         = useState(null);
  const showToast = useCallback((message, type = "info") => setToast({ message, type }), []);
  const closeToast = useCallback(() => setToast(null), []);

  // Step control
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole]           = useState("");

  // Step 2 fields
  const [qualification, setQualification] = useState("");
  const [experience, setExperience]       = useState("");
  const [linkedinUrl, setLinkedinUrl]     = useState("");
  const [certificateFile, setCertificateFile] = useState(null);
  const [linkedinValid, setLinkedinValid] = useState(false);
  const [linkedinError, setLinkedinError] = useState("");
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [authToken, setAuthToken]         = useState("");

  const validateLinkedin = (url) => {
    if (!url) { setLinkedinError(""); setLinkedinValid(false); return; }
    if (LINKEDIN_REGEX.test(url)) {
      setLinkedinError(""); setLinkedinValid(true);
    } else {
      setLinkedinError("Must be a valid LinkedIn URL  e.g. https://linkedin.com/in/yourname");
      setLinkedinValid(false);
    }
  };

  // ── Step 1 submit ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.token) { 
          localStorage.setItem("token", data.token); 
          localStorage.setItem("userRole", role); 
          setAuthToken(data.token); 
        }
        if (role === "teacher") { setStep(2); }
        else { showToast("Welcome to SkillConnect! Your account is ready.", "success"); setTimeout(() => navigate("/App1"), 1500); }
      } else { showToast(data.message || "Signup failed. Please try again.", "error"); }
    } catch (err) { console.error(err); showToast("Cannot connect to server. Please make sure the backend is running.", "error"); }
  };

  // ── Step 2 submit ─────────────────────────────────────────────
  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    if (!linkedinValid) { setLinkedinError("Please enter a valid LinkedIn profile URL."); return; }
    if (!certificateFile) { showToast("Please upload a certificate or diploma to continue.", "warning"); return; }
    setIsSubmitting(true);
    try {
      let certificateBase64 = null;
      if (certificateFile) {
        certificateBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(certificateFile);
        });
      }
      const res  = await fetch("http://localhost:5000/teacher/submit-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ qualification, experience, linkedinUrl, certificateBase64 })
      });
      const data = await res.json();
      if (res.ok) { navigate("/teacher-pending"); }
      else { showToast(data.message || "Failed to submit credentials. Please try again.", "error"); }
    } catch (err) { console.error(err); showToast("Something went wrong. Please try again.", "error"); }
    finally { setIsSubmitting(false); }
  };

  // ── Google signup ─────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!role) { showToast("Please select a role (Student or Teacher) before signing up with Google.", "warning"); return; }
    try {
      const token = credentialResponse.credential;
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(decodeURIComponent(
        window.atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      ));
      const { name: gName, email: gEmail, picture: gPic } = payload;

      const res  = await fetch("http://localhost:5000/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: gName, email: gEmail, avatar: gPic, role })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.token) { 
          localStorage.setItem("token", data.token); 
          localStorage.setItem("userRole", role); 
          setAuthToken(data.token); 
        }
        if (role === "teacher") { setStep(2); }
        else { navigate("/App1"); }
      } else { showToast(data.message || "Failed to sign up with Google. Please try again.", "error"); }
    } catch (err) { console.error(err); showToast("Something went wrong with Google sign up.", "error"); }
  };

  const handleGoogleError = () => showToast("Google Login failed. Please try again.", "error");

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      {/* Custom Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      <header className="header">
        <div className="logo" onClick={() => window.location.reload()} style={{ cursor: "pointer" }}>SkillConnect</div>
        <div className="nav-right">
          <span>Already have an account?</span>
          <Link to="/login" className="login-nav-btn">Log In</Link>
        </div>
      </header>

      <main className="main-content">
        <div className={`auth-card${step === 2 ? " auth-card--step2" : ""}`}>

          {/* LEFT PANEL */}
          <div className="card-left">
            <div className="hero-content">
              {step === 1 ? (
                <>
                  <h1>Start your journey.</h1>
                  <p>Join the world's leading community for tech talent and creative minds.</p>
                </>
              ) : (
                <>
                  <h1>Verify your expertise.</h1>
                  <p>Help students trust your skills by sharing your credentials with us.</p>
                  <div className="step-tracker">
                    <div className="s-step s-step--done"><span>✓</span><p>Account</p></div>
                    <div className="s-line s-line--done" />
                    <div className="s-step s-step--active"><span>2</span><p>Credentials</p></div>
                    <div className="s-line" />
                    <div className="s-step"><span>3</span><p>Review</p></div>
                  </div>
                </>
              )}
            </div>
            <div className="social-proof">
              <div className="mini-avatars">
                <div className="m-avatar" /><div className="m-avatar" /><div className="m-avatar" />
              </div>
              <span>10k+ joined recently</span>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="card-right">
            {step === 1 ? (
              <>
                <h2>Create an account</h2>
                <p className="subtitle">Enter your details below to get started.</p>
                <form className="auth-form" onSubmit={handleSubmit}>
                  <input className="text1" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
                  <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" required />
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
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
                  <select className="options" value={role} onChange={(e) => setRole(e.target.value)} required>
                    <option value="" disabled>Select your role</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                  <button type="submit" className="signup-btn" disabled={!role}>
                    {role === "teacher" ? "Continue →" : "Sign Up"}
                  </button>
                </form>
                <div className="divider"><span>OR CONTINUE WITH</span></div>
                <div className="google-login-container">
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap theme="outline" size="large" shape="pill" width="350px" />
                </div>
                <div className="legal-links">
                  <a href="#">Terms of Service</a>
                  <a href="#">Privacy Policy</a>
                </div>
              </>
            ) : (
              <>
                <div className="step2-header">
                  <span className="step2-badge">Step 2 of 2 — Teacher Verification</span>
                  <h2>Submit Your Credentials</h2>
                  <p className="subtitle">Our team will review your details within 1–2 business days.</p>
                </div>

                <form className="auth-form" onSubmit={handleCredentialSubmit}>
                  {/* Qualification */}
                  <div className="field-group">
                    <label className="field-label">Highest Qualification *</label>
                    <input type="text" placeholder="e.g. Bachelor's in Computer Science" value={qualification} onChange={(e) => setQualification(e.target.value)} required />
                  </div>

                  {/* Experience */}
                  <div className="field-group">
                    <label className="field-label">Years of Experience *</label>
                    <select className="options" value={experience} onChange={(e) => setExperience(e.target.value)} required>
                      <option value="" disabled>Select experience</option>
                      <option>Less than 1 year</option>
                      <option>1–3 years</option>
                      <option>3–5 years</option>
                      <option>5–10 years</option>
                      <option>10+ years</option>
                    </select>
                  </div>

                  {/* LinkedIn */}
                  <div className="field-group">
                    <label className="field-label">LinkedIn Profile URL *</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/yourname"
                      value={linkedinUrl}
                      onChange={(e) => { setLinkedinUrl(e.target.value); validateLinkedin(e.target.value); }}
                      className={linkedinUrl ? (linkedinValid ? "input-valid" : "input-invalid") : ""}
                      required
                    />
                    {linkedinUrl && (
                      <span className={`linkedin-hint ${linkedinValid ? "hint-valid" : "hint-invalid"}`}>
                        {linkedinValid ? "✅ Valid LinkedIn profile" : `❌ ${linkedinError}`}
                      </span>
                    )}
                  </div>

                  {/* Certificate upload */}
                  <div className="field-group">
                    <label className="field-label">Certificate / Diploma *</label>
                    <div className="file-upload-area">
                      <input type="file" id="cert-upload" accept="image/*,.pdf" onChange={(e) => setCertificateFile(e.target.files[0])} className="file-input-hidden" />
                      <label htmlFor="cert-upload" className={`file-upload-label${certificateFile ? ' file-upload-label--done' : ''}`}>
                        {certificateFile ? `✅ ${certificateFile.name}` : '📁 Click to upload certificate or diploma'}
                      </label>
                      <p className="file-hint">Accepts JPG, PNG, PDF · max 10 MB</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="signup-btn"
                    disabled={isSubmitting || !linkedinValid || !qualification || !experience || !certificateFile}
                  >
                    {isSubmitting ? 'Submitting…' : 'Submit for Review'}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </main>

      <footer className="footer">© 2024 SkillConnect. All rights reserved.</footer>
    </div>
  );
};

export default Signup;
