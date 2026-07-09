import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api/api";

function Login() {
    const navigate = useNavigate();

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedRole = localStorage.getItem("role");

    const [email, setEmail] = useState("surya@gmail.com");
    const [password, setPassword] = useState("Surya@123");

    if (isLoggedIn) {
        return (
            <Navigate
                to={storedRole === "admin" ? "/admin-dashboard" : "/home"}
                replace
            />
        );
    }

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await API.post("/auth/login", {
                email: email,
                password: password,
            });

            localStorage.setItem("token", response.data.access_token);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("role", response.data.user.role);
            localStorage.setItem("username", response.data.user.full_name);
            localStorage.setItem("userId", response.data.user.id);

            const redirect = localStorage.getItem("redirectAfterLogin");

            if (redirect) {
                localStorage.removeItem("redirectAfterLogin");
                navigate(redirect);
            } else if (response.data.user.role === "admin") {
                navigate("/admin-dashboard");
            } else {
                navigate("/home");
            }
        } catch (error) {
            alert(error.response?.data?.detail || "Login failed");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-wrapper">
                <div className="auth-info">
                    <div className="auth-logo-box">BF</div>
                    <h1>BlockFund AI</h1>
                    <p>
                        Secure crowdfunding powered by Blockchain transparency and AI-based
                        campaign trust evaluation.
                    </p>

                    <div className="auth-points">
                        <span>🤖 AI Trust Score</span>
                        <span>⛓ Blockchain Verified</span>
                        <span>💳 MetaMask Donations</span>
                    </div>
                </div>

                <div className="auth-card">
                    <h2>Login</h2>
                    <p className="auth-subtitle">Access your BlockFund AI account</p>

                    <form onSubmit={handleLogin}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button type="submit" className="login-btn">
                            Login
                        </button>
                    </form>

                    <div className="auth-switch">
                        Don&apos;t have an account? <Link to="/register">Create account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;