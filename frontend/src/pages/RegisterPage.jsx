import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate that role is selected
    if (!role) {
      showMessage("Please select a role (Manager, Admin, or Staff)");
      return;
    }
    
    try {
      const registerData = { name, email, password, phoneNumber, role };
      await ApiService.registerUser(registerData);
      setMessage("Registration Successfull");
      navigate("/login");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Registering a User: " + error
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
    <div className="auth-container">
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
      <h2>Register</h2>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />

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

        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
};

export default RegisterPage;
