import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/api";
import "../css/admin.css";

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [users, setUsers] = useState([]);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    const [campaignSearch, setCampaignSearch] = useState("");
    const [campaignStatus, setCampaignStatus] = useState("All");
    const [paymentCampaign, setPaymentCampaign] = useState("All");
    const [paymentSearch, setPaymentSearch] = useState("");
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const loadAdminData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [statsResponse, campaignsResponse, usersResponse, donationsResponse] =
                await Promise.all([
                    API.get("/admin/stats"),
                    API.get("/admin/campaigns"),
                    API.get("/admin/users"),
                    API.get("/admin/donations"),
                ]);

            setStats(statsResponse.data);
            setCampaigns(campaignsResponse.data || []);
            setUsers(usersResponse.data || []);
            setDonations(donationsResponse.data || []);
        } catch (requestError) {
            console.error("Admin dashboard error:", requestError);
            setError(
                requestError.response?.data?.detail ||
                "Unable to load the admin dashboard."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAdminData();
    }, [loadAdminData]);

    const formatAmount = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        })}`;

    const formatDate = (value) => {
        if (!value) return "N/A";
        return new Date(value).toLocaleString("en-IN");
    };

    const shorten = (value, start = 8, end = 6) => {
        if (!value) return "N/A";
        return `${value.slice(0, start)}...${value.slice(-end)}`;
    };

    const getStatusClass = (status) => {
        if (status === "Approved") return "status-approved";
        if (status === "Rejected") return "status-rejected";
        return "status-pending";
    };

    const getRiskLevel = (score) => {
        const value = Number(score || 0);
        if (value >= 80) return "Low Risk";
        if (value >= 60) return "Medium Risk";
        return "High Risk";
    };

    const getProgressClass = (percentage) => {
        const value = Number(percentage || 0);
        if (value >= 80) return "progress-high";
        if (value >= 40) return "progress-medium";
        return "progress-low";
    };

    const updateCampaignStatus = async (campaignId, status) => {
        const actionText =
            status === "approve"
                ? "approve"
                : status === "reject"
                    ? "reject"
                    : "move this campaign back to pending";

        if (!window.confirm(`Are you sure you want to ${actionText}?`)) return;

        try {
            setActionLoading(`${status}-${campaignId}`);
            await API.put(`/admin/campaigns/${campaignId}/${status}`);
            await loadAdminData();
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
        if (
            !window.confirm(
                "Delete this campaign and all of its payment history permanently?"
            )
        ) {
            return;
        }

        try {
            setActionLoading(`delete-${campaignId}`);
            await API.delete(`/admin/campaigns/${campaignId}`);
            setSelectedCampaign(null);
            await loadAdminData();
        } catch (requestError) {
            alert(
                requestError.response?.data?.detail ||
                "Unable to delete campaign."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const changeUserRole = async (userId, role) => {
        if (!window.confirm(`Change this account to ${role}?`)) return;

        try {
            setActionLoading(`role-${userId}`);
            await API.put(`/admin/users/${userId}/role/${role}`);
            await loadAdminData();
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
        if (
            !window.confirm(
                "Delete this user and all related campaigns and donations?"
            )
        ) {
            return;
        }

        try {
            setActionLoading(`user-delete-${userId}`);
            await API.delete(`/admin/users/${userId}`);
            await loadAdminData();
        } catch (requestError) {
            alert(
                requestError.response?.data?.detail || "Unable to delete user."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const pendingCampaigns = useMemo(
        () => campaigns.filter((campaign) => campaign.status === "Pending"),
        [campaigns]
    );

    const filteredCampaigns = useMemo(() => {
        const text = campaignSearch.trim().toLowerCase();
        return campaigns.filter((campaign) => {
            const matchesStatus =
                campaignStatus === "All" || campaign.status === campaignStatus;
            const matchesText =
                !text ||
                campaign.title?.toLowerCase().includes(text) ||
                campaign.creator_name?.toLowerCase().includes(text) ||
                campaign.category?.toLowerCase().includes(text);
            return matchesStatus && matchesText;
        });
    }, [campaignSearch, campaignStatus, campaigns]);

    const filteredDonations = useMemo(() => {
        const text = paymentSearch.trim().toLowerCase();
        return donations.filter((donation) => {
            const matchesCampaign =
                paymentCampaign === "All" ||
                Number(paymentCampaign) === Number(donation.campaign_id);
            const matchesText =
                !text ||
                donation.donor_name?.toLowerCase().includes(text) ||
                donation.campaign_title?.toLowerCase().includes(text) ||
                donation.wallet_address?.toLowerCase().includes(text) ||
                donation.transaction_hash?.toLowerCase().includes(text);
            return matchesCampaign && matchesText;
        });
    }, [donations, paymentCampaign, paymentSearch]);

    const selectedCampaignDonations = useMemo(() => {
        if (!selectedCampaign) return [];
        return donations.filter(
            (donation) =>
                Number(donation.campaign_id) === Number(selectedCampaign.id)
        );
    }, [donations, selectedCampaign]);

    const topCampaign = useMemo(() => {
        if (!campaigns.length) return null;
        return [...campaigns].sort(
            (a, b) => Number(b.raised_amount || 0) - Number(a.raised_amount || 0)
        )[0];
    }, [campaigns]);

    const largestDonation = useMemo(() => {
        if (!donations.length) return 0;
        return Math.max(...donations.map((item) => Number(item.amount || 0)));
    }, [donations]);

    const averageDonation = donations.length
        ? donations.reduce((sum, item) => sum + Number(item.amount || 0), 0) /
        donations.length
        : 0;

    if (loading) {
        return (
            <div className="admin-page admin-center-state">
                <div className="admin-loader" />
                <h2>Loading premium admin dashboard...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-page admin-center-state">
                <h2>Unable to load dashboard</h2>
                <p>{error}</p>
                <button className="primary-admin-btn" onClick={loadAdminData}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="admin-hero">
                <div>
                    <span className="admin-eyebrow">BLOCKFUND AI • CONTROL CENTER</span>
                    <h1>Welcome back, {stats?.admin?.full_name || "Admin"}</h1>
                    <p>
                        Track campaign funding, blockchain payments, AI risk and
                        platform activity from one dashboard.
                    </p>
                </div>
                <button className="refresh-admin-btn" onClick={loadAdminData}>
                    ↻ Refresh Data
                </button>
            </header>

            <section className="admin-stats premium-stats">
                <StatCard label="Total Users" value={stats?.total_users ?? 0} icon="👥" />
                <StatCard label="Total Campaigns" value={stats?.total_campaigns ?? 0} icon="🚀" />
                <StatCard label="Total Collected" value={formatAmount(stats?.total_donation_amount)} icon="💰" tone="success" />
                <StatCard label="Total Payments" value={stats?.total_donations ?? 0} icon="⛓️" />
                <StatCard label="Unique Donors" value={stats?.unique_donors ?? 0} icon="🤝" />
                <StatCard label="Pending Reviews" value={stats?.pending_campaigns ?? 0} icon="⏳" tone="warning" />
                <StatCard label="Average Donation" value={formatAmount(averageDonation)} icon="📊" />
                <StatCard label="Largest Donation" value={formatAmount(largestDonation)} icon="🏆" tone="success" />
            </section>

            <section className="admin-highlight-grid">
                <div className="admin-highlight-card">
                    <span>Top Funded Campaign</span>
                    <h3>{topCampaign?.title || "No campaigns yet"}</h3>
                    <strong>{formatAmount(topCampaign?.raised_amount)}</strong>
                    <div className="funding-track compact">
                        <div
                            className={`funding-fill ${getProgressClass(topCampaign?.funding_percentage)}`}
                            style={{ width: `${Math.min(Number(topCampaign?.funding_percentage || 0), 100)}%` }}
                        />
                    </div>
                    <small>{Number(topCampaign?.funding_percentage || 0).toFixed(1)}% funded</small>
                </div>

                <div className="admin-highlight-card">
                    <span>AI Risk Summary</span>
                    <h3>{campaigns.filter((item) => Number(item.trust_score || 0) < 60).length} campaigns require review</h3>
                    <strong>{Number(stats?.average_trust_score || 0).toFixed(1)}% average trust</strong>
                    <small>Review low-trust campaigns before approval.</small>
                </div>

                <div className="admin-highlight-card">
                    <span>Approval Overview</span>
                    <h3>{stats?.approved_campaigns ?? 0} approved</h3>
                    <strong>{stats?.rejected_campaigns ?? 0} rejected</strong>
                    <small>{stats?.pending_campaigns ?? 0} campaigns are waiting.</small>
                </div>
            </section>

            <section className="admin-panel">
                <PanelHeading
                    title="Campaign Approval Queue"
                    description="Review pending campaigns before they become visible to donors."
                    count={pendingCampaigns.length}
                />

                {pendingCampaigns.length === 0 ? (
                    <div className="admin-empty">No pending campaign approvals.</div>
                ) : (
                    <div className="approval-grid">
                        {pendingCampaigns.map((campaign) => (
                            <article className="approval-card" key={campaign.id}>
                                <div>
                                    <span className="category-pill">{campaign.category}</span>
                                    <h3>{campaign.title}</h3>
                                    <p>By {campaign.creator_name}</p>
                                </div>
                                <div className="approval-metrics">
                                    <span>Goal <b>{formatAmount(campaign.goal_amount)}</b></span>
                                    <span>AI <b>{campaign.trust_score}%</b></span>
                                    <span className={Number(campaign.trust_score) < 60 ? "risk-high" : "risk-low"}>
                                        {getRiskLevel(campaign.trust_score)}
                                    </span>
                                </div>
                                <div className="table-actions">
                                    <button className="approve-btn" onClick={() => updateCampaignStatus(campaign.id, "approve")}>Approve</button>
                                    <button className="reject-btn" onClick={() => updateCampaignStatus(campaign.id, "reject")}>Reject</button>
                                    <button className="view-btn" onClick={() => setSelectedCampaign(campaign)}>View</button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="admin-panel">
                <PanelHeading
                    title="Campaign Funding Analytics"
                    description="Track the amount collected by every campaign and inspect its payment history."
                    count={campaigns.length}
                />

                <div className="admin-toolbar">
                    <input
                        value={campaignSearch}
                        onChange={(event) => setCampaignSearch(event.target.value)}
                        placeholder="Search campaign, creator or category..."
                    />
                    <select value={campaignStatus} onChange={(event) => setCampaignStatus(event.target.value)}>
                        <option>All</option>
                        <option>Pending</option>
                        <option>Approved</option>
                        <option>Rejected</option>
                    </select>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table campaign-analytics-table">
                        <thead>
                            <tr>
                                <th>Campaign</th>
                                <th>Goal</th>
                                <th>Collected</th>
                                <th>Remaining</th>
                                <th>Funding</th>
                                <th>Payments</th>
                                <th>Donors</th>
                                <th>AI Trust</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCampaigns.map((campaign) => (
                                <tr key={campaign.id}>
                                    <td>
                                        <strong>{campaign.title}</strong>
                                        <small>{campaign.creator_name} • {campaign.category}</small>
                                    </td>
                                    <td>{formatAmount(campaign.goal_amount)}</td>
                                    <td className="money-positive">{formatAmount(campaign.raised_amount)}</td>
                                    <td>{formatAmount(campaign.remaining_amount)}</td>
                                    <td className="progress-cell">
                                        <div className="progress-label">
                                            <span>{Number(campaign.funding_percentage || 0).toFixed(1)}%</span>
                                        </div>
                                        <div className="funding-track">
                                            <div
                                                className={`funding-fill ${getProgressClass(campaign.funding_percentage)}`}
                                                style={{ width: `${Math.min(Number(campaign.funding_percentage || 0), 100)}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td>{campaign.donation_count ?? 0}</td>
                                    <td>{campaign.unique_donors ?? 0}</td>
                                    <td>
                                        <span className={`trust-chip ${Number(campaign.trust_score) < 60 ? "trust-danger" : ""}`}>
                                            {campaign.trust_score}%
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`admin-status ${getStatusClass(campaign.status)}`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions compact-actions">
                                            <button className="view-btn" onClick={() => setSelectedCampaign(campaign)}>History</button>
                                            {campaign.status !== "Approved" && (
                                                <button disabled={actionLoading === `approve-${campaign.id}`} className="approve-btn small-action-btn" onClick={() => updateCampaignStatus(campaign.id, "approve")}>Approve</button>
                                            )}
                                            {campaign.status !== "Rejected" && (
                                                <button disabled={actionLoading === `reject-${campaign.id}`} className="reject-btn small-action-btn" onClick={() => updateCampaignStatus(campaign.id, "reject")}>Reject</button>
                                            )}
                                            {campaign.status !== "Pending" && (
                                                <button className="pending-btn small-action-btn" onClick={() => updateCampaignStatus(campaign.id, "pending")}>Pending</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCampaigns.length === 0 && (
                                <tr><td colSpan="10" className="table-empty">No matching campaigns.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="admin-panel">
                <PanelHeading
                    title="Blockchain Payment History"
                    description="Search and filter payments for any campaign."
                    count={filteredDonations.length}
                />

                <div className="admin-toolbar">
                    <input
                        value={paymentSearch}
                        onChange={(event) => setPaymentSearch(event.target.value)}
                        placeholder="Search donor, wallet or transaction hash..."
                    />
                    <select value={paymentCampaign} onChange={(event) => setPaymentCampaign(event.target.value)}>
                        <option value="All">All campaigns</option>
                        {campaigns.map((campaign) => (
                            <option value={campaign.id} key={campaign.id}>{campaign.title}</option>
                        ))}
                    </select>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Donor</th>
                                <th>Campaign</th>
                                <th>Amount</th>
                                <th>Wallet</th>
                                <th>Transaction Hash</th>
                                <th>Date & Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDonations.map((donation) => (
                                <tr key={donation.id}>
                                    <td>#{donation.id}</td>
                                    <td><strong>{donation.donor_name}</strong><small>{donation.donor_email}</small></td>
                                    <td>{donation.campaign_title}</td>
                                    <td className="money-positive">{formatAmount(donation.amount)}</td>
                                    <td title={donation.wallet_address}>{shorten(donation.wallet_address, 7, 5)}</td>
                                    <td title={donation.transaction_hash} className="transaction-cell">{shorten(donation.transaction_hash, 11, 8)}</td>
                                    <td>{formatDate(donation.created_at)}</td>
                                </tr>
                            ))}
                            {filteredDonations.length === 0 && (
                                <tr><td colSpan="7" className="table-empty">No payment records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="admin-panel">
                <PanelHeading title="User Management" description="Manage registered users and administrative access." count={users.length} />
                <div className="admin-table-wrapper">
                    <table className="admin-table user-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Campaigns</th>
                                <th>Donations</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td><strong>{user.full_name}</strong><small>User #{user.id}</small></td>
                                    <td>{user.email}</td>
                                    <td><span className={`admin-status ${user.role === "admin" ? "status-approved" : "status-pending"}`}>{user.role}</span></td>
                                    <td>{user.campaign_count ?? 0}</td>
                                    <td>{user.donation_count ?? 0}</td>
                                    <td>
                                        <div className="table-actions">
                                            {user.role === "user" ? (
                                                <button className="approve-btn small-action-btn" onClick={() => changeUserRole(user.id, "admin")}>Make Admin</button>
                                            ) : (
                                                <button disabled={user.id === stats?.admin?.id} className="pending-btn small-action-btn" onClick={() => changeUserRole(user.id, "user")}>Make User</button>
                                            )}
                                            <button disabled={user.id === stats?.admin?.id || actionLoading === `user-delete-${user.id}`} className="admin-delete-btn small-action-btn" onClick={() => deleteUser(user.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {selectedCampaign && (
                <div className="admin-modal-backdrop" onMouseDown={() => setSelectedCampaign(null)}>
                    <div className="admin-modal" onMouseDown={(event) => event.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedCampaign(null)}>×</button>
                        <span className="admin-eyebrow">CAMPAIGN PAYMENT REPORT</span>
                        <h2>{selectedCampaign.title}</h2>
                        <p>{selectedCampaign.creator_name} • {selectedCampaign.category}</p>

                        <div className="modal-stat-grid">
                            <MiniStat label="Goal" value={formatAmount(selectedCampaign.goal_amount)} />
                            <MiniStat label="Collected" value={formatAmount(selectedCampaign.raised_amount)} />
                            <MiniStat label="Remaining" value={formatAmount(selectedCampaign.remaining_amount)} />
                            <MiniStat label="Funding" value={`${Number(selectedCampaign.funding_percentage || 0).toFixed(1)}%`} />
                            <MiniStat label="Payments" value={selectedCampaign.donation_count ?? 0} />
                            <MiniStat label="Unique Donors" value={selectedCampaign.unique_donors ?? 0} />
                            <MiniStat label="Average" value={formatAmount(selectedCampaign.average_donation)} />
                            <MiniStat label="Largest" value={formatAmount(selectedCampaign.largest_donation)} />
                        </div>

                        <div className="funding-track modal-progress">
                            <div className={`funding-fill ${getProgressClass(selectedCampaign.funding_percentage)}`} style={{ width: `${Math.min(Number(selectedCampaign.funding_percentage || 0), 100)}%` }} />
                        </div>

                        <h3 className="modal-section-title">Payment History</h3>
                        <div className="admin-table-wrapper modal-table-wrapper">
                            <table className="admin-table">
                                <thead><tr><th>Donor</th><th>Amount</th><th>Wallet</th><th>Transaction</th><th>Date</th></tr></thead>
                                <tbody>
                                    {selectedCampaignDonations.map((donation) => (
                                        <tr key={donation.id}>
                                            <td>{donation.donor_name}</td>
                                            <td className="money-positive">{formatAmount(donation.amount)}</td>
                                            <td>{shorten(donation.wallet_address, 7, 5)}</td>
                                            <td>{shorten(donation.transaction_hash, 10, 7)}</td>
                                            <td>{formatDate(donation.created_at)}</td>
                                        </tr>
                                    ))}
                                    {selectedCampaignDonations.length === 0 && <tr><td colSpan="5" className="table-empty">No payments for this campaign yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        <div className="modal-footer-actions">
                            <button className="admin-delete-btn" onClick={() => deleteCampaign(selectedCampaign.id)}>Delete Campaign</button>
                            <button className="primary-admin-btn" onClick={() => setSelectedCampaign(null)}>Close Report</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, icon, tone = "default" }) {
    return (
        <article className={`admin-card stat-${tone}`}>
            <div className="stat-icon">{icon}</div>
            <div><h3>{label}</h3><h2>{value}</h2></div>
        </article>
    );
}

function PanelHeading({ title, description, count }) {
    return (
        <div className="admin-panel-heading">
            <div><h2>{title}</h2><p>{description}</p></div>
            <span className="admin-count">{count}</span>
        </div>
    );
}

function MiniStat({ label, value }) {
    return <div className="mini-stat"><span>{label}</span><strong>{value}</strong></div>;
}

export default AdminDashboard;