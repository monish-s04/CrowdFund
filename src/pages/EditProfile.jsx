import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function EditProfile() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await API.get("/profile/me");

                setFullName(response.data.full_name || "");
                setEmail(response.data.email || "");
            } catch (err) {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load profile"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");

        try {
            const response = await API.put("/profile/me", {
                full_name: fullName.trim(),
                email: email.trim(),
            });

            sessionStorage.setItem(
                "username",
                response.data.full_name
            );

            setMessage("Profile updated successfully!");

            setTimeout(() => {
                navigate("/profile");
            }, 1000);

        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to update profile"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="edit-profile-page">
                <div className="edit-profile-container">
                    <div className="edit-profile-header">
                        <h1>Loading Profile...</h1>
                        <p>Please wait while we load your information.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-profile-page">

            <div className="edit-profile-container">

                <div className="edit-profile-header">
                    <h1>✏️ Edit Profile</h1>

                    <p>
                        Update your personal information and keep
                        your BlockFund AI account details current.
                    </p>
                </div>

                {message && (
                    <div className="edit-profile-message">
                        ✅ {message}
                    </div>
                )}

                {error && (
                    <div className="edit-profile-error">
                        ⚠️ {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="edit-profile-form"
                >

                    <div className="edit-form-group">
                        <label>Full Name</label>

                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) =>
                                setFullName(e.target.value)
                            }
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label>Email Address</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter your email address"
                            required
                        />
                    </div>

                    <div className="edit-profile-actions">

                        <button
                            type="submit"
                            className="save-profile-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                        <button
                            type="button"
                            className="cancel-profile-btn"
                            onClick={() =>
                                navigate("/profile")
                            }
                            disabled={saving}
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EditProfile;