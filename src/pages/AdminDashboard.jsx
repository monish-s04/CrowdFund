import { useCallback, useEffect, useState } from "react";
import API from "../api/api";

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    const loadAdminData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [statsResponse, campaignsResponse, usersResponse] =
                await Promise.all([
                    API.get("/admin/stats"),
                    API.get("/admin/campaigns"),
                    API.get("/admin/users"),
                ]);

            setStats(statsResponse.data);
            setCampaigns(campaignsResponse.data);
            setUsers(usersResponse.data);
        } catch (requestError) {
            console.error("Admin dashboard error:", requestError);

            setError(
                requestError.response?.data?.detail ||
                "Unable to load admin dashboard data."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAdminData();
    }, [loadAdminData]);

    const updateCampaignStatus = async (campaignId, status) => {
        const actionName =
            status === "approve"
                ? "approve"
                : status === "reject"
                    ? "reject"
                    : "move back to pending";

        const confirmed = window.confirm(
            `Are you sure you want to ${actionName} this campaign?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(`${status}-${campaignId}`);

            await API.put(
                `/admin/campaigns/${campaignId}/${status}`
            );

            await loadAdminData();

            alert(`Campaign ${status}d successfully.`);
        } catch (requestError) {
            alert(
                requestError.response?.data?.detail ||
                `Unable to ${status} campaign.`
            );
        } finally {
            setActionLoading(null);
        }
    };

    const deleteCampaign = async (campaignId) => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this campaign?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(`delete-${campaignId}`);

            await API.delete(`/admin/campaigns/${campaignId}`);

            await loadAdminData();

            alert("Campaign deleted successfully.");
        } catch (requestError) {
            alert(
                requestError.response?.data?.detail ||
                "Unable to delete campaign."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const changeUserRole = async (userId, newRole) => {
        const confirmed = window.confirm(
            `Are you sure you want to change this user to ${newRole}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(`role-${userId}`);

            await API.put(
                `/admin/users/${userId}/role/${newRole}`
            );

            await loadAdminData();

            alert("User role updated successfully.");
        } catch (requestError) {
            alert(
                requestError.response?.data?.detail ||
                "Unable to update user role."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const deleteUser = async (userId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this user and all campaigns created by them?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(`user-delete-${userId}`);

            await API.delete(`/admin/users/${userId}`);

            await loadAdminData();

            alert("User deleted successfully.");
        } catch (requestError) {
            alert(
                requestError.response?.data?.detail ||
                "Unable to delete user."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const formatAmount = (amount) => {
        return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
    };

    const getStatusClass = (status) => {
        if (status === "Approved") {
            return "status-approved";
        }

        if (status === "Rejected") {
            return "status-rejected";
        }

        return "status-pending";
    };

    const getRiskLevel = (trustScore) => {
        if (trustScore >= 80) {
            return "Low";
        }

        if (trustScore >= 60) {
            return "Medium";
        }

        return "High";
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-header">
                    <h1>Loading Admin Dashboard...</h1>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-page">
                <div className="admin-panel">
                    <h2>Unable to load dashboard</h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        className="approve-btn"
                        onClick={loadAdminData}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const pendingCampaigns = campaigns.filter(
        (campaign) => campaign.status === "Pending"
    );

    const flaggedCampaigns = campaigns.filter(
        (campaign) => Number(campaign.trust_score) < 60
    );

    return (
        <div className="admin-page">
            <div className="admin-header">
                <p className="small-title">Admin Panel</p>

                <h1>
                    Welcome,{" "}
                    {stats?.admin?.full_name || "Admin"} 👋
                </h1>

                <p>
                    Manage users, campaigns, AI risk review and
                    campaign approvals from one place.
                </p>
            </div>

            <div className="admin-stats">
                <div className="admin-card">
                    <h3>Total Users</h3>
                    <h2>{stats?.total_users ?? 0}</h2>
                </div>

                <div className="admin-card">
                    <h3>Total Admins</h3>
                    <h2>{stats?.total_admins ?? 0}</h2>
                </div>

                <div className="admin-card">
                    <h3>Total Campaigns</h3>
                    <h2>{stats?.total_campaigns ?? 0}</h2>
                </div>

                <div className="admin-card warning">
                    <h3>Pending Approvals</h3>
                    <h2>{stats?.pending_campaigns ?? 0}</h2>
                </div>

                <div className="admin-card success">
                    <h3>Approved Campaigns</h3>
                    <h2>{stats?.approved_campaigns ?? 0}</h2>
                </div>

                <div className="admin-card danger">
                    <h3>Rejected Campaigns</h3>
                    <h2>{stats?.rejected_campaigns ?? 0}</h2>
                </div>

                <div className="admin-card">
                    <h3>Total Funds Raised</h3>
                    <h2>
                        {formatAmount(stats?.total_funds_raised)}
                    </h2>
                </div>

                <div className="admin-card warning">
                    <h3>Average AI Trust</h3>
                    <h2>
                        {Number(
                            stats?.average_trust_score || 0
                        ).toFixed(1)}
                        %
                    </h2>
                </div>
            </div>

            <div className="admin-grid">
                <div className="admin-panel">
                    <div className="admin-panel-heading">
                        <div>
                            <h2>Campaign Approval Requests</h2>
                            <p>
                                Review pending campaigns and approve or
                                reject them.
                            </p>
                        </div>

                        <span className="admin-count">
                            {pendingCampaigns.length}
                        </span>
                    </div>

                    {pendingCampaigns.length === 0 ? (
                        <div className="admin-empty">
                            <p>No pending campaigns available.</p>
                        </div>
                    ) : (
                        pendingCampaigns.map((campaign) => (
                            <div
                                className="admin-row"
                                key={campaign.id}
                            >
                                <div className="admin-row-info">
                                    <h3>{campaign.title}</h3>

                                    <p>
                                        Created by:{" "}
                                        <b>
                                            {campaign.creator_name ||
                                                "Unknown Creator"}
                                        </b>
                                    </p>

                                    <p>
                                        {campaign.category} • AI Score:{" "}
                                        <b>
                                            {campaign.trust_score}%
                                        </b>{" "}
                                        •{" "}
                                        {getRiskLevel(
                                            campaign.trust_score
                                        )}{" "}
                                        Risk
                                    </p>

                                    <p>
                                        Goal:{" "}
                                        <b>
                                            {formatAmount(
                                                campaign.goal_amount
                                            )}
                                        </b>
                                    </p>
                                </div>

                                <div className="admin-row-actions">
                                    <button
                                        type="button"
                                        className="approve-btn"
                                        disabled={
                                            actionLoading ===
                                            `approve-${campaign.id}`
                                        }
                                        onClick={() =>
                                            updateCampaignStatus(
                                                campaign.id,
                                                "approve"
                                            )
                                        }
                                    >
                                        {actionLoading ===
                                            `approve-${campaign.id}`
                                            ? "Approving..."
                                            : "Approve"}
                                    </button>

                                    <button
                                        type="button"
                                        className="reject-btn"
                                        disabled={
                                            actionLoading ===
                                            `reject-${campaign.id}`
                                        }
                                        onClick={() =>
                                            updateCampaignStatus(
                                                campaign.id,
                                                "reject"
                                            )
                                        }
                                    >
                                        {actionLoading ===
                                            `reject-${campaign.id}`
                                            ? "Rejecting..."
                                            : "Reject"}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="admin-panel">
                    <h2>AI Risk Review</h2>

                    <div className="risk-summary">
                        <p>
                            ⚠️{" "}
                            <b>{flaggedCampaigns.length}</b>{" "}
                            high-risk campaigns need manual review.
                        </p>

                        <p>
                            🤖{" "}
                            <b>{campaigns.length}</b> campaigns have
                            been evaluated.
                        </p>

                        <p>
                            ✅{" "}
                            <b>
                                {stats?.approved_campaigns ?? 0}
                            </b>{" "}
                            campaigns are approved.
                        </p>

                        <p>
                            ⏳{" "}
                            <b>
                                {stats?.pending_campaigns ?? 0}
                            </b>{" "}
                            campaigns are waiting for approval.
                        </p>

                        <p>
                            ❌{" "}
                            <b>
                                {stats?.rejected_campaigns ?? 0}
                            </b>{" "}
                            campaigns were rejected.
                        </p>
                    </div>
                </div>
            </div>

            <div className="admin-panel">
                <div className="admin-panel-heading">
                    <div>
                        <h2>All Campaigns</h2>
                        <p>
                            View and manage every campaign stored in
                            MySQL.
                        </p>
                    </div>

                    <span className="admin-count">
                        {campaigns.length}
                    </span>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Campaign</th>
                                <th>Creator</th>
                                <th>Category</th>
                                <th>Goal</th>
                                <th>AI Trust</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan="8">
                                        No campaigns available.
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((campaign) => (
                                    <tr key={campaign.id}>
                                        <td>{campaign.id}</td>

                                        <td>
                                            <strong>
                                                {campaign.title}
                                            </strong>
                                        </td>

                                        <td>
                                            {campaign.creator_name ||
                                                "Unknown"}
                                        </td>

                                        <td>
                                            {campaign.category}
                                        </td>

                                        <td>
                                            {formatAmount(
                                                campaign.goal_amount
                                            )}
                                        </td>

                                        <td>
                                            {campaign.trust_score}%
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-status ${getStatusClass(
                                                    campaign.status
                                                )}`}
                                            >
                                                {campaign.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="table-actions">
                                                {campaign.status !==
                                                    "Approved" && (
                                                        <button
                                                            type="button"
                                                            className="approve-btn small-action-btn"
                                                            onClick={() =>
                                                                updateCampaignStatus(
                                                                    campaign.id,
                                                                    "approve"
                                                                )
                                                            }
                                                        >
                                                            Approve
                                                        </button>
                                                    )}

                                                {campaign.status !==
                                                    "Rejected" && (
                                                        <button
                                                            type="button"
                                                            className="reject-btn small-action-btn"
                                                            onClick={() =>
                                                                updateCampaignStatus(
                                                                    campaign.id,
                                                                    "reject"
                                                                )
                                                            }
                                                        >
                                                            Reject
                                                        </button>
                                                    )}

                                                {campaign.status !==
                                                    "Pending" && (
                                                        <button
                                                            type="button"
                                                            className="pending-btn small-action-btn"
                                                            onClick={() =>
                                                                updateCampaignStatus(
                                                                    campaign.id,
                                                                    "pending"
                                                                )
                                                            }
                                                        >
                                                            Pending
                                                        </button>
                                                    )}

                                                <button
                                                    type="button"
                                                    className="admin-delete-btn small-action-btn"
                                                    onClick={() =>
                                                        deleteCampaign(
                                                            campaign.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="admin-panel">
                <div className="admin-panel-heading">
                    <div>
                        <h2>User Management</h2>
                        <p>
                            View registered users and manage their
                            roles.
                        </p>
                    </div>

                    <span className="admin-count">
                        {users.length}
                    </span>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Campaigns</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        No users available.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>

                                        <td>
                                            <strong>
                                                {user.full_name}
                                            </strong>
                                        </td>

                                        <td>{user.email}</td>

                                        <td>
                                            <span
                                                className={`admin-status ${user.role ===
                                                        "admin"
                                                        ? "status-approved"
                                                        : "status-pending"
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>

                                        <td>
                                            {user.campaign_count}
                                        </td>

                                        <td>
                                            <div className="table-actions">
                                                {user.role ===
                                                    "user" ? (
                                                    <button
                                                        type="button"
                                                        className="approve-btn small-action-btn"
                                                        disabled={
                                                            actionLoading ===
                                                            `role-${user.id}`
                                                        }
                                                        onClick={() =>
                                                            changeUserRole(
                                                                user.id,
                                                                "admin"
                                                            )
                                                        }
                                                    >
                                                        Make Admin
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="pending-btn small-action-btn"
                                                        disabled={
                                                            user.id ===
                                                            stats
                                                                ?.admin
                                                                ?.id ||
                                                            actionLoading ===
                                                            `role-${user.id}`
                                                        }
                                                        onClick={() =>
                                                            changeUserRole(
                                                                user.id,
                                                                "user"
                                                            )
                                                        }
                                                    >
                                                        Make User
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="admin-delete-btn small-action-btn"
                                                    disabled={
                                                        user.id ===
                                                        stats?.admin
                                                            ?.id ||
                                                        actionLoading ===
                                                        `user-delete-${user.id}`
                                                    }
                                                    onClick={() =>
                                                        deleteUser(
                                                            user.id
                                                        )
                                                    }
                                                >
                                                    Delete User
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;