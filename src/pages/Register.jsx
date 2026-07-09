import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api/api";

function Register() {
    const navigate = useNavigate();

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedRole = localStorage.getItem("role");

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    if (isLoggedIn) {
        return (
            <Navigate
                to={storedRole === "admin" ? "/admin-dashboard" : "/home"}
                replace
            />
        );
    }

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            await API.post("/auth/register", {
                full_name: fullName,
                email: email,
                password: password,
                role: "user",
            });

            alert("Registration successful! Please login.");
            navigate("/login");
        } catch (error) {
            alert(error.response?.data?.detail || "Registration failed");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-wrapper">

                <div className="auth-info">
                    <div className="auth-logo-box">BF</div>

                    <h1>Join BlockFund AI</h1>

                    <p>
                        Create campaigns, build donor trust, and publish
                        transparent blockchain-backed fundraising projects.
                    </p>

                    <div className="auth-points">
                        <span>✅ Verified Creator Profile</span>
                        <span>📢 Campaign Management</span>
                        <span>🔒 Secure Funding Flow</span>
                    </div>
                </div>

                <div className="auth-card">
                    <h2>Create Account</h2>

                    <p className="auth-subtitle">
                        Register as a campaign creator or donor
                    </p>

                    <form onSubmit={handleRegister}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />

                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />

                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create password"
                            required
                        />

                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            required
                        />

                        <button type="submit" className="login-btn">
                            Register
                        </button>
                    </form>

                    <div className="auth-switch">
                        Already have an account? <Link to="/login">Login</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Register;