import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        const initial = saved ? saved : "light";
        setTheme(initial);
        applyTheme(initial);
    }, []);

    const applyTheme = (t) => {
        const root = document.documentElement;
        if (t === "dark") {
            root.classList.add("dark-theme");
        } else {
            root.classList.remove("dark-theme");
        }
    };

    const toggleTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        localStorage.setItem("theme", next);
        applyTheme(next);
    };

    return (
        <div className="layout">
            <Sidebar />
            <div className="main-content">
                <header className="app-header">
                    <div />
                    <div>
                        <button
                            className={`theme-toggle ${theme === "dark" ? "is-dark" : "is-light"}`}
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            aria-pressed={theme === "dark"}
                        >
                            <span className="theme-icon" aria-hidden>🌙</span>
                        </button>
                    </div>
                </header>

                <div className="page-wrap">{children}</div>
            </div>
        </div>
    );
};

export default Layout;