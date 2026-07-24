import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import API from "../api/api";

import DashboardChart
    from "../components/DashboardChart";

import "../css/dashboard.css";


function Dashboard() {

    const navigate = useNavigate();

    const [data, setData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [wallet, setWallet] =
        useState("");


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    const loadDashboard =
        useCallback(async () => {

            try {
                setLoading(true);

                setError("");

                const response =
                    await API.get(
                        "/dashboard/stats"
                    );

                setData(
                    response.data
                );

            } catch (requestError) {

                console.error(
                    "Dashboard error:",
                    requestError
                );

                setError(
                    requestError
                        .response
                        ?.data
                        ?.detail
                    ||
                    "Unable to load dashboard"
                );

            } finally {
                setLoading(false);
            }

        }, []);


    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);


    // =====================================================
    // CHECK METAMASK WALLET
    // =====================================================

    useEffect(() => {

        if (!window.ethereum) {
            return;
        }

        window.ethereum
            .request({
                method:
                    "eth_accounts",
            })
            .then((accounts) => {

                setWallet(
                    accounts?.[0] || ""
                );

            })
            .catch((walletError) => {

                console.error(
                    "Wallet check error:",
                    walletError
                );

            });


        const handleAccountChange =
            (accounts) => {

                setWallet(
                    accounts?.[0] || ""
                );
            };


        window.ethereum.on(
            "accountsChanged",
            handleAccountChange
        );


        return () => {

            window.ethereum
                .removeListener(
                    "accountsChanged",
                    handleAccountChange
                );
        };

    }, []);


    // =====================================================
    // CONNECT METAMASK
    // =====================================================

    const connectWallet = async () => {

        if (!window.ethereum) {

            alert(
                "MetaMask is not installed"
            );

            return;
        }

        try {

            const accounts =
                await window.ethereum
                    .request({
                        method:
                            "eth_requestAccounts",
                    });

            setWallet(
                accounts?.[0] || ""
            );

        } catch (walletError) {

            if (
                walletError.code
                !== 4001
            ) {
                alert(
                    walletError.message
                    ||
                    "Unable to connect wallet"
                );
            }
        }
    };


    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================

    const formatMoney = (value) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",

                currency: "INR",

                maximumFractionDigits: 0,
            }
        ).format(
            Number(value || 0)
        );
    };


    const shortenValue = (
        value,
        start = 7,
        end = 5
    ) => {

        if (!value) {
            return "N/A";
        }

        return (
            `${value.slice(
                0,
                start
            )}...${value.slice(
                -end
            )}`
        );
    };


    const getStatusClass =
        (status) => {

            if (
                status === "Approved"
            ) {
                return "approved";
            }

            if (
                status === "Rejected"
            ) {
                return "rejected";
            }

            return "pending";
        };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div
                className=
                "dashboard-page center-state"
            >
                <h2>
                    Loading analytics...
                </h2>
            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (
            <div
                className=
                "dashboard-page center-state"
            >
                <h2>
                    {error}
                </h2>

                <button
                    onClick={
                        loadDashboard
                    }
                >
                    Try Again
                </button>
            </div>
        );
    }


    return (
        <main className="dashboard-page">

            {/* HERO */}

            <header className="dashboard-hero">

                <div>

                    <p className="small-title">
                        BLOCKFUND AI •
                        CREATOR ANALYTICS
                    </p>

                    <h1>
                        Welcome,{" "}

                        <span>
                            {
                                data
                                    ?.user
                                    ?.full_name
                                || "Creator"
                            }
                        </span>
                    </h1>

                    <p>
                        Track campaign
                        performance, donor
                        activity, blockchain
                        payments and AI trust
                        insights.
                    </p>

                </div>


                <div className="wallet-status">

                    <h3>
                        MetaMask Wallet
                    </h3>

                    {wallet ? (

                        <div className="wallet-chip">

                            ●{" "}

                            {
                                shortenValue(
                                    wallet
                                )
                            }

                        </div>

                    ) : (

                        <button
                            onClick={
                                connectWallet
                            }
                        >
                            Connect Wallet
                        </button>
                    )}

                </div>

            </header>


            {/* STATISTICS */}

            <section className="dashboard-stats">

                <StatCard
                    icon="🚀"
                    value={
                        data
                            ?.total_campaigns
                    }
                    label="Campaigns"
                />

                <StatCard
                    icon="💰"
                    value={
                        formatMoney(
                            data
                                ?.funds_raised
                        )
                    }
                    label="Funds Raised"
                />

                <StatCard
                    icon="🤝"
                    value={
                        data
                            ?.total_donors
                    }
                    label="Unique Donors"
                />

                <StatCard
                    icon="🤖"
                    value={
                        `${Number(
                            data
                                ?.average_trust
                            || 0
                        ).toFixed(1)}%`
                    }
                    label="AI Trust"
                />

                <StatCard
                    icon="⛓️"
                    value={
                        data
                            ?.total_donations
                    }
                    label="Payments"
                />

                <StatCard
                    icon="📊"
                    value={
                        formatMoney(
                            data
                                ?.average_donation
                        )
                    }
                    label="Average Donation"
                />

                <StatCard
                    icon="🏆"
                    value={
                        formatMoney(
                            data
                                ?.largest_donation
                        )
                    }
                    label="Largest Donation"
                />

                <StatCard
                    icon="⏳"
                    value={
                        data
                            ?.pending_campaigns
                    }
                    label="Pending Reviews"
                />

            </section>


            {/* HIGHLIGHTS */}

            <section className="dashboard-highlights">

                <article>

                    <span>
                        TOP CAMPAIGN
                    </span>

                    <h2>
                        {
                            data
                                ?.top_campaign
                                ?.title
                            || "No campaign yet"
                        }
                    </h2>

                    <strong>
                        {
                            formatMoney(
                                data
                                    ?.top_campaign
                                    ?.raised_amount
                            )
                        }
                    </strong>

                    <div className="progress">

                        <div
                            style={{
                                width:
                                    `${Math.min(
                                        Number(
                                            data
                                                ?.top_campaign
                                                ?.funding_percentage
                                            || 0
                                        ),
                                        100
                                    )}%`,
                            }}
                        />

                    </div>

                    {
                        data?.top_campaign
                        && (
                            <button
                                onClick={() =>
                                    navigate(
                                        `/campaign/${data
                                            .top_campaign
                                            .id
                                        }`
                                    )
                                }
                            >
                                View Campaign
                            </button>
                        )
                    }

                </article>


                <article>

                    <span>
                        APPROVAL OVERVIEW
                    </span>

                    <SummaryRow
                        label="Approved"
                        value={
                            data
                                ?.approved_campaigns
                        }
                        type="approved"
                    />

                    <SummaryRow
                        label="Pending"
                        value={
                            data
                                ?.pending_campaigns
                        }
                        type="pending"
                    />

                    <SummaryRow
                        label="Rejected"
                        value={
                            data
                                ?.rejected_campaigns
                        }
                        type="rejected"
                    />

                </article>


                <article>

                    <span>
                        AI INSIGHT
                    </span>

                    <h2>
                        {
                            Number(
                                data
                                    ?.average_trust
                                || 0
                            ) >= 80

                                ? "Strong campaign quality"

                                : "Campaigns can improve"
                        }
                    </h2>

                    <p>
                        Improve descriptions,
                        budget details and
                        verification documents
                        to increase donor
                        confidence.
                    </p>

                    <Link
                        to="/create-campaign"
                    >
                        Create Campaign
                    </Link>

                </article>

            </section>


            {/* CHARTS */}

            <section className="analytics-box">

                <div className="section-heading">

                    <div>

                        <span>
                            ADVANCED ANALYTICS
                        </span>

                        <h2>
                            Performance Dashboard
                        </h2>

                    </div>

                    <button
                        onClick={
                            loadDashboard
                        }
                    >
                        ↻ Refresh
                    </button>

                </div>


                <DashboardChart
                    chartData={
                        data
                            ?.chart_data
                        || []
                    }

                    categoryData={
                        data
                            ?.category_breakdown
                        || []
                    }

                    statusData={
                        data
                            ?.status_breakdown
                        || []
                    }

                    trustData={
                        data
                            ?.trust_distribution
                        || []
                    }
                />

            </section>


            {/* CAMPAIGNS AND NOTIFICATIONS */}

            <section className="dashboard-content">

                <article className="dashboard-panel">

                    <h2>
                        Recent Campaigns
                    </h2>

                    {
                        (
                            data
                                ?.recent_campaigns
                            || []
                        ).map(
                            (campaign) => (

                                <div
                                    className=
                                    "campaign-item"
                                    key={
                                        campaign.id
                                    }
                                >

                                    <div>

                                        <h3>
                                            {
                                                campaign
                                                    .title
                                            }
                                        </h3>

                                        <p>
                                            {
                                                campaign
                                                    .category
                                            }

                                            {" • "}

                                            {
                                                formatMoney(
                                                    campaign
                                                        .raised_amount
                                                )
                                            }
                                        </p>

                                    </div>


                                    <span
                                        className={
                                            getStatusClass(
                                                campaign
                                                    .campaign_status
                                            )
                                        }
                                    >
                                        {
                                            campaign
                                                .campaign_status
                                        }
                                    </span>


                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/campaign/${campaign.id
                                                }`
                                            )
                                        }
                                    >
                                        Open
                                    </button>

                                </div>
                            )
                        )
                    }


                    {
                        !data
                            ?.recent_campaigns
                            ?.length
                        && (
                            <p>
                                No campaigns yet.
                            </p>
                        )
                    }

                </article>


                <article className="dashboard-panel">

                    <h2>
                        Smart Notifications
                    </h2>

                    {
                        (
                            data
                                ?.notifications
                            || []
                        ).map(
                            (
                                notification,
                                index
                            ) => (

                                <div
                                    className=
                                    "notification"
                                    key={index}
                                >
                                    {
                                        notification
                                    }
                                </div>
                            )
                        )
                    }

                </article>

            </section>


            {/* BLOCKCHAIN TRANSACTIONS */}

            <section className="dashboard-panel">

                <h2>
                    Recent Blockchain
                    Transactions
                </h2>

                <div className="table-wrapper">

                    <table>

                        <thead>

                            <tr>
                                <th>
                                    Donor
                                </th>

                                <th>
                                    Campaign
                                </th>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    Wallet
                                </th>

                                <th>
                                    Transaction
                                </th>
                            </tr>

                        </thead>


                        <tbody>

                            {
                                (
                                    data
                                        ?.recent_donations
                                    || []
                                ).map(
                                    (donation) => (

                                        <tr
                                            key={
                                                donation.id
                                            }
                                        >

                                            <td>
                                                {
                                                    donation
                                                        .donor_name
                                                }
                                            </td>

                                            <td>
                                                {
                                                    donation
                                                        .campaign_title
                                                }
                                            </td>

                                            <td>
                                                {
                                                    formatMoney(
                                                        donation
                                                            .amount
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    shortenValue(
                                                        donation
                                                            .wallet_address
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    shortenValue(
                                                        donation
                                                            .transaction_hash,
                                                        10,
                                                        7
                                                    )
                                                }
                                            </td>

                                        </tr>
                                    )
                                )
                            }


                            {
                                !data
                                    ?.recent_donations
                                    ?.length
                                && (
                                    <tr>

                                        <td
                                            colSpan="5"
                                        >
                                            No transactions yet.
                                        </td>

                                    </tr>
                                )
                            }

                        </tbody>

                    </table>

                </div>

            </section>


            {/* QUICK ACTIONS */}

            <section className="quick-actions">

                <Link to="/create-campaign">
                    ➕ Create Campaign
                </Link>

                <Link to="/my-campaigns">
                    📋 My Campaigns
                </Link>

                <Link to="/campaigns">
                    🔎 Explore
                </Link>

                <Link to="/profile">
                    👤 Profile
                </Link>

                <button
                    onClick={
                        loadDashboard
                    }
                >
                    🔄 Refresh
                </button>

            </section>

        </main>
    );
}


function StatCard({
    icon,
    value,
    label,
}) {

    return (
        <article className="dash-card">

            <span>
                {icon}
            </span>

            <h2>
                {value ?? 0}
            </h2>

            <p>
                {label}
            </p>

        </article>
    );
}


function SummaryRow({
    label,
    value,
    type,
}) {

    return (
        <div
            className={
                `summary ${type}`
            }
        >

            <span>
                {label}
            </span>

            <strong>
                {value ?? 0}
            </strong>

        </div>
    );
}


export default Dashboard;