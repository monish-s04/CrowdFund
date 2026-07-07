import { Link } from "react-router-dom";
import DashboardChart from "../components/DashboardChart";

function Home() {
    return (
        <div className="dashboard-page">

            <div className="dashboard-hero">

                <div>
                    <p className="small-title">Dashboard</p>

                    <h1>
                        Welcome Back, <span>Surya 👋</span>
                    </h1>

                    <p>
                        Manage your blockchain crowdfunding campaigns,
                        monitor AI trust scores, and track donations
                        securely in one place.
                    </p>
                </div>

                <div className="wallet-status">
                    <h3>Wallet</h3>
                    <span className="wallet-chip">
                        🟢 Connected
                    </span>
                </div>

            </div>

            <div className="dashboard-stats">

                <div className="dash-card">
                    <span>📢</span>
                    <h2>12</h2>
                    <p>Total Campaigns</p>
                </div>

                <div className="dash-card">
                    <span>💰</span>
                    <h2>₹4.5L</h2>
                    <p>Funds Raised</p>
                </div>

                <div className="dash-card">
                    <span>🤖</span>
                    <h2>94%</h2>
                    <p>Average AI Trust</p>
                </div>

                <div className="dash-card">
                    <span>❤️</span>
                    <h2>356</h2>
                    <p>Total Donors</p>
                </div>

            </div>

            <div className="dashboard-content">

                <div className="dashboard-panel">

                    <h2>Recent Campaigns</h2>

                    <div className="campaign-item">
                        <div>
                            <h3>Medical Help for Child</h3>
                            <p>Healthcare</p>
                        </div>

                        <span className="success-badge">
                            91% Trust
                        </span>
                    </div>

                    <div className="campaign-item">
                        <div>
                            <h3>Education Support</h3>
                            <p>Education</p>
                        </div>

                        <span className="success-badge">
                            86% Trust
                        </span>
                    </div>

                    <div className="campaign-item">
                        <div>
                            <h3>Startup Funding</h3>
                            <p>Business</p>
                        </div>

                        <span className="warning-badge">
                            78% Trust
                        </span>
                    </div>

                </div>

                <div className="dashboard-panel">

                    <h2>Notifications</h2>

                    <div className="notification">
                        ✅ Campaign Approved
                    </div>

                    <div className="notification">
                        💰 Donation Received
                    </div>

                    <div className="notification">
                        🤖 AI Review Completed
                    </div>

                    <div className="notification">
                        ⛓ Wallet Connected
                    </div>

                </div>

            </div>

            <div className="analytics-box">

                <h2>Campaign Performance</h2>

                <DashboardChart />

            </div>

            <div className="quick-actions">

                <Link to="/create" className="action-card">
                    ➕ Create Campaign
                </Link>

                <Link to="/campaigns" className="action-card">
                    📋 View Campaigns
                </Link>

                <Link to="/profile" className="action-card">
                    👤 My Profile
                </Link>

                <button className="action-card">
                    💳 Connect Wallet
                </button>

            </div>

        </div>
    );
}

export default Home;