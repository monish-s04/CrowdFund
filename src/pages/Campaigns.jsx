import { useState } from "react";
import CampaignCard from "../components/CampaignCard";

const campaigns = [
    {
        id: 1,
        title: "Medical Help for Child",
        category: "Medical",
        description: "Raising funds for urgent medical treatment and hospital expenses.",
        goal: 100000,
        raised: 45000,
        trustScore: 91,
        verified: true,
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
    },
    {
        id: 2,
        title: "Education Support",
        category: "Education",
        description: "Helping students continue their education with books and fees.",
        goal: 75000,
        raised: 30000,
        trustScore: 86,
        verified: true,
        image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b",
    },
    {
        id: 3,
        title: "Startup Funding",
        category: "Startup",
        description: "Support a new innovative startup idea using AI and blockchain.",
        goal: 200000,
        raised: 80000,
        trustScore: 78,
        verified: false,
        image: "https://images.unsplash.com/photo-1556761175-4b46a572b786",
    },
];

function Campaigns() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const filteredCampaigns = campaigns.filter((campaign) => {
        const matchesSearch = campaign.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "All" || campaign.category === category;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="page campaign-page">
            <div className="campaign-header">
                <div>
                    <p className="small-title">Explore Campaigns</p>
                    <h1>Active Fundraising Campaigns</h1>
                    <p>Discover trusted campaigns verified with AI evaluation and blockchain transparency.</p>
                </div>
            </div>

            <div className="campaign-filters">
                <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="All">All Categories</option>
                    <option value="Medical">Medical</option>
                    <option value="Education">Education</option>
                    <option value="Startup">Startup</option>
                </select>
            </div>

            <div className="campaign-grid">
                {filteredCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
            </div>
        </div>
    );
}

export default Campaigns;