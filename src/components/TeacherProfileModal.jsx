import React from "react";
import { X, ExternalLink, UserRound, BookOpen, Briefcase, MessageCircle } from "lucide-react";
import "./TeacherProfileModal.css";

const TeacherProfileModal = ({ teacher, onClose }) => {
    if (!teacher) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="tpm-backdrop" onClick={handleBackdropClick}>
            <div className="tpm-modal">
                {/* Close button */}
                <button className="tpm-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="tpm-header">
                    <div className="tpm-avatar-wrapper">
                        {teacher.avatar ? (
                            <img src={teacher.avatar} alt={teacher.name} className="tpm-avatar-img" />
                        ) : (
                            <div className="tpm-avatar-placeholder">
                                <UserRound size={40} />
                            </div>
                        )}
                    </div>
                    <div className="tpm-header-info">
                        <h2 className="tpm-name">{teacher.name}</h2>
                        <span className="tpm-role-badge">Teacher</span>
                    </div>
                </div>

                <div className="tpm-divider" />

                {/* What's on your mind (status) */}
                {teacher.status && teacher.status !== "Whats on your mind ?" && (
                    <div className="tpm-section">
                        <div className="tpm-section-label">
                            <MessageCircle size={15} className="tpm-section-icon" />
                            What's on my mind
                        </div>
                        <p className="tpm-section-content tpm-status">"{teacher.status}"</p>
                    </div>
                )}

                {/* About Me (bio) */}
                {teacher.bio && (
                    <div className="tpm-section">
                        <div className="tpm-section-label">
                            <UserRound size={15} className="tpm-section-icon" />
                            About Me
                        </div>
                        <p className="tpm-section-content">{teacher.bio}</p>
                    </div>
                )}

                {/* Qualification */}
                {teacher.qualification && (
                    <div className="tpm-section">
                        <div className="tpm-section-label">
                            <BookOpen size={15} className="tpm-section-icon" />
                            Qualification
                        </div>
                        <p className="tpm-section-content">{teacher.qualification}</p>
                    </div>
                )}

                {/* Experience */}
                {teacher.experience && (
                    <div className="tpm-section">
                        <div className="tpm-section-label">
                            <Briefcase size={15} className="tpm-section-icon" />
                            Experience
                        </div>
                        <p className="tpm-section-content">{teacher.experience}</p>
                    </div>
                )}

                {/* LinkedIn */}
                {teacher.linkedinUrl && (
                    <div className="tpm-section">
                        <a
                            href={teacher.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tpm-linkedin-btn"
                        >
                            <ExternalLink size={18} />
                            View LinkedIn Profile
                        </a>
                    </div>
                )}

                {/* Empty state if no extra info */}
                {!teacher.status || teacher.status === "Whats on your mind ?" ? (
                    !teacher.bio && !teacher.qualification && !teacher.experience && !teacher.linkedinUrl && (
                        <p className="tpm-empty">This teacher hasn't filled in their profile yet.</p>
                    )
                ) : null}
            </div>
        </div>
    );
};

export default TeacherProfileModal;
