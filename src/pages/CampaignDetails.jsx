function CampaignDetails() {
    const donate = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask");
            return;
        }

        alert("Donation feature will be connected with smart contract later.");
    };

    return (
        <div className="campaign-details-page">
            <div className="details-title">
                <p className="small-title">Campaign Details</p>
                <h1>Medical Help for Child</h1>
                <p>Transparent fundraising powered by AI evaluation and blockchain verification.</p>
            </div>

            <div className="details-layout">
                <div className="details-left">
                    <img
                        src="https://images.unsplash.com/photo-1576091160550-2173dba999ef"
                        alt="Medical Help Campaign"
                        className="details-main-img"
                    />

                    <div className="story-card">
                        <h2>Campaign Story</h2>
                        <p>
                            This campaign is created to raise funds for urgent medical treatment.
                            The collected amount will be used for hospital bills, medicines,
                            surgery expenses, and recovery support. Your contribution can help
                            save a life and support the family during this difficult time.
                        </p>
                    </div>

                    <div className="story-card">
                        <h2>Supporting Documents</h2>
                        <div className="doc-row">✅ Medical Report.pdf</div>
                        <div className="doc-row">✅ Hospital Estimate.pdf</div>
                        <div className="doc-row">✅ Identity Verification Completed</div>
                    </div>
                </div>

                <div className="details-right">
                    <div className="overview-card">
                        <span className="category-chip">Healthcare</span>
                        <h2>Campaign Overview</h2>

                        <div className="amount-row">
                            <div>
                                <h3>₹45,000</h3>
                                <p>Raised</p>
                            </div>
                            <div>
                                <h3>₹1,00,000</h3>
                                <p>Goal</p>
                            </div>
                        </div>

                        <div className="progress-info">
                            <span>45% Funded</span>
                            <span>18 Days Left</span>
                        </div>

                        <div className="progress-bar">
                            <div style={{ width: "45%" }}></div>
                        </div>

                        <button onClick={donate} className="donate-btn">
                            Donate with MetaMask
                        </button>
                    </div>

                    <div className="ai-analysis-card">
                        <h2>AI Trust Analysis</h2>

                        <div className="trust-circle">
                            <h3>91%</h3>
                            <p>Trust Score</p>
                        </div>

                        <p>✅ Risk Level: <b>Low</b></p>
                        <p>✅ Success Probability: <b>88%</b></p>
                        <p>✅ Recommendation: <b>Safe to Donate</b></p>
                    </div>

                    <div className="verify-card">
                        <h2>Blockchain Verification</h2>
                        <p>⛓ Smart Contract: <b>Verified</b></p>
                        <p>🦊 Wallet: <b>MetaMask Ready</b></p>
                        <p>🔐 Transaction Record: <b>Immutable</b></p>
                    </div>

                    <div className="verify-card">
                        <h2>Creator Information</h2>
                        <p>👤 Created By: <b>Rahul Sharma</b></p>
                        <p>📍 Location: <b>Bangalore, India</b></p>
                        <p>⭐ Creator Status: <b>Verified</b></p>
                    </div>
                </div>
            </div>

            <div className="bottom-details-grid">
                <div className="detail-panel">
                    <h2>Recent Donors</h2>
                    <p>Anil Kumar donated ₹5,000</p>
                    <p>Priya S donated ₹2,500</p>
                    <p>Rohan M donated ₹1,000</p>
                </div>

                <div className="detail-panel">
                    <h2>Blockchain Transactions</h2>
                    <p>0x34A...9B12 verified</p>
                    <p>0x76C...8FA2 verified</p>
                    <p>0x22D...1AC9 verified</p>
                </div>

                <div className="detail-panel">
                    <h2>Donation Statistics</h2>
                    <p>Total Donors: <b>126</b></p>
                    <p>Average Donation: <b>₹850</b></p>
                    <p>Highest Donation: <b>₹10,000</b></p>
                </div>
            </div>
        </div>
    );
}

export default CampaignDetails;