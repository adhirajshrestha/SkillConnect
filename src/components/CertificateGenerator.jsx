import React, { useRef } from "react";
import "./CertificateGenerator.css";

/**
 * CertificateGenerator
 * 
 * Renders an off-screen certificate div, captures it with html2canvas,
 * converts to PDF with jsPDF, and POSTs the base64 PDF to the backend.
 * 
 * Usage: call the exported `generateAndIssueCertificate(params)` function
 * from the parent component.
 */

const CertificateTemplate = React.forwardRef(({ student, courseName, issuedDate, certId }, ref) => {
    const formattedDate = new Date(issuedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="cert-canvas" ref={ref}>
            {/* Decorative border */}
            <div className="cert-border-outer">
                <div className="cert-border-inner">

                    {/* Header */}
                    <div className="cert-header">
                        <div className="cert-logo-row">
                            <span className="cert-logo-icon">⚡</span>
                            <span className="cert-logo-text">SkillConnect</span>
                        </div>
                        <div className="cert-header-label">Certificate of Completion</div>
                    </div>

                    {/* Divider */}
                    <div className="cert-divider-fancy">
                        <span className="cert-divider-star">✦</span>
                    </div>

                    {/* Body */}
                    <div className="cert-body">
                        <p className="cert-presents">This is to certify that</p>
                        <h1 className="cert-student-name">{student.name}</h1>
                        <p className="cert-presents">has successfully completed the course</p>
                        <h2 className="cert-course-name">"{courseName}"</h2>
                        <p className="cert-presents cert-with-distinction">
                            and is awarded this certificate in recognition of their dedication and achievement.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="cert-divider-fancy">
                        <span className="cert-divider-star">✦</span>
                    </div>

                    {/* Footer */}
                    <div className="cert-footer">
                        <div className="cert-footer-left">
                            <div className="cert-footer-line" />
                            <p className="cert-footer-label">Date of Issue</p>
                            <p className="cert-footer-value">{formattedDate}</p>
                        </div>
                        <div className="cert-footer-center">
                            <div className="cert-seal">
                                <span className="cert-seal-inner">SC</span>
                            </div>
                        </div>
                        <div className="cert-footer-right">
                            <div className="cert-footer-line" />
                            <p className="cert-footer-label">Certificate ID</p>
                            <p className="cert-footer-value cert-id-value">{certId}</p>
                        </div>
                    </div>

                    {/* Watermark */}
                    <div className="cert-watermark">SkillConnect</div>
                </div>
            </div>
        </div>
    );
});

CertificateTemplate.displayName = "CertificateTemplate";

export default CertificateTemplate;
