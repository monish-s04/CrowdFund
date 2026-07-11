import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

function CampaignDetails() {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);

    const getDefaultImage = (category) => {
        if (category === "Healthcare") {
            return "https://images.unsplash.com/photo-1576091160550-2173dba999ef";
        }

        if (category === "Education") {
            return "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b";
        }

        if (category === "Disaster Relief") {
            return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
        }

        if (category === "Business") {
            return "https://images.unsplash.com/photo-1556761175-4b46a572b786";
        }

        return "https://images.unsplash.com/photo-1559027615-cd4628902d4a";
    };

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await API.get(`/campaigns/${id}`);
                setCampaign(response.data);
            } catch (error) {
                alert("Campaign not found");
            }
        };

        fetchCampaign();
    }, [id]);

    const donate = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask");
            return;
        }

        alert("Donation feature will be connected with smart contract later.");
    };

    if (!campaign) {
        return (
            <div className="campaign-details-page">
                <h1>Loading campaign...</h1>
            </div>
        );
    }

    const percentage = Math.min(
        (campaign.raised_amount / campaign.goal_amount) * 100,
        100
    ).toFixed(0);

    return (
        <div className="campaign-details-page">
            <div className="details-title">
                <p className="small-title">Campaign Details</p>
                <h1>{campaign.title}</h1>
                <p>
                    Transparent fundraising powered by AI evaluation and blockchain verification.
                </p>
            </div>

            <div className="details-layout">
                <div className="details-left">
                    <img
                        src={getDefaultImage(campaign.category)}
                        alt={campaign.title}
                        className="details-main-img"
                    />

                    <div className="story-card">
                        <h2>Campaign Story</h2>
                        <p>{campaign.description}</p>
                    </div>

                    <div className="story-card">
                        <h2>Supporting Documents</h2>
                        <div className="doc-row">✅ Identity Verification Completed</div>
                        <div className="doc-row">✅ AI Trust Evaluation Completed</div>
                        <div className="doc-row">✅ Blockchain Verification Ready</div>
                    </div>
                </div>

                <div className="details-right">
                    <div className="overview-card">
                        <span className="category-chip">{campaign.category}</span>
                        <h2>Campaign Overview</h2>

                        <div className="amount-row">
                            <div>
                                <h3>₹{Number(campaign.raised_amount).toLocaleString("en-IN")}</h3>
                                <p>Raised</p>
                            </div>

                            <div>
                                <h3>₹{Number(campaign.goal_amount).toLocaleString("en-IN")}</h3>
                                <p>Goal</p>
                            </div>
                        </div>

                        <div className="progress-info">
                            <span>{percentage}% Funded</span>
                            <span>{campaign.duration_days} Days</span>
                        </div>

                        <div className="progress-bar">
                            <div style={{ width: `${percentage}%` }}></div>
                        </div>

                        <button onClick={donate} className="donate-btn">
                            Donate with MetaMask
                        </button>
                    </div>

                    <div className="ai-analysis-card">

                        <h2>🤖 AI Trust Analysis</h2>

                        <div className="trust-circle">
                            <h3>{campaign.trust_score}%</h3>
                            <p>Trust Score</p>
                        </div>

                        <p>
                            ⚠ Risk Level :
                            <b> {campaign.risk_level}</b>
                        </p>

                        <p>
                            📈 Success Probability :
                            <b> {campaign.success_probability}%</b>
                        </p>

                        <p>
                            💡 Recommendation
                        </p>

                        <div className="recommendation-box">
                            {campaign.recommendation}
                        </div>

                    </div>

                    <div className="verify-card">
                        <h2>Campaign Status</h2>
                        <p>📌 Status: <b>{campaign.status}</b></p>
                        <p>⛓ Blockchain Status: <b>Ready</b></p>
                        <p>🦊 Wallet: <b>MetaMask Supported</b></p>
                    </div>

                    <div className="verify-card">
                        <h2>Creator Information</h2>
                        <p>👤 Created By: <b>{campaign.creator_name}</b></p>
                        <p>⭐ Creator Status: <b>Verified</b></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CampaignDetails;