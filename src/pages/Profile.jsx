import { useEffect, useState } from "react";
import API from "../api/api";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
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

        fetchProfile();
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("redirectAfterLogin");

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
                        {profile.average_trust_score}%
                    </h2>
                </div>
            </div>

            <div className="profile-details">
                <div className="profile-stats">
                    <div className="profile-stat-card">
                        <h2>{profile.total_campaigns}</h2>
                        <p>Campaigns</p>
                    </div>

                    <div className="profile-stat-card">
                        <h2>
                            ₹
                            {Number(
                                profile.total_funds_raised
                            ).toLocaleString("en-IN")}
                        </h2>
                        <p>Funds Raised</p>
                    </div>

                    <div className="profile-stat-card">
                        <h2>{profile.total_donations}</h2>
                        <p>Donations</p>
                    </div>

                    <div className="profile-stat-card">
                        <h2>{profile.wallet_status}</h2>
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
                        <b>{profile.wallet_status}</b>
                    </p>

                    <p>
                        Address:{" "}
                        <b>
                            {profile.wallet_address ||
                                "Connect MetaMask to display wallet address"}
                        </b>
                    </p>
                </div>

                <div className="activity-box">
                    <h2>Recent Activity</h2>

                    {profile.recent_activity.length > 0 ? (
                        profile.recent_activity.map(
                            (activity, index) => (
                                <p key={index}>
                                    ✔ {activity}
                                </p>
                            )
                        )
                    ) : (
                        <p>No recent activity available.</p>
                    )}
                </div>

                <div className="profile-buttons">
                    <button className="primary-btn">
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