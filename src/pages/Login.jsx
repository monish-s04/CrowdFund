import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api/api";
import { isAuthenticated } from "../utils/auth";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const isLoggedIn = isAuthenticated();
    const storedRole = sessionStorage.getItem("role");

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
        setLoading(true);

        try {
            const response = await API.post("/auth/login", {
                email: email.trim(),
                password,
            });

            const { access_token, user } = response.data;

            sessionStorage.setItem("token", access_token);
            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("role", user.role);
            sessionStorage.setItem("username", user.full_name);
            sessionStorage.setItem("userId", String(user.id));

            const redirect = sessionStorage.getItem("redirectAfterLogin");

            if (redirect) {
                sessionStorage.removeItem("redirectAfterLogin");
                navigate(redirect, { replace: true });
            } else if (user.role === "admin") {
                navigate("/admin-dashboard", { replace: true });
            } else {
                navigate("/home", { replace: true });
            }
        } catch (error) {
            alert(
                error.response?.data?.detail ||
                "Unable to login. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-wrapper">
                <div className="auth-info">
                    <div className="auth-logo-box">BF</div>

                    <h1>BlockFund AI</h1>

                    <p>
                        Secure crowdfunding powered by blockchain transparency
                        and AI-based campaign trust evaluation.
                    </p>

                    <div className="auth-points">
                        <span>🤖 AI Trust Score</span>
                        <span>⛓ Blockchain Verified</span>
                        <span>💳 MetaMask Donations</span>
                    </div>
                </div>

                <div className="auth-card">
                    <h2>Login</h2>

                    <p className="auth-subtitle">
                        Access your BlockFund AI account
                    </p>

                    <form onSubmit={handleLogin} autoComplete="off">
                        <label htmlFor="login-email">
                            Email Address
                        </label>

                        <input
                            id="login-email"
                            type="email"
                            name="blockfund_login_email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="off"
                            placeholder="Enter your email"
                            required
                        />

                        <label htmlFor="login-password">
                            Password
                        </label>

                        <input
                            id="login-password"
                            type="password"
                            name="blockfund_login_password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            placeholder="Enter your password"
                            required
                        />

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="auth-switch">
                        Don&apos;t have an account?{" "}
                        <Link to="/register">
                            Create account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;