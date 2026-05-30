import React, { useState, useEffect, useCallback } from "react";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";

const STATUS_LABELS = { pending: "Pending", approved: "Approved", rejected: "Rejected" };

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("pending");
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, students: 0 });
  const [loading, setLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(null); // teacher object or null
  const [rejectReason, setRejectReason] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [certModalUrl, setCertModalUrl] = useState(null); // URL string or null

  const getViewerType = (url) => {
    if (!url) return "image";
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('/raw/') && lowerUrl.endsWith('.pdf')) {
      return "pdf";
    }
    if (lowerUrl.includes('/image/upload/') && lowerUrl.endsWith('.pdf')) {
      return "image";
    }
    if (lowerUrl.endsWith('.pdf')) {
      return "pdf";
    }
    return "image";
  };

  const getViewerUrl = (url) => {
    if (!url) return "";
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('/image/upload/') && lowerUrl.endsWith('.pdf')) {
      return url.replace(/\.pdf$/i, ".png");
    }
    return url;
  };

  const token = localStorage.getItem("adminToken");

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const logout = () => { localStorage.removeItem("adminToken"); navigate("/admin"); };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/stats", { headers });
      const data = await res.json();
      if (res.ok) setStats(data);
      else if (res.status === 401 || res.status === 403) logout();
    } catch { /* silently fail */ }
  }, []);

  const fetchTeachers = useCallback(async (status) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/admin/teachers?status=${status}`, { headers });
      const data = await res.json();
      if (res.ok) setTeachers(data);
      else if (res.status === 401 || res.status === 403) logout();
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!token) { navigate("/admin"); return; }
    fetchStats();
  }, []);

  useEffect(() => { fetchTeachers(filter); }, [filter]);

  const showMsg = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 3000); };

  const handleApprove = async (id) => {
    const res = await fetch(`http://localhost:5000/admin/approve/${id}`, { method: "PUT", headers });
    if (res.ok) { showMsg("✅ Teacher approved!"); fetchTeachers(filter); fetchStats(); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const res = await fetch(`http://localhost:5000/admin/reject/${rejectModal._id}`, {
      method: "PUT", headers,
      body: JSON.stringify({ reason: rejectReason || "Your application did not meet our requirements." })
    });
    if (res.ok) {
      showMsg("❌ Teacher rejected.");
      setRejectModal(null); setRejectReason("");
      fetchTeachers(filter); fetchStats();
    }
  };

  const statusColor = (s) => ({ pending: "#f59e0b", approved: "#10b981", rejected: "#ef4444" }[s] || "#999");

  return (
    <div className="ad-wrapper">
      {/* SIDEBAR */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-logo">SkillConnect</div>
        <p className="ad-sidebar-sub">Admin Panel</p>
        <nav className="ad-nav">
          {["pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              className={`ad-nav-btn${filter === s ? " ad-nav-btn--active" : ""}`}
              onClick={() => setFilter(s)}
            >
              <span className="ad-nav-dot" style={{ background: statusColor(s) }} />
              {STATUS_LABELS[s]}
              <span className="ad-nav-count">
                {s === "pending" ? stats.pending : s === "approved" ? stats.approved : stats.rejected}
              </span>
            </button>
          ))}
        </nav>
        <button className="ad-logout-btn" onClick={logout}>🚪 Log Out</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ad-main">
        {/* Header */}
        <div className="ad-topbar">
          <div>
            <h1 className="ad-page-title">Teacher Verification</h1>
            <p className="ad-page-sub">Review and manage teacher applications</p>
          </div>
          {actionMsg && <div className="ad-action-msg">{actionMsg}</div>}
        </div>

        {/* Stats */}
        <div className="ad-stats">
          <div className="ad-stat-card ad-stat--pending">
            <span className="ad-stat-num">{stats.pending}</span>
            <span className="ad-stat-label">Pending</span>
          </div>
          <div className="ad-stat-card ad-stat--approved">
            <span className="ad-stat-num">{stats.approved}</span>
            <span className="ad-stat-label">Approved</span>
          </div>
          <div className="ad-stat-card ad-stat--rejected">
            <span className="ad-stat-num">{stats.rejected}</span>
            <span className="ad-stat-label">Rejected</span>
          </div>
          <div className="ad-stat-card ad-stat--students">
            <span className="ad-stat-num">{stats.students}</span>
            <span className="ad-stat-label">Students</span>
          </div>
        </div>

        {/* Teacher Cards */}
        {loading ? (
          <div className="ad-loading">Loading…</div>
        ) : teachers.length === 0 ? (
          <div className="ad-empty">
            <span>📭</span>
            <p>No {filter} applications found.</p>
          </div>
        ) : (
          <div className="ad-cards">
            {teachers.map((t) => (
              <div className="ad-card" key={t._id}>
                <div className="ad-card-top">
                  <div className="ad-avatar">
                    {t.avatar
                      ? <img src={t.avatar} alt={t.name} />
                      : <span>{t.name?.charAt(0).toUpperCase()}</span>
                    }
                  </div>
                  <div className="ad-card-info">
                    <h3 className="ad-card-name">{t.name}</h3>
                    <p className="ad-card-email">{t.email}</p>
                    <span className="ad-card-status" style={{ color: statusColor(t.verificationStatus) }}>
                      ● {STATUS_LABELS[t.verificationStatus] || t.verificationStatus}
                    </span>
                  </div>
                </div>

                <div className="ad-card-details">
                  {t.qualification && (
                    <div className="ad-detail-row">
                      <span className="ad-detail-icon">🎓</span>
                      <span>{t.qualification}</span>
                    </div>
                  )}
                  {t.experience && (
                    <div className="ad-detail-row">
                      <span className="ad-detail-icon">📅</span>
                      <span>{t.experience}</span>
                    </div>
                  )}
                  {t.linkedinUrl && (
                    <div className="ad-detail-row">
                      <span className="ad-detail-icon">🔗</span>
                      <a href={t.linkedinUrl} target="_blank" rel="noreferrer" className="ad-link">
                        View LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {/* Certificate Section */}
                  <div className="ad-cert-section">
                    <div className="ad-cert-label">
                      <span className="ad-detail-icon">📄</span>
                      <span>Certificate</span>
                    </div>
                    {t.certificateUrl ? (
                      t.certificateUrl.toLowerCase().includes('.pdf')
                        || t.certificateUrl.includes('/raw/') ? (
                        <button
                          type="button"
                          className="ad-cert-pdf-btn"
                          onClick={() => setCertModalUrl(t.certificateUrl)}
                        >
                          📑 Preview PDF Certificate
                        </button>
                      ) : (
                        <div className="ad-cert-img-wrap">
                          <img
                            src={t.certificateUrl}
                            alt="Certificate"
                            className="ad-cert-img"
                            onClick={() => setCertModalUrl(t.certificateUrl)}
                          />
                          <button
                            type="button"
                            className="ad-cert-open-link"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'right' }}
                            onClick={() => setCertModalUrl(t.certificateUrl)}
                          >
                            🔍 Preview Certificate
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="ad-no-cert">No certificate uploaded</span>
                    )}
                  </div>

                  {!t.qualification && !t.linkedinUrl && (
                    <p className="ad-no-creds">⚠️ No credentials submitted yet</p>
                  )}
                  {t.rejectionReason && (
                    <div className="ad-rejection-note">
                      <strong>Rejection reason:</strong> {t.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {t.verificationStatus === "pending" && (
                  <div className="ad-card-actions">
                    <button className="ad-approve-btn" onClick={() => handleApprove(t._id)}>
                      ✅ Approve
                    </button>
                    <button className="ad-reject-btn" onClick={() => { setRejectModal(t); setRejectReason(""); }}>
                      ❌ Reject
                    </button>
                  </div>
                )}
                {t.verificationStatus === "approved" && (
                  <div className="ad-card-actions">
                    <button className="ad-reject-btn" onClick={() => { setRejectModal(t); setRejectReason(""); }}>
                      Revoke Approval
                    </button>
                  </div>
                )}
                {t.verificationStatus === "rejected" && (
                  <div className="ad-card-actions">
                    <button className="ad-approve-btn" onClick={() => handleApprove(t._id)}>
                      Re-Approve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* REJECT MODAL */}
      {rejectModal && (
        <div className="ad-modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Reject Application</h2>
            <p>You are rejecting <strong>{rejectModal.name}</strong>'s teacher application.</p>
            <textarea
              className="ad-modal-textarea"
              placeholder="Reason for rejection (optional — a default message will be used if left blank)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <div className="ad-modal-actions">
              <button className="ad-modal-cancel" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="ad-modal-confirm" onClick={handleReject}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATE PREVIEW MODAL */}
      {certModalUrl && (
        <div className="ad-modal-overlay" onClick={() => setCertModalUrl(null)}>
          <div className="ad-cert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-cert-modal-header">
              <h2>Certificate Preview</h2>
              <button className="ad-cert-modal-close" onClick={() => setCertModalUrl(null)}>✕</button>
            </div>
            <div className="ad-cert-modal-body">
              {getViewerType(certModalUrl) === "pdf" ? (
                <iframe
                  src={getViewerUrl(certModalUrl)}
                  className="ad-cert-modal-iframe"
                  title="Certificate PDF"
                />
              ) : (
                <img
                  src={getViewerUrl(certModalUrl)}
                  className="ad-cert-modal-img"
                  alt="Certificate Full Size"
                />
              )}
            </div>
            <div className="ad-cert-modal-footer">
              <a
                href={certModalUrl}
                target="_blank"
                rel="noreferrer"
                className="ad-cert-modal-download"
              >
                ↗ Open in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
