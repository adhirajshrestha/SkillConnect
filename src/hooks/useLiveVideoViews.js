import { useEffect, useRef } from "react";
import { getVideoViewStats } from "../services/videoService";

const POLL_MS = 4000;

export function getDisplayViews(video) {
    if (!video) return 0;
    if (typeof video.views === "number") return video.views;
    if (Array.isArray(video.watchedBy)) return video.watchedBy.length;
    return 0;
}

export function sortByViewsDesc(videos) {
    if (!Array.isArray(videos)) return [];
    return [...videos].sort((a, b) => getDisplayViews(b) - getDisplayViews(a));
}

/**
 * Merges latest view counts from the API into video list state (live updates).
 */
export function useLiveVideoViews(setVideos, { resortOnUpdate = false } = {}) {
    const setVideosRef = useRef(setVideos);
    const resortRef = useRef(resortOnUpdate);
    setVideosRef.current = setVideos;
    resortRef.current = resortOnUpdate;

    useEffect(() => {
        const syncViews = async () => {
            try {
                const stats = await getVideoViewStats();
                if (!Array.isArray(stats) || stats.length === 0) return;

                const viewMap = Object.fromEntries(stats.map((s) => [s.id, s.views]));

                setVideosRef.current((prev) => {
                    if (!Array.isArray(prev) || prev.length === 0) return prev;
                    const updated = prev.map((video) => {
                        if (!video._id) return video;
                        const id = video._id.toString();
                        if (viewMap[id] === undefined) return video;
                        return { ...video, views: viewMap[id] };
                    });
                    return resortRef.current ? sortByViewsDesc(updated) : updated;
                });
            } catch (err) {
                console.warn("Could not refresh view counts:", err);
            }
        };

        syncViews();
        const interval = setInterval(syncViews, POLL_MS);
        return () => clearInterval(interval);
    }, []);
}
