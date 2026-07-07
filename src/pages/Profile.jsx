import { Link } from "react-router-dom";

function Profile() {

    return (

        <div className="profile-page">

            <div className="profile-card">

                <img
                    src="https://i.pravatar.cc/220?img=12"
                    alt="profile"
                />

                <h1>Surya</h1>

                <p>Campaign Creator</p>

                <div className="profile-badge">
                    🟢 Blockchain Verified
                </div>

                <div className="profile-score">
                    🤖 AI Trust Score
                    <h2>94%</h2>
                </div>

            </div>

            <div className="profile-details">

                <div className="profile-stats">

                    <div className="profile-stat-card">
                        <h2>12</h2>
                        <p>Campaigns</p>
                    </div>

                    <div className="profile-stat-card">
                        <h2>₹4.52L</h2>
                        <p>Funds Raised</p>
                    </div>

                    <div className="profile-stat-card">
                        <h2>186</h2>
                        <p>Donations</p>
                    </div>

                    <div className="profile-stat-card">
                        <h2>Connected</h2>
                        <p>Wallet</p>
                    </div>

                </div>

                <div className="achievement-box">

                    <h2>Achievements</h2>

                    <p>🏆 Trusted Creator</p>

                    <p>⭐ AI Verified</p>

                    <p>⛓ Ethereum Verified</p>

                    <p>💎 Top Fundraiser</p>

                </div>

                <div className="wallet-box">

                    <h2>Wallet Address</h2>

                    <p>0x5A24B67F83C12A9D7F0E6A14B7C8D91E2F4A7FD8</p>

                </div>

                <div className="activity-box">

                    <h2>Recent Activity</h2>

                    <p>✔ Created Medical Support Campaign</p>

                    <p>✔ Received ₹15,000 Donation</p>

                    <p>✔ Connected MetaMask Wallet</p>

                </div>

                <div className="profile-buttons">

                    <button className="primary-btn">
                        Edit Profile
                    </button>

                    <Link to="/" className="secondary-btn">
                        Logout
                    </Link>

                </div>

            </div>

        </div>

    );

}

export default Profile;