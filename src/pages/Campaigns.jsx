import { useEffect, useState } from "react";
import CampaignCard from "../components/CampaignCard";
import API from "../api/api";

function Campaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getDefaultImage = (campaignCategory) => {
        if (campaignCategory === "Healthcare") {
            return "https://images.unsplash.com/photo-1576091160550-2173dba999ef";
        }

        if (campaignCategory === "Education") {
            return "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b";
        }

        if (campaignCategory === "Disaster Relief") {
            return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
        }

        if (campaignCategory === "Business") {
            return "https://images.unsplash.com/photo-1556761175-4b46a572b786";
        }

        return "https://images.unsplash.com/photo-1559027615-cd4628902d4a";
    };

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get("/campaigns/");

                const formattedCampaigns = response.data.map((campaign) => ({
                    id: campaign.id,
                    title: campaign.title || "Untitled Campaign",
                    category: campaign.category || "Other",
                    description: campaign.description || "",
                    goal: Number(campaign.goal_amount || 0),
                    raised: Number(campaign.raised_amount || 0),
                    trustScore: Number(campaign.trust_score || 0),
                    verified: campaign.status === "Approved",
                    image: getDefaultImage(campaign.category),
                }));

                setCampaigns(formattedCampaigns);
            } catch (requestError) {
                console.error("Campaign loading error:", requestError);

                setError(
                    requestError.response?.data?.detail ||
                    "Failed to load campaigns"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    const filteredCampaigns = campaigns.filter((campaign) => {
        const matchesSearch = campaign.title
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesCategory =
            category === "All" || campaign.category === category;

        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="page campaign-page">
                <h2>Loading campaigns...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page campaign-page">
                <h2>{error}</h2>
            </div>
        );
    }

    return (
        <div className="page campaign-page">
            <div className="campaign-header">
                <div>
                    <p className="small-title">Explore Campaigns</p>

                    <h1>Active Fundraising Campaigns</h1>

                    <p>
                        Discover trusted campaigns verified with AI evaluation
                        and blockchain transparency.
                    </p>
                </div>
            </div>

            <div className="campaign-filters">
                <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />

                <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                >
                    <option value="All">All Categories</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Business">Business</option>
                    <option value="NGO">NGO</option>
                    <option value="Disaster Relief">
                        Disaster Relief
                    </option>
                </select>
            </div>

            {filteredCampaigns.length === 0 ? (
                <p>No campaigns found.</p>
            ) : (
                <div className="campaign-grid">
                    {filteredCampaigns.map((campaign) => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Campaigns;