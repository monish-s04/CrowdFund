import { Link } from "react-router-dom";

function CampaignCard({
    campaign,
    showActions = false,
    onEdit = () => { },
    onDelete = () => { },
}) {
    const goal = Number(campaign.goal || 0);
    const raised = Number(campaign.raised || 0);

    const percentage =
        goal > 0
            ? Math.min((raised / goal) * 100, 100).toFixed(0)
            : 0;

    const status = campaign.status || "Pending";

    const getStatusClass = () => {
        if (status === "Approved") {
            return "campaign-status-approved";
        }

        if (status === "Rejected") {
            return "campaign-status-rejected";
        }

        return "campaign-status-pending";
    };

    return (
        <div className="campaign-card">
            <div className="campaign-img-box">
                <img
                    src={campaign.image}
                    alt={campaign.title}
                    onError={(event) => {
                        event.currentTarget.src =
                            "https://images.unsplash.com/photo-1559027615-cd4628902d4a";
                    }}
                />

                <span className="category-badge">
                    {campaign.category}
                </span>
            </div>

            <div className="card-content">
                <div className="card-title-row">
                    <h3>{campaign.title}</h3>

                    {campaign.verified && (
                        <span className="verified-badge">
                            Verified
                        </span>
                    )}
                </div>

                {showActions && (
                    <div
                        className={`campaign-status-badge ${getStatusClass()}`}
                    >
                        {status === "Approved" && "🟢 "}
                        {status === "Pending" && "🟡 "}
                        {status === "Rejected" && "🔴 "}
                        {status}
                    </div>
                )}

                <p className="campaign-description">
                    {campaign.description}
                </p>

                <div className="trust-box">
                    🤖 AI Trust Score:{" "}
                    <b>{campaign.trustScore}%</b>
                </div>

                <div className="progress-info">
                    <span>
                        ₹{raised.toLocaleString("en-IN")}
                    </span>

                    <span>{percentage}% Funded</span>
                </div>

                <div className="progress-bar">
                    <div
                        style={{
                            width: `${percentage}%`,
                        }}
                    />
                </div>

                <p className="goal-text">
                    Goal: ₹{goal.toLocaleString("en-IN")}
                </p>

                <Link
                    to={`/campaign/${campaign.id}`}
                    className="view-btn"
                >
                    View Details
                </Link>

                {showActions && (
                    <div className="campaign-actions">
                        {status !== "Approved" && (
                            <button
                                type="button"
                                className="edit-btn"
                                onClick={() =>
                                    onEdit(campaign.id)
                                }
                            >
                                ✏ Edit
                            </button>
                        )}

                        {status !== "Approved" && (
                            <button
                                type="button"
                                className="delete-btn"
                                onClick={() =>
                                    onDelete(campaign.id)
                                }
                            >
                                🗑 Delete
                            </button>
                        )}

                        {status === "Approved" && (
                            <div className="approved-action-message">
                                ✅ Approved campaigns are locked
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CampaignCard;