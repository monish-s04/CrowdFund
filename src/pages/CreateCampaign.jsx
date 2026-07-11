import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/api";

function CreateCampaign() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const campaignId = searchParams.get("id");
    const isEditMode = Boolean(campaignId);

    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState("");

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Healthcare");
    const [goalAmount, setGoalAmount] = useState("");
    const [durationDays, setDurationDays] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [fetchingCampaign, setFetchingCampaign] = useState(isEditMode);

    useEffect(() => {
        if (!isEditMode) {
            return;
        }

        const fetchCampaignDetails = async () => {
            try {
                const response = await API.get(
                    `/campaigns/${campaignId}`
                );

                const campaign = response.data;

                setTitle(campaign.title || "");
                setCategory(campaign.category || "Healthcare");
                setGoalAmount(
                    campaign.goal_amount?.toString() || ""
                );
                setDurationDays(
                    campaign.duration_days?.toString() || ""
                );
                setDescription(campaign.description || "");
                setImageUrl(campaign.image_url || "");

                if (campaign.image_url) {
                    setImage(campaign.image_url);
                }
            } catch (error) {
                alert(
                    error.response?.data?.detail ||
                    "Unable to load campaign details"
                );

                navigate("/my-campaigns");
            } finally {
                setFetchingCampaign(false);
            }
        };

        fetchCampaignDetails();
    }, [campaignId, isEditMode, navigate]);

    const previewImage = (event) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        const previewUrl = URL.createObjectURL(selectedFile);

        setImage(previewUrl);

        /*
         * This is only a local preview.
         * Do not save the blob URL in MySQL because it breaks
         * after refreshing the browser.
         *
         * Real image upload will be added later using FastAPI.
         */
        setImageUrl("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !title.trim() ||
            !goalAmount ||
            !durationDays ||
            !description.trim()
        ) {
            alert("Please fill all required fields.");
            return;
        }

        if (Number(goalAmount) <= 0) {
            alert("Goal amount must be greater than zero.");
            return;
        }

        if (Number(durationDays) <= 0) {
            alert("Campaign duration must be greater than zero.");
            return;
        }

        const campaignData = {
            title: title.trim(),
            category,
            goal_amount: Number(goalAmount),
            duration_days: Number(durationDays),
            description: description.trim(),
            image_url: imageUrl || null,
        };

        setLoading(true);

        try {
            if (isEditMode) {
                await API.put(
                    `/campaigns/${campaignId}`,
                    campaignData
                );

                alert("Campaign updated successfully!");
                navigate(`/campaign/${campaignId}`);
            } else {
                await API.post("/campaigns/", campaignData);

                alert("Campaign created successfully!");
                navigate("/campaigns");
            }
        } catch (error) {
            alert(
                error.response?.data?.detail ||
                (isEditMode
                    ? "Failed to update campaign"
                    : "Failed to create campaign")
            );
        } finally {
            setLoading(false);
        }
    };

    if (fetchingCampaign) {
        return (
            <div className="create-page">
                <div className="page-heading">
                    <h1>Loading campaign...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="create-page">
            <div className="page-heading">
                <p className="small-title">
                    {isEditMode
                        ? "Edit Campaign"
                        : "Create Campaign"}
                </p>

                <h1>
                    {isEditMode
                        ? "Update Your Fundraising Campaign"
                        : "Launch Your Fundraising Campaign"}
                </h1>

                <p>
                    {isEditMode
                        ? "Update the campaign information and save your changes."
                        : "Publish secure blockchain crowdfunding campaigns with AI-powered trust evaluation."}
                </p>
            </div>

            <div className="create-container">
                <form
                    className="create-form-card"
                    onSubmit={handleSubmit}
                >
                    <h2>Campaign Information</h2>

                    <label>Campaign Image</label>

                    <div className="upload-box">
                        {image ? (
                            <img
                                src={image}
                                alt="Campaign preview"
                            />
                        ) : (
                            <p>Click to Upload Image</p>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={previewImage}
                        />
                    </div>

                    <label>Campaign Title</label>

                    <input
                        type="text"
                        placeholder="Medical Help for Child"
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                        required
                    />

                    <label>Category</label>

                    <select
                        value={category}
                        onChange={(event) =>
                            setCategory(event.target.value)
                        }
                        required
                    >
                        <option value="Healthcare">
                            Healthcare
                        </option>

                        <option value="Education">
                            Education
                        </option>

                        <option value="Business">
                            Business
                        </option>

                        <option value="NGO">
                            NGO
                        </option>

                        <option value="Disaster Relief">
                            Disaster Relief
                        </option>
                    </select>

                    <label>Goal Amount</label>

                    <input
                        type="number"
                        min="1"
                        placeholder="100000"
                        value={goalAmount}
                        onChange={(event) =>
                            setGoalAmount(event.target.value)
                        }
                        required
                    />

                    <label>Campaign Duration (Days)</label>

                    <input
                        type="number"
                        min="1"
                        placeholder="30"
                        value={durationDays}
                        onChange={(event) =>
                            setDurationDays(event.target.value)
                        }
                        required
                    />

                    <label>Description</label>

                    <textarea
                        placeholder="Describe your campaign..."
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                        required
                    />

                    <button
                        type="submit"
                        className="publish-btn"
                        disabled={loading}
                    >
                        {loading
                            ? isEditMode
                                ? "Updating Campaign..."
                                : "Publishing Campaign..."
                            : isEditMode
                                ? "Update Campaign"
                                : "Publish Campaign"}
                    </button>
                </form>

                <div className="ai-preview-card">
                    <h2>🤖 AI Campaign Evaluation</h2>

                    <div className="score-circle">
                        <h1>85%</h1>
                        <span>Trust Score</span>
                    </div>

                    <div className="ai-item">
                        <span>Success Probability</span>
                        <b>Pending AI Model</b>
                    </div>

                    <div className="ai-item">
                        <span>Risk Level</span>
                        <b className="low-risk">PENDING</b>
                    </div>

                    <div className="ai-item">
                        <span>Blockchain Ready</span>
                        <b>YES</b>
                    </div>

                    <div className="recommendation">
                        <h3>Recommendation</h3>

                        <p>
                            The final trust score and success
                            probability will be generated by the AI
                            evaluation module.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateCampaign;