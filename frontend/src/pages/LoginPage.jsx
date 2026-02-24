import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate that role is selected
    if (!role) {
      showMessage("Please select a role (Manager, Admin, or Staff)");
      return;
    }
    
    try {
      const loginData = { email, password, role };
      const res = await ApiService.loginUser(loginData);

      console.log(res)

      if (res.status === 200) {
        ApiService.saveToken(res.token)
        ApiService.saveRole(res.role)
        setMessage(res.message)
        navigate("/dashboard")
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Loggin in a User: " + error
      );
      console.log(error);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  // Theme handling for standalone auth page
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    const dark = saved === "dark";
    setIsDark(dark);
    if (dark) document.documentElement.classList.add("dark-theme");
    else document.documentElement.classList.remove("dark-theme");
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) document.documentElement.classList.add("dark-theme");
    else document.documentElement.classList.remove("dark-theme");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <div className="auth-page">
      <div className="auth-topbar">
        <button
          className={`theme-toggle ${isDark ? "is-dark" : "is-light"}`}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          aria-pressed={isDark}
        >
          <span className="theme-icon" aria-hidden>🌙</span>
        </button>
      </div>
      <div className="bg-shapes" aria-hidden>
        <span className="shape s1" />
        <span className="shape s2" />
        <span className="shape s3" />
        <span className="shape s4" />
      </div>
      <div className="auth-card">
        <div className="auth-panel">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-sub">Sign in to continue to Inventory Management</p>

          {message && <div className="message">{message}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label className="sr-only">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="sr-only">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="sr-only">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">Sign In</button>
          </form>

          <p className="auth-footer">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </div>

        <div className="auth-aside" aria-hidden>
          <div className="brand">
            <h3>Inventory MGT</h3>
            <p>Manage stock, suppliers & transactions — effortlessly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
