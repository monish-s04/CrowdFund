import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import CampaignCard from "../components/CampaignCard";

function MyCampaigns() {
    const navigate = useNavigate();

    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    const fetchMyCampaigns = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/campaigns/my");

            setCampaigns(response.data);
        } catch (requestError) {
            console.error(
                "Unable to load campaigns:",
                requestError
            );

            setError(
                requestError.response?.data?.detail ||
                "Unable to load your campaigns"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyCampaigns();
    }, [fetchMyCampaigns]);

    const handleEdit = (campaignId) => {
        navigate(`/create?id=${campaignId}`);
    };

    const handleDelete = async (campaignId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this campaign?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await API.delete(`/campaigns/${campaignId}`);

            setCampaigns((currentCampaigns) =>
                currentCampaigns.filter(
                    (campaign) =>
                        campaign.id !== campaignId
                )
            );

            alert("Campaign deleted successfully.");
        } catch (requestError) {
            alert(
                requestError.response?.data?.detail ||
                "Unable to delete campaign"
            );
        }
    };

    if (loading) {
        return (
            <div className="page campaign-page">
                <div className="campaign-header">
                    <h1>Loading your campaigns...</h1>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page campaign-page">
                <div className="empty-campaign-state">
                    <h2>Unable to Load Campaigns</h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        className="primary-btn"
                        onClick={fetchMyCampaigns}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page campaign-page">
            <div className="campaign-header">
                <div>
                    <p className="small-title">
                        Dashboard
                    </p>

                    <h1>My Campaigns</h1>

                    <p>
                        View and manage all campaigns created by
                        you.
                    </p>
                </div>

                <button
                    type="button"
                    className="primary-btn"
                    onClick={() => navigate("/create")}
                >
                    + Create Campaign
                </button>
            </div>

            {campaigns.length === 0 ? (
                <div className="empty-campaign-state">
                    <h2>No Campaigns Created Yet</h2>

                    <p>
                        Create your first fundraising campaign to
                        get started.
                    </p>

                    <button
                        type="button"
                        className="primary-btn"
                        onClick={() => navigate("/create")}
                    >
                        Create Campaign
                    </button>
                </div>
            ) : (
                <div className="campaign-grid">
                    {campaigns.map((campaign) => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={{
                                id: campaign.id,
                                title: campaign.title,
                                category: campaign.category,
                                description:
                                    campaign.description,
                                goal: campaign.goal_amount,
                                raised:
                                    campaign.raised_amount,
                                trustScore:
                                    campaign.trust_score,
                                verified:
                                    campaign.status ===
                                    "Approved",
                                status: campaign.status,
                                image:
                                    campaign.image_url ||
                                    getDefaultImage(
                                        campaign.category
                                    ),
                            }}
                            showActions={true}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyCampaigns;