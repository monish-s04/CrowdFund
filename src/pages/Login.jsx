import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("demo@blockfund.ai");
    const [password, setPassword] = useState("Demo@123");
    const [role, setRole] = useState("user");

    const handleLogin = (e) => {
        e.preventDefault();

        if (role === "admin" && email === "admin@blockfund.ai" && password === "Admin@123") {
            navigate("/admin-dashboard");
            return;
        }

        if (role === "user" && email === "demo@blockfund.ai" && password === "Demo@123") {
            navigate("/home");
            return;
        }

        alert("Invalid credentials");
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
                        <label>Login Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="user">User Login</option>
                            <option value="admin">Admin Login</option>
                        </select>

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

                        <button type="submit" className="login-btn">Login</button>
                    </form>

                    <div className="auth-switch">
                        Don&apos;t have an account? <Link to="/register">Create account</Link>
                    </div>

                    <div className="demo-box">
                        <h3>Demo Credentials</h3>
                        <p><b>User:</b> demo@blockfund.ai / Demo@123</p>
                        <p><b>Admin:</b> admin@blockfund.ai / Admin@123</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;