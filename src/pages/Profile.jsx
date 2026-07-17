import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { clearAuthData } from "../utils/auth";

function Profile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [walletAddress, setWalletAddress] = useState("");

    useEffect(() => {
        fetchProfile();
        checkWalletConnection();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await API.get("/profile/me");
            setProfile(response.data);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Failed to load profile"
            );
        }
    };

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
        } catch (err) {
            console.error(
                "Unable to check wallet connection:",
                err
            );
        }
    };

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
        } catch (err) {
            alert("Unable to connect MetaMask.");
        }
    };

    const shortenWallet = (address) => {
        if (!address) {
            return "";
        }

        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleLogout = () => {
        clearAuthData();
        window.location.href = "/";
    };

    if (error) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <h2>{error}</h2>

                    <button
                        onClick={handleLogout}
                        className="secondary-btn"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <h2>Loading profile...</h2>
                </div>
            </div>
        );
    }

    const recentActivity =
        profile.recent_activity || [];

    const walletStatus =
        walletAddress
            ? "Connected"
            : "Not Connected";

    return (
        <div className="profile-page">

            <div className="profile-card">

                <img
                    src="https://i.pravatar.cc/220?img=12"
                    alt={`${profile.full_name} profile`}
                />

                <h1>{profile.full_name}</h1>

                <p>{profile.email}</p>

                <p className="profile-role">
                    {profile.role === "admin"
                        ? "Administrator"
                        : "Campaign Creator"}
                </p>

                <div className="profile-badge">
                    🟢 Verified BlockFund User
                </div>

                <div className="profile-score">
                    🤖 Average AI Trust Score

                    <h2>
                        {Number(
                            profile.average_trust_score || 0
                        ).toFixed(1)}
                        %
                    </h2>
                </div>

            </div>

            <div className="profile-details">

                <div className="profile-stats">

                    <div className="profile-stat-card">
                        <h2>
                            {profile.total_campaigns || 0}
                        </h2>
                        <p>Campaigns</p>
                    </div>

                    <div className="profile-stat-card">
                        <h2>
                            ₹
                            {Number(
                                profile.total_funds_raised || 0
                            ).toLocaleString("en-IN")}
                        </h2>
                        <p>Funds Raised</p>
                    </div>

                    <div className="profile-stat-card">
                        <h2>
                            {profile.total_donations || 0}
                        </h2>
                        <p>Donations Received</p>
                    </div>

                    <div className="profile-stat-card">
                        <h2>{walletStatus}</h2>
                        <p>Wallet</p>
                    </div>

                </div>

                <div className="achievement-box">

                    <h2>Achievements</h2>

                    {profile.total_campaigns > 0 ? (
                        <>
                            <p>🏆 Campaign Creator</p>
                            <p>⭐ AI Evaluated Campaigns</p>
                            <p>🔒 Verified Account</p>

                            {profile.total_funds_raised > 0 && (
                                <p>💰 Successful Fundraiser</p>
                            )}
                        </>
                    ) : (
                        <p>
                            Create your first campaign to unlock
                            achievements.
                        </p>
                    )}

                </div>

                <div className="wallet-box">

                    <h2>Wallet Information</h2>

                    <p>
                        Status:{" "}
                        <b>{walletStatus}</b>
                    </p>

                    <p>
                        Address:{" "}
                        <b>
                            {walletAddress
                                ? shortenWallet(walletAddress)
                                : "MetaMask not connected"}
                        </b>
                    </p>

                    {!walletAddress && (
                        <button
                            type="button"
                            className="primary-btn"
                            onClick={connectWallet}
                        >
                            🦊 Connect MetaMask
                        </button>
                    )}

                </div>

                <div className="activity-box">

                    <h2>Recent Activity</h2>

                    {recentActivity.length > 0 ? (
                        recentActivity.map(
                            (activity, index) => (
                                <p key={index}>
                                    ✔ {activity}
                                </p>
                            )
                        )
                    ) : (
                        <p>
                            No recent activity available.
                        </p>
                    )}

                </div>

                <div className="profile-buttons">

                    <button
                        className="primary-btn"
                        onClick={() =>
                            navigate("/edit-profile")
                        }
                    >
                        Edit Profile
                    </button>

                    <button
                        onClick={handleLogout}
                        className="secondary-btn"
                    >
                        Logout
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Profile;