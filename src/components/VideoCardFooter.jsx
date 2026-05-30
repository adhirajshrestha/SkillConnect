import { Eye, Newspaper as NewspaperIcon } from "lucide-react";
import "./VideoCardFooter.css";

const VideoCardFooter = ({ views = 0 }) => {
    const count = Number(views) || 0;

    return (
        <div className="video-card-footer">
            <span className="video-card-footer__cert">
                <NewspaperIcon size={14} aria-hidden />
                End the course with a certificate
            </span>
            <span className="video-card-footer__views" title={`${count} views`}>
                <Eye size={14} aria-hidden />
                {count.toLocaleString()}
            </span>
        </div>
    );
};

export default VideoCardFooter;
