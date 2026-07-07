function AdminDashboard() {
    return (
        <div className="admin-page">
            <div className="admin-header">
                <p className="small-title">Admin Panel</p>
                <h1>Welcome, Admin 👋</h1>
                <p>Manage users, campaigns, AI risk review, and blockchain transactions.</p>
            </div>

            <div className="admin-stats">
                <div className="admin-card">
                    <h3>Total Users</h3>
                    <h2>1,245</h2>
                </div>

                <div className="admin-card">
                    <h3>Total Campaigns</h3>
                    <h2>320</h2>
                </div>

                <div className="admin-card warning">
                    <h3>Pending Approvals</h3>
                    <h2>18</h2>
                </div>

                <div className="admin-card success">
                    <h3>Approved Campaigns</h3>
                    <h2>286</h2>
                </div>

                <div className="admin-card danger">
                    <h3>Rejected Campaigns</h3>
                    <h2>16</h2>
                </div>

                <div className="admin-card">
                    <h3>Total Donations</h3>
                    <h2>₹58.4L</h2>
                </div>

                <div className="admin-card warning">
                    <h3>AI Flagged</h3>
                    <h2>9</h2>
                </div>

                <div className="admin-card success">
                    <h3>Blockchain Txns</h3>
                    <h2>4,892</h2>
                </div>
            </div>

            <div className="admin-grid">
                <div className="admin-panel">
                    <h2>Campaign Approval Requests</h2>

                    <div className="admin-row">
                        <div>
                            <h3>Medical Emergency Fund</h3>
                            <p>AI Score: 91% • Low Risk</p>
                        </div>
                        <div>
                            <button className="approve-btn">Approve</button>
                            <button className="reject-btn">Reject</button>
                        </div>
                    </div>

                    <div className="admin-row">
                        <div>
                            <h3>Startup Investment Help</h3>
                            <p>AI Score: 58% • Medium Risk</p>
                        </div>
                        <div>
                            <button className="approve-btn">Approve</button>
                            <button className="reject-btn">Reject</button>
                        </div>
                    </div>

                    <div className="admin-row">
                        <div>
                            <h3>Education Support</h3>
                            <p>AI Score: 84% • Low Risk</p>
                        </div>
                        <div>
                            <button className="approve-btn">Approve</button>
                            <button className="reject-btn">Reject</button>
                        </div>
                    </div>
                </div>

                <div className="admin-panel">
                    <h2>AI Risk Review</h2>
                    <p>⚠️ 9 campaigns need manual review.</p>
                    <p>🤖 18 campaigns evaluated today.</p>
                    <p>✅ 286 campaigns passed AI verification.</p>
                    <p>🔒 Blockchain verification completed for approved campaigns.</p>
                </div>
            </div>

            <div className="admin-panel">
                <h2>Recent Blockchain Transactions</h2>

                <div className="txn-row">
                    <span>0x34A...9B12</span>
                    <span>Medical Campaign</span>
                    <span className="success-text">Verified</span>
                </div>

                <div className="txn-row">
                    <span>0x76C...8FA2</span>
                    <span>Education Fund</span>
                    <span className="success-text">Verified</span>
                </div>

                <div className="txn-row">
                    <span>0x22D...1AC9</span>
                    <span>Startup Fund</span>
                    <span className="success-text">Verified</span>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;