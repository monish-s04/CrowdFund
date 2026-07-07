import { Link } from "react-router-dom";

function CampaignCard({ campaign }) {
    const percentage = Math.min((campaign.raised / campaign.goal) * 100, 100).toFixed(0);

    return (
        <div className="campaign-card">
            <div className="campaign-img-box">
                <img src={campaign.image} alt={campaign.title} />
                <span className="category-badge">{campaign.category}</span>
            </div>

            <div className="card-content">
                <div className="card-title-row">
                    <h3>{campaign.title}</h3>
                    {campaign.verified && <span className="verified-badge">Verified</span>}
                </div>

                <p>{campaign.description}</p>

                <div className="trust-box">
                    🤖 AI Trust Score: <b>{campaign.trustScore}%</b>
                </div>

                <div className="progress-info">
                    <span>₹{campaign.raised}</span>
                    <span>{percentage}% funded</span>
                </div>

                <div className="progress-bar">
                    <div style={{ width: `${percentage}%` }}></div>
                </div>

                <p className="goal-text">Goal: ₹{campaign.goal}</p>

                <Link to={`/campaign/${campaign.id}`} className="view-btn">
                    View Details
                </Link>
            </div>
        </div>
    );
}

export default CampaignCard;