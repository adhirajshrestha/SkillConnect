import React, { useEffect, useState } from "react";
import "./TeacherPending.css";
import { useNavigate } from "react-router-dom";

const TeacherPending = () => {
  const navigate   = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetch("http://localhost:5000/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        // If already approved, send to dashboard directly
        if (data.verificationStatus === "approved") navigate("/AppTeacher");
        else setUser(data);
      })
      .catch(console.error);
  }, []);

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };

  return (
    <div className="tp-wrapper">
      <header className="tp-header">
        <div className="tp-logo">SkillConnect</div>
        <button className="tp-logout" onClick={handleLogout}>Log Out</button>
      </header>

      <main className="tp-main">
        <div className="tp-card">

          {/* Icon */}
          <div className="tp-icon-ring">
            <span className="tp-icon">⏳</span>
          </div>

          <div className="tp-status-badge">Under Review</div>
          <h1 className="tp-title">Application Submitted!</h1>
          <p className="tp-desc">
            Thank you, <strong>{user?.name || "Teacher"}</strong>! Your credentials have been received and are being reviewed by our admin team.
          </p>

          {/* Timeline */}
          <div className="tp-timeline">
            <div className="tp-step tp-done">
              <div className="tp-dot">✓</div>
              <div className="tp-step-text">
                <strong>Account Created</strong>
                <span>Your account is ready</span>
              </div>
            </div>
            <div className="tp-connector tp-connector--done" />
            <div className="tp-step tp-active">
              <div className="tp-dot">⏳</div>
              <div className="tp-step-text">
                <strong>Under Review</strong>
                <span>Credentials being verified</span>
              </div>
            </div>
            <div className="tp-connector" />
            <div className="tp-step tp-future">
              <div className="tp-dot">🎓</div>
              <div className="tp-step-text">
                <strong>Start Teaching</strong>
                <span>Access unlocked after approval</span>
              </div>
            </div>
          </div>

          {/* Submitted details */}
          {user?.linkedinUrl && (
            <div className="tp-details">
              <h3>Submitted Details</h3>
              {user.qualification && (
                <div className="tp-detail-row">
                  <span className="tp-detail-label">Qualification</span>
                  <span>{user.qualification}</span>
                </div>
              )}
              {user.experience && (
                <div className="tp-detail-row">
                  <span className="tp-detail-label">Experience</span>
                  <span>{user.experience}</span>
                </div>
              )}
              <div className="tp-detail-row">
                <span className="tp-detail-label">LinkedIn</span>
                <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="tp-linkedin-link">
                  View Profile →
                </a>
              </div>
              {user.certificateUrl && (
                <div className="tp-detail-row">
                  <span className="tp-detail-label">Certificate</span>
                  <a href={user.certificateUrl} target="_blank" rel="noreferrer" className="tp-linkedin-link">
                    View Certificate →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Info box */}
          <div className="tp-info-box">
            <span>📬</span>
            <p>We'll notify you once the review is complete. This typically takes <strong>1–2 business days</strong>.</p>
          </div>

          <button className="tp-back-btn" onClick={handleLogout}>Back to Login</button>
        </div>
      </main>
    </div>
  );
};

export default TeacherPending;
