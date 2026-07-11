import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardChart from "../components/DashboardChart";
import API from "../api/api";

function Home() {
    const username = sessionStorage.getItem("username") || "User";

    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await API.get("/dashboard/stats");
                setStats(response.data);
            } catch (error) {
                console.log("Dashboard API error:", error);
            }
        };

        fetchDashboardStats();
    }, []);

    if (!stats) {
        return (
            <div className="dashboard-page">
                <h1>Loading dashboard...</h1>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            <div className="dashboard-hero">
                <div>
                    <p className="small-title">Dashboard</p>

                    <h1>
                        Welcome, <span>{username} 👋</span>
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
                    <h2>{stats.total_campaigns}</h2>
                    <p>Total Campaigns</p>
                </div>

                <div className="dash-card">
                    <span>💰</span>
                    <h2>{stats.funds_raised}</h2>
                    <p>Funds Raised</p>
                </div>

                <div className="dash-card">
                    <span>🤖</span>
                    <h2>{stats.average_trust}</h2>
                    <p>Average AI Trust</p>
                </div>

                <div className="dash-card">
                    <span>❤️</span>
                    <h2>{stats.total_donors}</h2>
                    <p>Total Donors</p>
                </div>

            </div>

            <div className="dashboard-content">

                <div className="dashboard-panel">
                    <h2>Recent Campaigns</h2>

                    {stats.recent_campaigns.map((campaign, index) => (
                        <div className="campaign-item" key={index}>
                            <div>
                                <h3>{campaign.title}</h3>
                                <p>{campaign.category}</p>
                            </div>

                            <span
                                className={
                                    campaign.status === "warning"
                                        ? "warning-badge"
                                        : "success-badge"
                                }
                            >
                                {campaign.trust}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="dashboard-panel">
                    <h2>Notifications</h2>

                    {stats.notifications.map((notification, index) => (
                        <div className="notification" key={index}>
                            {notification}
                        </div>
                    ))}
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

                <Link to="/my-campaigns" className="action-card">
                    📂 My Campaigns
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