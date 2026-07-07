import { Link, useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        navigate("/login");
    };

    return (
        <div className="auth-page">
            <div className="auth-wrapper">
                <div className="auth-info">
                    <div className="auth-logo-box">BF</div>
                    <h1>Join BlockFund AI</h1>
                    <p>
                        Create campaigns, build donor trust, and publish transparent
                        blockchain-backed fundraising projects.
                    </p>

                    <div className="auth-points">
                        <span>✅ Verified Creator Profile</span>
                        <span>📢 Campaign Management</span>
                        <span>🔒 Secure Funding Flow</span>
                    </div>
                </div>

                <div className="auth-card">
                    <h2>Create Account</h2>
                    <p className="auth-subtitle">Register as a campaign creator or donor</p>

                    <form onSubmit={handleRegister}>
                        <label>Full Name</label>
                        <input type="text" placeholder="Enter your full name" required />

                        <label>Email Address</label>
                        <input type="email" placeholder="Enter your email" required />

                        <label>Password</label>
                        <input type="password" placeholder="Create password" required />

                        <label>Confirm Password</label>
                        <input type="password" placeholder="Confirm password" required />

                        <button type="submit" className="login-btn">Register</button>
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