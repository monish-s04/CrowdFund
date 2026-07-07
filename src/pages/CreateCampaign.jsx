import { useState } from "react";

function CreateCampaign() {
    const [image, setImage] = useState(null);

    const previewImage = (e) => {
        if (e.target.files[0]) {
            setImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    return (
        <div className="create-page">

            <div className="page-heading">
                <p className="small-title">Create Campaign</p>
                <h1>Launch Your Fundraising Campaign</h1>
                <p>
                    Publish secure blockchain crowdfunding campaigns with
                    AI-powered trust evaluation.
                </p>
            </div>

            <div className="create-container">

                {/* LEFT SIDE */}

                <div className="create-form-card">

                    <h2>Campaign Information</h2>

                    <label>Campaign Image</label>

                    <div className="upload-box">

                        {image ? (
                            <img src={image} alt="Preview" />
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
                    />

                    <label>Category</label>

                    <select>

                        <option>Healthcare</option>
                        <option>Education</option>
                        <option>Business</option>
                        <option>NGO</option>
                        <option>Disaster Relief</option>

                    </select>

                    <label>Goal Amount</label>

                    <input
                        type="number"
                        placeholder="100000"
                    />

                    <label>Campaign Duration (Days)</label>

                    <input
                        type="number"
                        placeholder="30"
                    />

                    <label>Description</label>

                    <textarea
                        placeholder="Describe your campaign..."
                    ></textarea>

                    <button className="publish-btn">

                        Publish Campaign

                    </button>

                </div>

                {/* RIGHT SIDE */}

                <div className="ai-preview-card">

                    <h2>🤖 AI Campaign Evaluation</h2>

                    <div className="score-circle">

                        <h1>95%</h1>

                        <span>Trust Score</span>

                    </div>

                    <div className="ai-item">

                        <span>Success Probability</span>

                        <b>90%</b>

                    </div>

                    <div className="ai-item">

                        <span>Risk Level</span>

                        <b className="low-risk">LOW</b>

                    </div>

                    <div className="ai-item">

                        <span>Blockchain Ready</span>

                        <b>YES</b>

                    </div>

                    <div className="recommendation">

                        <h3>Recommendation</h3>

                        <p>

                            This campaign satisfies most credibility
                            requirements and is likely to be approved
                            by the administrator.

                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default CreateCampaign;