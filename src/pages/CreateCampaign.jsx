import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import API from "../api/api";
import "../css/createCampaign.css";


function CreateCampaign() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const campaignId = searchParams.get("id");
    const isEditMode = Boolean(campaignId);

    const [selectedImageFile, setSelectedImageFile] =
        useState(null);

    const [imagePreview, setImagePreview] =
        useState("");

    const [imageUrl, setImageUrl] =
        useState("");

    const [title, setTitle] =
        useState("");

    const [category, setCategory] =
        useState("Healthcare");

    const [goalAmount, setGoalAmount] =
        useState("");

    const [durationDays, setDurationDays] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [fetchingCampaign, setFetchingCampaign] =
        useState(isEditMode);


    // =====================================================
    // LOAD CAMPAIGN IN EDIT MODE
    // =====================================================

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

                setTitle(
                    campaign.title || ""
                );

                setCategory(
                    campaign.category || "Healthcare"
                );

                setGoalAmount(
                    campaign.goal_amount?.toString() || ""
                );

                setDurationDays(
                    campaign.duration_days?.toString() || ""
                );

                setDescription(
                    campaign.description || ""
                );

                setImageUrl(
                    campaign.image_url || ""
                );

                setImagePreview(
                    campaign.image_url || ""
                );

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

    }, [
        campaignId,
        isEditMode,
        navigate,
    ]);


    // =====================================================
    // IMAGE PREVIEW
    // =====================================================

    const previewImage = (event) => {
        const selectedFile =
            event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            alert(
                "Please select a JPG, PNG or WEBP image."
            );

            event.target.value = "";
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            alert(
                "Image size must be 5 MB or less."
            );

            event.target.value = "";
            return;
        }

        if (imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }

        setSelectedImageFile(selectedFile);

        setImagePreview(
            URL.createObjectURL(selectedFile)
        );
    };


    // =====================================================
    // UPLOAD IMAGE
    // =====================================================

    const uploadSelectedImage = async () => {
        if (!selectedImageFile) {
            return imageUrl || null;
        }

        const formData = new FormData();

        formData.append(
            "image",
            selectedImageFile
        );

        const response = await API.post(
            "/campaigns/upload-image",
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            }
        );

        return response.data.image_url;
    };


    // =====================================================
    // LIVE AI CAMPAIGN EVALUATION
    // =====================================================

    const liveAiResult = useMemo(() => {
        const cleanTitle = title.trim();
        const cleanDescription = description.trim();

        const titleLength = cleanTitle.length;
        const descriptionLength =
            cleanDescription.length;

        const goal = Number(goalAmount);
        const days = Number(durationDays);

        let score = 35;
        let titleQuality = "Missing";
        let descriptionQuality = "Missing";
        let goalQuality = "Missing";
        let durationQuality = "Missing";
        let imageQuality = "Missing";

        let recommendedGoal = 100000;
        let recommendedDuration = 45;

        const suggestions = [];


        // -------------------------------------------------
        // TITLE ANALYSIS
        // -------------------------------------------------

        if (titleLength >= 20) {
            score += 10;
            titleQuality = "Excellent";

            suggestions.push(
                "Campaign title is clear and descriptive."
            );

        } else if (titleLength >= 10) {
            score += 7;
            titleQuality = "Good";

            suggestions.push(
                "Campaign title is good, but adding more specific details may improve visibility."
            );

        } else if (titleLength > 0) {
            score += 3;
            titleQuality = "Needs Improvement";

            suggestions.push(
                "Use a more descriptive title with at least 10 characters."
            );

        } else {
            suggestions.push(
                "Add a clear and meaningful campaign title."
            );
        }


        // -------------------------------------------------
        // DESCRIPTION ANALYSIS
        // -------------------------------------------------

        if (descriptionLength >= 300) {
            score += 20;
            descriptionQuality = "Excellent";

            suggestions.push(
                "Campaign description contains detailed information."
            );

        } else if (descriptionLength >= 150) {
            score += 15;
            descriptionQuality = "Good";

            suggestions.push(
                "Add fund-utilization details and supporting information to strengthen the description."
            );

        } else if (descriptionLength >= 80) {
            score += 10;
            descriptionQuality = "Average";

            suggestions.push(
                "Expand the description to at least 150 characters."
            );

        } else if (descriptionLength > 0) {
            score += 5;
            descriptionQuality = "Needs Improvement";

            suggestions.push(
                "The description is too short. Explain the problem, beneficiary and fund usage clearly."
            );

        } else {
            suggestions.push(
                "Add a detailed campaign description."
            );
        }


        // -------------------------------------------------
        // DESCRIPTION CONTENT ANALYSIS
        // -------------------------------------------------

        const descriptionLower =
            cleanDescription.toLowerCase();

        const costKeywords = [
            "cost",
            "expense",
            "fees",
            "amount",
            "budget",
            "estimate",
            "treatment",
            "medical bill",
            "tuition",
            "equipment",
        ];

        const beneficiaryKeywords = [
            "beneficiary",
            "student",
            "patient",
            "family",
            "children",
            "community",
            "people",
            "victim",
            "business",
        ];

        const timelineKeywords = [
            "days",
            "month",
            "week",
            "deadline",
            "urgent",
            "immediately",
            "timeline",
            "before",
        ];

        const hasCostDetails =
            costKeywords.some((keyword) =>
                descriptionLower.includes(keyword)
            );

        const hasBeneficiaryDetails =
            beneficiaryKeywords.some((keyword) =>
                descriptionLower.includes(keyword)
            );

        const hasTimelineDetails =
            timelineKeywords.some((keyword) =>
                descriptionLower.includes(keyword)
            );

        if (hasCostDetails) {
            score += 3;

            suggestions.push(
                "Fund requirement or expense information is included."
            );

        } else {
            suggestions.push(
                "Mention how the collected funds will be used."
            );
        }

        if (hasBeneficiaryDetails) {
            score += 3;

            suggestions.push(
                "Beneficiary information appears to be included."
            );

        } else {
            suggestions.push(
                "Clearly mention who will benefit from the campaign."
            );
        }

        if (hasTimelineDetails) {
            score += 2;

            suggestions.push(
                "Campaign timeline information appears to be included."
            );

        } else {
            suggestions.push(
                "Mention when the funds are required and why the campaign is time-sensitive."
            );
        }


        // -------------------------------------------------
        // DURATION ANALYSIS
        // -------------------------------------------------

        if (days >= 30 && days <= 45) {
            score += 15;
            durationQuality = "Excellent";
            recommendedDuration = days;

            suggestions.push(
                "Campaign duration is within the recommended range."
            );

        } else if (days >= 15 && days <= 60) {
            score += 12;
            durationQuality = "Good";

            recommendedDuration =
                Math.min(
                    Math.max(days, 30),
                    45
                );

            suggestions.push(
                "Campaign duration is suitable for crowdfunding."
            );

        } else if (days >= 7 && days <= 90) {
            score += 8;
            durationQuality = "Average";
            recommendedDuration = 45;

            suggestions.push(
                "A duration between 30 and 45 days may improve urgency and engagement."
            );

        } else if (days > 0) {
            score += 3;
            durationQuality = "Needs Improvement";
            recommendedDuration = 45;

            suggestions.push(
                "Set the campaign duration between 30 and 45 days."
            );

        } else {
            suggestions.push(
                "Enter a valid campaign duration."
            );
        }


        // -------------------------------------------------
        // GOAL ANALYSIS
        // -------------------------------------------------

        if (goal > 0 && goal <= 200000) {
            score += 15;
            goalQuality = "Excellent";
            recommendedGoal = goal;

            suggestions.push(
                "Campaign goal is realistic and donor-friendly."
            );

        } else if (goal > 0 && goal <= 500000) {
            score += 11;
            goalQuality = "Good";

            recommendedGoal =
                Math.round((goal * 0.9) / 1000) * 1000;

            suggestions.push(
                "Campaign goal is acceptable. Explain the expense breakdown clearly."
            );

        } else if (goal > 0 && goal <= 1000000) {
            score += 7;
            goalQuality = "Moderate";

            recommendedGoal =
                Math.round((goal * 0.75) / 1000) * 1000;

            suggestions.push(
                "The goal amount is high. Add documents and a detailed budget."
            );

        } else if (goal > 1000000) {
            score += 3;
            goalQuality = "High";

            recommendedGoal =
                Math.round((goal * 0.6) / 1000) * 1000;

            suggestions.push(
                "Consider dividing the fundraising goal into smaller milestones."
            );

        } else {
            suggestions.push(
                "Enter a valid fundraising goal."
            );
        }


        // -------------------------------------------------
        // CATEGORY ANALYSIS
        // -------------------------------------------------

        const trustedCategories = [
            "Healthcare",
            "Education",
            "NGO",
            "Disaster Relief",
        ];

        if (trustedCategories.includes(category)) {
            score += 7;
        } else {
            score += 4;
        }

        const categorySuggestions = {
            Healthcare: [
                "Upload hospital reports or medical estimates.",
                "Mention the hospital, treatment and expected medical cost.",
                "Add patient or beneficiary details where appropriate.",
            ],

            Education: [
                "Upload the fee receipt or admission document.",
                "Mention the institution, course and academic year.",
                "Explain how education funding will benefit the student.",
            ],

            Business: [
                "Explain the business plan and revenue model.",
                "Mention the target market and expected business impact.",
                "Add a clear budget for equipment, inventory or operations.",
            ],

            NGO: [
                "Mention the number of beneficiaries.",
                "Upload NGO registration or verification documents.",
                "Explain the measurable social impact of the campaign.",
            ],

            "Disaster Relief": [
                "Mention the affected location and number of people.",
                "Explain how food, shelter or medical support will be provided.",
                "Provide regular updates about fund distribution.",
            ],
        };

        suggestions.push(
            ...(categorySuggestions[category] || [
                "Add supporting documents.",
                "Explain the campaign impact clearly.",
                "Provide regular updates to donors.",
            ])
        );


        // -------------------------------------------------
        // IMAGE ANALYSIS
        // -------------------------------------------------

        if (imagePreview) {
            score += 5;
            imageQuality = "Uploaded";

            suggestions.push(
                "Campaign image has been added successfully."
            );

        } else {
            suggestions.push(
                "Upload a clear campaign image to improve donor trust."
            );
        }


        // -------------------------------------------------
        // FINAL RESULT
        // -------------------------------------------------

        score = Math.max(
            0,
            Math.min(
                Math.round(score),
                100
            )
        );

        const successProbability =
            Math.min(
                Math.max(score + 3, 10),
                98
            );

        let riskLevel;
        let rating;
        let qualityLabel;
        let recommendation;

        if (score >= 85) {
            riskLevel = "LOW";
            rating = "★★★★★";
            qualityLabel = "Excellent";

            recommendation =
                "Your campaign is well prepared and has a strong chance of gaining donor trust.";

        } else if (score >= 70) {
            riskLevel = "LOW";
            rating = "★★★★☆";
            qualityLabel = "Very Good";

            recommendation =
                "Your campaign is strong, but supporting documents and expense details may improve donor confidence.";

        } else if (score >= 55) {
            riskLevel = "MEDIUM";
            rating = "★★★☆☆";
            qualityLabel = "Needs Improvement";

            recommendation =
                "Add more details, evidence and a clearer fundraising plan before submission.";

        } else if (score >= 40) {
            riskLevel = "HIGH";
            rating = "★★☆☆☆";
            qualityLabel = "Weak";

            recommendation =
                "The campaign requires significant improvements before publication.";

        } else {
            riskLevel = "HIGH";
            rating = "★☆☆☆☆";
            qualityLabel = "Incomplete";

            recommendation =
                "Complete all important campaign details before submitting it.";
        }

        return {
            score,
            successProbability,
            riskLevel,
            rating,
            qualityLabel,
            recommendedGoal,
            recommendedDuration,
            titleQuality,
            descriptionQuality,
            goalQuality,
            durationQuality,
            imageQuality,
            suggestions,
            recommendation,
        };

    }, [
        category,
        description,
        durationDays,
        goalAmount,
        imagePreview,
        title,
    ]);


    // =====================================================
    // SUBMIT CAMPAIGN
    // =====================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !title.trim() ||
            !goalAmount ||
            !durationDays ||
            !description.trim()
        ) {
            alert(
                "Please fill all required fields."
            );

            return;
        }

        if (title.trim().length < 3) {
            alert(
                "Campaign title must contain at least 3 characters."
            );

            return;
        }

        if (description.trim().length < 20) {
            alert(
                "Campaign description must contain at least 20 characters."
            );

            return;
        }

        if (Number(goalAmount) <= 0) {
            alert(
                "Goal amount must be greater than zero."
            );

            return;
        }

        if (
            Number(durationDays) <= 0 ||
            Number(durationDays) > 365
        ) {
            alert(
                "Campaign duration must be between 1 and 365 days."
            );

            return;
        }

        if (!imagePreview) {
            alert(
                "Please upload a campaign image."
            );

            return;
        }

        setLoading(true);

        try {
            const permanentImageUrl =
                await uploadSelectedImage();

            const campaignData = {
                title: title.trim(),
                category,
                goal_amount: Number(goalAmount),
                duration_days: Number(durationDays),
                description: description.trim(),
                image_url: permanentImageUrl,
            };

            if (isEditMode) {
                await API.put(
                    `/campaigns/${campaignId}`,
                    campaignData
                );

                alert(
                    "Campaign updated successfully!"
                );

                navigate(
                    `/campaign/${campaignId}`
                );

            } else {
                await API.post(
                    "/campaigns/",
                    campaignData
                );

                alert(
                    "Campaign created successfully and sent for admin approval!"
                );

                navigate(
                    "/my-campaigns"
                );
            }

        } catch (error) {
            alert(
                error.response?.data?.detail ||
                (
                    isEditMode
                        ? "Failed to update campaign"
                        : "Failed to create campaign"
                )
            );

        } finally {
            setLoading(false);
        }
    };


    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(amount || 0);
    };


    const getRiskClass = () => {
        if (liveAiResult.riskLevel === "LOW") {
            return "risk-low";
        }

        if (liveAiResult.riskLevel === "MEDIUM") {
            return "risk-medium";
        }

        return "risk-high";
    };


    const getScoreClass = () => {
        if (liveAiResult.score >= 70) {
            return "score-good";
        }

        if (liveAiResult.score >= 55) {
            return "score-average";
        }

        return "score-poor";
    };


    if (fetchingCampaign) {
        return (
            <div className="create-page">
                <div className="page-heading">
                    <h1>
                        Loading campaign...
                    </h1>
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
                    <h2>
                        Campaign Information
                    </h2>

                    <label>
                        Campaign Image
                    </label>

                    <div className="upload-box">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Campaign preview"
                            />
                        ) : (
                            <div className="upload-placeholder">
                                <span>📷</span>
                                <p>
                                    Click to Upload Image
                                </p>
                                <small>
                                    JPG, PNG or WEBP — Maximum 5 MB
                                </small>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={previewImage}
                        />
                    </div>

                    <label>
                        Campaign Title
                    </label>

                    <input
                        type="text"
                        maxLength="150"
                        placeholder="Medical Help for Child"
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                        required
                    />

                    <div className="field-information">
                        <span>
                            Title quality:
                            {" "}
                            <b>
                                {liveAiResult.titleQuality}
                            </b>
                        </span>

                        <span>
                            {title.trim().length}/150
                        </span>
                    </div>

                    <label>
                        Category
                    </label>

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

                    <label>
                        Goal Amount
                    </label>

                    <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="100000"
                        value={goalAmount}
                        onChange={(event) =>
                            setGoalAmount(event.target.value)
                        }
                        required
                    />

                    <div className="field-information">
                        <span>
                            Goal quality:
                            {" "}
                            <b>
                                {liveAiResult.goalQuality}
                            </b>
                        </span>
                    </div>

                    <label>
                        Campaign Duration (Days)
                    </label>

                    <input
                        type="number"
                        min="1"
                        max="365"
                        placeholder="30"
                        value={durationDays}
                        onChange={(event) =>
                            setDurationDays(event.target.value)
                        }
                        required
                    />

                    <div className="field-information">
                        <span>
                            Duration quality:
                            {" "}
                            <b>
                                {liveAiResult.durationQuality}
                            </b>
                        </span>
                    </div>

                    <label>
                        Description
                    </label>

                    <textarea
                        maxLength="5000"
                        placeholder="Explain the campaign purpose, beneficiary, required amount, expenses and timeline..."
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                        required
                    />

                    <div className="field-information">
                        <span>
                            Description quality:
                            {" "}
                            <b>
                                {liveAiResult.descriptionQuality}
                            </b>
                        </span>

                        <span>
                            {description.trim().length}/5000
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="publish-btn"
                        disabled={loading}
                    >
                        {loading
                            ? isEditMode
                                ? selectedImageFile
                                    ? "Uploading and Saving..."
                                    : "Updating Campaign..."
                                : "Publishing Campaign..."
                            : isEditMode
                                ? "Update Campaign"
                                : "Publish Campaign"}
                    </button>
                </form>


                <div className="ai-preview-card">
                    <div className="ai-card-heading">
                        <div>
                            <span className="ai-label">
                                BLOCKFUND INTELLIGENCE
                            </span>

                            <h2>
                                🤖 AI Campaign Advisor
                            </h2>
                        </div>

                        <span className="live-badge">
                            LIVE
                        </span>
                    </div>

                    <div
                        className={`score-circle ${getScoreClass()}`}
                    >
                        <h1>
                            {liveAiResult.score}%
                        </h1>

                        <span>
                            Trust Score
                        </span>
                    </div>

                    <div className="quality-rating">
                        <div className="stars">
                            {liveAiResult.rating}
                        </div>

                        <strong>
                            {liveAiResult.qualityLabel}
                        </strong>

                        <span>
                            Overall Campaign Quality
                        </span>
                    </div>

                    <div className="ai-summary-grid">
                        <div className="ai-summary-box">
                            <span>
                                Success Probability
                            </span>

                            <b>
                                {liveAiResult.successProbability}%
                            </b>
                        </div>

                        <div className="ai-summary-box">
                            <span>
                                Risk Level
                            </span>

                            <b className={getRiskClass()}>
                                {liveAiResult.riskLevel}
                            </b>
                        </div>
                    </div>

                    <div className="recommended-section">
                        <h3>
                            AI Recommendations
                        </h3>

                        <div className="recommended-grid">
                            <div className="recommended-card">
                                <span>
                                    Recommended Goal
                                </span>

                                <strong>
                                    {formatCurrency(
                                        liveAiResult.recommendedGoal
                                    )}
                                </strong>
                            </div>

                            <div className="recommended-card">
                                <span>
                                    Recommended Duration
                                </span>

                                <strong>
                                    {
                                        liveAiResult
                                            .recommendedDuration
                                    }{" "}
                                    Days
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="quality-checks">
                        <h3>
                            Campaign Quality Check
                        </h3>

                        <div className="quality-row">
                            <span>
                                Title
                            </span>

                            <b>
                                {liveAiResult.titleQuality}
                            </b>
                        </div>

                        <div className="quality-row">
                            <span>
                                Description
                            </span>

                            <b>
                                {liveAiResult.descriptionQuality}
                            </b>
                        </div>

                        <div className="quality-row">
                            <span>
                                Goal Amount
                            </span>

                            <b>
                                {liveAiResult.goalQuality}
                            </b>
                        </div>

                        <div className="quality-row">
                            <span>
                                Duration
                            </span>

                            <b>
                                {liveAiResult.durationQuality}
                            </b>
                        </div>

                        <div className="quality-row">
                            <span>
                                Campaign Image
                            </span>

                            <b>
                                {liveAiResult.imageQuality}
                            </b>
                        </div>
                    </div>

                    <div className="ai-suggestions">
                        <h3>
                            Personalized Suggestions
                        </h3>

                        <div className="suggestion-list">
                            {liveAiResult.suggestions.map(
                                (suggestion, index) => (
                                    <div
                                        className="suggestion-item"
                                        key={`${suggestion}-${index}`}
                                    >
                                        <span>
                                            ✓
                                        </span>

                                        <p>
                                            {suggestion}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div className="recommendation">
                        <h3>
                            Final Recommendation
                        </h3>

                        <p>
                            {liveAiResult.recommendation}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default CreateCampaign;