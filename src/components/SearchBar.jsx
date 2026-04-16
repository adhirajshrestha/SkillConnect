import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, X as CloseIcon, Clock as HistoryIcon } from "lucide-react";
import "./SearchBar.css";

const SearchBar = ({ placeholder = "What's on your mind" }) => {
    const [query, setQuery] = useState("");
    const [history, setHistory] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    // Fetch history from backend
    const fetchHistory = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("http://localhost:5000/api/search-history", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setHistory(data);
            }
        } catch (err) {
            console.error("Failed to fetch search history:", err);
        }
    };

    // Save history to backend
    const saveHistory = async (searchTerm) => {
        if (!searchTerm.trim()) return;
        
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await fetch("http://localhost:5000/api/search-history", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ query: searchTerm.trim() })
            });
            fetchHistory(); // Refresh history
        } catch (err) {
            console.error("Failed to save search history:", err);
        }
    };

    const handleSearch = (e) => {
        if (e.key === "Enter") {
            saveHistory(query);
            setShowDropdown(false);
            // Add actual search logic here if needed (e.g., navigate to search results)
            console.log("Searching for:", query);
        }
    };

    const handleIconClick = () => {
        saveHistory(query);
        setShowDropdown(false);
    };

    const handleHistoryClick = (term) => {
        setQuery(term);
        saveHistory(term);
        setShowDropdown(false);
    };

    const deleteHistoryItem = async (e, id) => {
        e.stopPropagation();
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:5000/api/search-history/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) {
                setHistory(history.filter(item => item._id !== id));
            }
        } catch (err) {
            console.error("Failed to delete history item:", err);
        }
    };

    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="search-container">
            <div 
                className={`Search ${showDropdown ? "active" : ""}`} 
                ref={searchRef}
            >
                <SearchIcon className="SearchIcon" onClick={handleIconClick} />
                <input
                    type="text"
                    className="search-box"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    onFocus={() => {
                        fetchHistory();
                        setShowDropdown(true);
                    }}
                />
            </div>

            {showDropdown && history.length > 0 && (
                <div className="search-history-dropdown" ref={dropdownRef}>
                    <div className="dropdown-header">Recent Searches</div>
                    <ul className="history-list">
                        {history.map((item) => (
                            <li 
                                key={item._id} 
                                className="history-item"
                                onClick={() => handleHistoryClick(item.query)}
                            >
                                <div className="history-item-content">
                                    <HistoryIcon size={14} className="history-icon" />
                                    <span>{item.query}</span>
                                </div>
                                <CloseIcon 
                                    size={14} 
                                    className="delete-history-btn" 
                                    onClick={(e) => deleteHistoryItem(e, item._id)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
