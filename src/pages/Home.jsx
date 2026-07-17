import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardChart from "../components/DashboardChart";
import API from "../api/api";

function Home() {
    const username =
        sessionStorage.getItem("username") || "User";

    const [stats, setStats] = useState(null);
    const [walletAddress, setWalletAddress] = useState("");
    const [loading, setLoading] = useState(true);

    // =====================================================
    // LOAD DASHBOARD DATA
    // =====================================================

    useEffect(() => {
        fetchDashboardStats();
        checkWalletConnection();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await API.get("/dashboard/stats");
            setStats(response.data);
        } catch (error) {
            console.error("Dashboard API error:", error);

            setStats({
                total_campaigns: 0,
                funds_raised: 0,
                average_trust: 0,
                total_donors: 0,
                recent_campaigns: [],
                notifications: [],
            });
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // CHECK METAMASK CONNECTION
    // =====================================================

    const checkWalletConnection = async () => {
        if (!window.ethereum) {
            return;
        }

        try {
            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });

            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
            }
        } catch (error) {
            console.error(
                "Wallet connection check failed:",
                error
            );
        }
    };

    // =====================================================
    // CONNECT METAMASK
    // =====================================================

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert(
                "MetaMask is not installed. Please install MetaMask first."
            );
            return;
        }

        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
            }
        } catch (error) {
            console.error(
                "MetaMask connection error:",
                error
            );

            alert("Unable to connect MetaMask.");
        }
    };

    // =====================================================
    // SHORT WALLET ADDRESS
    // =====================================================

    const shortenWallet = (address) => {
        if (!address) {
            return "";
        }

        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="dashboard-page">
                <h1>Loading dashboard...</h1>
            </div>
        );
    }

    const recentCampaigns =
        stats?.recent_campaigns || [];

    const notifications =
        stats?.notifications || [];

    return (
        <div className="dashboard-page">

            {/* =================================================
                HERO
            ================================================= */}

            <div className="dashboard-hero">

                <div>
                    <p className="small-title">
                        Dashboard
                    </p>

                    <h1>
                        Welcome,{" "}
                        <span>{username} 👋</span>
                    </h1>

                    <p>
                        Manage your blockchain crowdfunding
                        campaigns, monitor AI trust scores,
                        and track donations securely in one
                        place.
                    </p>
                </div>

                <div className="wallet-status">

                    <h3>MetaMask Wallet</h3>

                    {walletAddress ? (
                        <>
                            <span className="wallet-chip">
                                🟢 Connected
                            </span>

                            <p
                                style={{
                                    marginTop: "12px",
                                    color: "#94a3b8",
                                }}
                            >
                                {shortenWallet(
                                    walletAddress
                                )}
                            </p>
                        </>
                    ) : (
                        <button
                            className="action-card"
                            onClick={connectWallet}
                        >
                            🦊 Connect Wallet
                        </button>
                    )}

                </div>

            </div>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="dashboard-stats">

                <div className="dash-card">
                    <span>📢</span>

                    <h2>
                        {stats?.total_campaigns || 0}
                    </h2>

                    <p>Total Campaigns</p>
                </div>

                <div className="dash-card">
                    <span>💰</span>

                    <h2>
                        ₹
                        {Number(
                            stats?.funds_raised || 0
                        ).toLocaleString("en-IN")}
                    </h2>

                    <p>Funds Raised</p>
                </div>

                <div className="dash-card">
                    <span>🤖</span>

                    <h2>
                        {Number(
                            stats?.average_trust || 0
                        ).toFixed(0)}
                        %
                    </h2>

                    <p>Average AI Trust</p>
                </div>

                <div className="dash-card">
                    <span>❤️</span>

                    <h2>
                        {stats?.total_donors || 0}
                    </h2>

                    <p>Total Donors</p>
                </div>

            </div>

            {/* =================================================
                DASHBOARD CONTENT
            ================================================= */}

            <div className="dashboard-content">

                {/* RECENT CAMPAIGNS */}

                <div className="dashboard-panel">

                    <h2>Recent Campaigns</h2>

                    {recentCampaigns.length === 0 ? (
                        <div className="notification">
                            No campaigns created yet.
                        </div>
                    ) : (
                        recentCampaigns.map(
                            (campaign, index) => (

                                <div
                                    className="campaign-item"
                                    key={
                                        campaign.id ||
                                        index
                                    }
                                >

                                    <div>
                                        <h3>
                                            {
                                                campaign.title
                                            }
                                        </h3>

                                        <p>
                                            {
                                                campaign.category
                                            }
                                        </p>
                                    </div>

                                    <span
                                        className={
                                            campaign.status ===
                                                "warning"
                                                ? "warning-badge"
                                                : "success-badge"
                                        }
                                    >
                                        {campaign.trust}
                                    </span>

                                </div>

                            )
                        )
                    )}

                </div>

                {/* NOTIFICATIONS */}

                <div className="dashboard-panel">

                    <h2>Notifications</h2>

                    {notifications.length === 0 ? (
                        <div className="notification">
                            No new notifications.
                        </div>
                    ) : (
                        notifications.map(
                            (
                                notification,
                                index
                            ) => (

                                <div
                                    className="notification"
                                    key={index}
                                >
                                    {notification}
                                </div>

                            )
                        )
                    )}

                </div>

            </div>

            {/* =================================================
                CHART
            ================================================= */}

            <div className="analytics-box">

                <h2>
                    Campaign Performance
                </h2>

                <DashboardChart />

            </div>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div className="quick-actions">

                <Link
                    to="/create"
                    className="action-card"
                >
                    ➕ Create Campaign
                </Link>

                <Link
                    to="/campaigns"
                    className="action-card"
                >
                    📋 View Campaigns
                </Link>

                <Link
                    to="/my-campaigns"
                    className="action-card"
                >
                    📂 My Campaigns
                </Link>

                <Link
                    to="/profile"
                    className="action-card"
                >
                    👤 My Profile
                </Link>

                <button
                    type="button"
                    className="action-card"
                    onClick={connectWallet}
                >
                    {walletAddress
                        ? `🟢 ${shortenWallet(
                            walletAddress
                        )}`
                        : "🦊 Connect Wallet"}
                </button>

            </div>

        </div>
    );
}

export default Home;