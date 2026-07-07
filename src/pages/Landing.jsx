import { Link } from "react-router-dom";

function Landing() {
    return (
        <div className="landing">
            <section className="landing-hero">
                <div className="landing-left">
                    <span className="badge">🚀 Next-Gen Crowdfunding Platform</span>

                    <h1>
                        Fund Ideas. <br />
                        Empower Change. <br />
                        <span>Built on Trust.</span>
                    </h1>

                    <p>
                        BlockFund AI combines Blockchain transparency and Artificial
                        Intelligence to create a secure, trustworthy, and efficient
                        crowdfunding platform.
                    </p>

                    <div className="landing-buttons">
                        <Link to="/login" className="primary-btn">
                            Start a Campaign
                        </Link>

                        <Link to="/login" className="secondary-btn">
                            Explore Campaigns
                        </Link>
                    </div>

                    <p className="secure-text">🔒 Secure • Transparent • AI-Powered</p>
                </div>

                <div className="landing-right">
                    <div className="trust-card">
                        <h3>AI Trust Score</h3>
                        <h2>92%</h2>
                        <p>High Trust</p>
                    </div>

                    <div className="mockup-card">
                        <h2>Save Earth Initiative</h2>
                        <p>Join hands to build a greener tomorrow.</p>
                        <h3>₹2,45,000 raised</h3>
                        <div className="progress-bar">
                            <div style={{ width: "49%" }}></div>
                        </div>
                        <button>Donate Now</button>
                    </div>
                </div>
            </section>

            <section className="stats-section">
                <div>
                    <h2>250+</h2>
                    <p>Active Campaigns</p>
                </div>
                <div>
                    <h2>12K+</h2>
                    <p>Happy Donors</p>
                </div>
                <div>
                    <h2>₹5.4Cr+</h2>
                    <p>Total Funds Raised</p>
                </div>
                <div>
                    <h2>98%</h2>
                    <p>Trust & Transparency</p>
                </div>
            </section>

            <section className="features">
                <h2>Powerful Features for a Better Future</h2>

                <div className="feature-grid">
                    <div className="feature-card">
                        <h3>⛓ Blockchain Security</h3>
                        <p>Every transaction is recorded on blockchain for transparency.</p>
                    </div>
                    <div className="feature-card">
                        <h3>🤖 AI Trust Evaluation</h3>
                        <p>AI analyzes campaigns and provides trust score.</p>
                    </div>
                    <div className="feature-card">
                        <h3>💳 Secure Donations</h3>
                        <p>Donate safely using MetaMask and blockchain wallet.</p>
                    </div>
                    <div className="feature-card">
                        <h3>📊 Real-Time Tracking</h3>
                        <p>Track funds, campaign progress, and donations.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Landing;