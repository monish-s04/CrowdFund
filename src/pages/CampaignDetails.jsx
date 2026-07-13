import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

function CampaignDetails() {
    const { id } = useParams();

    const [campaign, setCampaign] = useState(null);
    const [donations, setDonations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [donationLoading, setDonationLoading] = useState(false);

    const [donationAmount, setDonationAmount] = useState("");
    const [walletAddress, setWalletAddress] = useState("");

    /*
        Demo blockchain configuration.

        Add these values in frontend .env:

        VITE_DONATION_WALLET_ADDRESS=0xYOUR_METAMASK_TEST_WALLET
        VITE_DEMO_INR_PER_ETH=300000

        IMPORTANT:
        Use a MetaMask test account and test network for your project demo.
    */

    const RECEIVER_WALLET =
        import.meta.env.VITE_DONATION_WALLET_ADDRESS || "";

    const DEMO_INR_PER_ETH = Number(
        import.meta.env.VITE_DEMO_INR_PER_ETH || 300000
    );

    const getDefaultImage = (category) => {
        if (category === "Healthcare") {
            return "https://images.unsplash.com/photo-1576091160550-2173dba999ef";
        }

        if (category === "Education") {
            return "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b";
        }

        if (category === "Disaster Relief") {
            return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
        }

        if (category === "Business") {
            return "https://images.unsplash.com/photo-1556761175-4b46a572b786";
        }

        return "https://images.unsplash.com/photo-1559027615-cd4628902d4a";
    };

    // Convert ETH decimal value into hexadecimal Wei
    const ethToWeiHex = (ethAmount) => {
        const amountString = Number(ethAmount).toFixed(18);

        const [wholePart, decimalPart = ""] =
            amountString.split(".");

        const paddedDecimal = decimalPart
            .padEnd(18, "0")
            .slice(0, 18);

        const wei =
            BigInt(wholePart) * BigInt("1000000000000000000") +
            BigInt(paddedDecimal);

        return `0x${wei.toString(16)}`;
    };

    const fetchCampaign = useCallback(async () => {
        const response = await API.get(`/campaigns/${id}`);
        setCampaign(response.data);
    }, [id]);

    const fetchDonations = useCallback(async () => {
        try {
            const response = await API.get(
                `/donations/campaign/${id}`
            );

            setDonations(response.data);
        } catch (error) {
            console.error(
                "Unable to load donation history:",
                error
            );

            setDonations([]);
        }
    }, [id]);

    const loadPageData = useCallback(async () => {
        try {
            setLoading(true);

            await Promise.all([
                fetchCampaign(),
                fetchDonations(),
            ]);
        } catch (error) {
            console.error(
                "Campaign details loading error:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Campaign not found"
            );
        } finally {
            setLoading(false);
        }
    }, [fetchCampaign, fetchDonations]);

    useEffect(() => {
        loadPageData();
    }, [loadPageData]);

    // Check whether MetaMask is already connected
    useEffect(() => {
        const checkWalletConnection = async () => {
            if (!window.ethereum) {
                return;
            }

            try {
                const accounts = await window.ethereum.request({
                    method: "eth_accounts",
                });

                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                }
            } catch (error) {
                console.error(
                    "Unable to check wallet connection:",
                    error
                );
            }
        };

        checkWalletConnection();
    }, []);

    // Update wallet when user changes MetaMask account
    useEffect(() => {
        if (!window.ethereum) {
            return;
        }

        const handleAccountsChanged = (accounts) => {
            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
            } else {
                setWalletAddress("");
            }
        };

        window.ethereum.on(
            "accountsChanged",
            handleAccountsChanged
        );

        return () => {
            window.ethereum.removeListener(
                "accountsChanged",
                handleAccountsChanged
            );
        };
    }, []);

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert(
                "MetaMask is not installed. Please install MetaMask first."
            );

            return null;
        }

        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            if (!accounts || accounts.length === 0) {
                alert("No MetaMask account selected.");
                return null;
            }

            const selectedWallet = accounts[0];

            setWalletAddress(selectedWallet);

            return selectedWallet;
        } catch (error) {
            console.error(
                "MetaMask connection error:",
                error
            );

            alert(
                error.message ||
                "Unable to connect MetaMask"
            );

            return null;
        }
    };

    const handleDonate = async () => {
        const amountInINR = Number(donationAmount);

        if (!campaign) {
            return;
        }

        if (campaign.status !== "Approved") {
            alert(
                "Only approved campaigns can receive donations."
            );
            return;
        }

        if (
            !amountInINR ||
            Number.isNaN(amountInINR) ||
            amountInINR <= 0
        ) {
            alert(
                "Please enter a valid donation amount."
            );
            return;
        }

        if (!RECEIVER_WALLET) {
            alert(
                "Donation receiver wallet is not configured. Add VITE_DONATION_WALLET_ADDRESS in the frontend .env file."
            );
            return;
        }

        if (!window.ethereum) {
            alert(
                "MetaMask is not installed. Please install MetaMask."
            );
            return;
        }

        try {
            setDonationLoading(true);

            let donorWallet = walletAddress;

            if (!donorWallet) {
                donorWallet = await connectWallet();
            }

            if (!donorWallet) {
                return;
            }

            /*
                DEMO CONVERSION:

                Example:
                ₹300000 = 1 test ETH

                ₹300 donation:
                300 / 300000 = 0.001 ETH

                This is only for project demonstration.
            */

            const ethAmount =
                amountInINR / DEMO_INR_PER_ETH;

            if (ethAmount <= 0) {
                alert(
                    "Unable to calculate blockchain transaction amount."
                );
                return;
            }

            const transactionValue =
                ethToWeiHex(ethAmount);

            // Ask MetaMask to perform blockchain transaction
            const transactionHash =
                await window.ethereum.request({
                    method: "eth_sendTransaction",
                    params: [
                        {
                            from: donorWallet,
                            to: RECEIVER_WALLET,
                            value: transactionValue,
                        },
                    ],
                });

            if (!transactionHash) {
                throw new Error(
                    "Transaction hash was not returned by MetaMask."
                );
            }

            /*
                Save successful blockchain transaction
                in MySQL through FastAPI.
            */

            await API.post("/donations/", {
                campaign_id: Number(id),
                amount: amountInINR,
                wallet_address: donorWallet,
                transaction_hash: transactionHash,
            });

            alert(
                "Donation successful! Blockchain transaction recorded."
            );

            setDonationAmount("");

            // Reload campaign amount and donation history
            await Promise.all([
                fetchCampaign(),
                fetchDonations(),
            ]);
        } catch (error) {
            console.error(
                "Donation error:",
                error
            );

            // MetaMask user rejected transaction
            if (error.code === 4001) {
                alert(
                    "Transaction was cancelled in MetaMask."
                );

                return;
            }

            alert(
                error.response?.data?.detail ||
                error.message ||
                "Donation failed"
            );
        } finally {
            setDonationLoading(false);
        }
    };

    const selectDonationAmount = (amount) => {
        setDonationAmount(String(amount));
    };

    const shortenWallet = (address) => {
        if (!address) {
            return "";
        }

        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const shortenTransaction = (hash) => {
        if (!hash) {
            return "";
        }

        return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
    };

    if (loading) {
        return (
            <div className="campaign-details-page">
                <h1>Loading campaign...</h1>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="campaign-details-page">
                <h1>Campaign not found</h1>
            </div>
        );
    }

    const raisedAmount = Number(
        campaign.raised_amount || 0
    );

    const goalAmount = Number(
        campaign.goal_amount || 0
    );

    const percentage =
        goalAmount > 0
            ? Math.min(
                (raisedAmount / goalAmount) * 100,
                100
            ).toFixed(0)
            : 0;

    return (
        <div className="campaign-details-page">
            <div className="details-title">
                <p className="small-title">
                    Campaign Details
                </p>

                <h1>{campaign.title}</h1>

                <p>
                    Transparent fundraising powered by AI
                    evaluation and blockchain verification.
                </p>
            </div>

            <div className="details-layout">
                {/* LEFT SIDE */}

                <div className="details-left">
                    <img
                        src={
                            campaign.image_url ||
                            getDefaultImage(
                                campaign.category
                            )
                        }
                        alt={campaign.title}
                        className="details-main-img"
                        onError={(event) => {
                            event.currentTarget.src =
                                getDefaultImage(
                                    campaign.category
                                );
                        }}
                    />

                    <div className="story-card">
                        <h2>Campaign Story</h2>

                        <p>
                            {campaign.description}
                        </p>
                    </div>

                    <div className="story-card">
                        <h2>
                            Supporting Verification
                        </h2>

                        <div className="doc-row">
                            ✅ Identity Verification Completed
                        </div>

                        <div className="doc-row">
                            ✅ AI Trust Evaluation Completed
                        </div>

                        <div className="doc-row">
                            ✅ Admin Review Status:{" "}
                            {campaign.status}
                        </div>

                        <div className="doc-row">
                            ✅ Blockchain Donation Support Ready
                        </div>
                    </div>

                    {/* DONATION HISTORY */}

                    <div className="story-card">
                        <h2>
                            Recent Donations
                        </h2>

                        {donations.length === 0 ? (
                            <p>
                                No donations have been made yet.
                            </p>
                        ) : (
                            <div className="donation-history-list">
                                {donations
                                    .slice(0, 10)
                                    .map((donation) => (
                                        <div
                                            className="donation-history-item"
                                            key={donation.id}
                                        >
                                            <div>
                                                <h4>
                                                    {donation.donor_name ||
                                                        "Anonymous"}
                                                </h4>

                                                <p>
                                                    Wallet:{" "}
                                                    {shortenWallet(
                                                        donation.wallet_address
                                                    )}
                                                </p>

                                                <p>
                                                    Tx:{" "}
                                                    {shortenTransaction(
                                                        donation.transaction_hash
                                                    )}
                                                </p>
                                            </div>

                                            <strong>
                                                ₹
                                                {Number(
                                                    donation.amount
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE */}

                <div className="details-right">
                    {/* CAMPAIGN OVERVIEW */}

                    <div className="overview-card">
                        <span className="category-chip">
                            {campaign.category}
                        </span>

                        <h2>
                            Campaign Overview
                        </h2>

                        <div className="amount-row">
                            <div>
                                <h3>
                                    ₹
                                    {raisedAmount.toLocaleString(
                                        "en-IN"
                                    )}
                                </h3>

                                <p>Raised</p>
                            </div>

                            <div>
                                <h3>
                                    ₹
                                    {goalAmount.toLocaleString(
                                        "en-IN"
                                    )}
                                </h3>

                                <p>Goal</p>
                            </div>
                        </div>

                        <div className="progress-info">
                            <span>
                                {percentage}% Funded
                            </span>

                            <span>
                                {
                                    campaign.duration_days
                                }{" "}
                                Days
                            </span>
                        </div>

                        <div className="progress-bar">
                            <div
                                style={{
                                    width: `${percentage}%`,
                                }}
                            />
                        </div>
                    </div>

                    {/* DONATION BOX */}

                    <div className="verify-card donation-card">
                        <h2>
                            💰 Make a Donation
                        </h2>

                        {campaign.status !==
                            "Approved" ? (
                            <div className="donation-disabled-message">
                                Donations will be enabled after
                                admin approval.
                            </div>
                        ) : (
                            <>
                                <div className="quick-donation-buttons">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            selectDonationAmount(
                                                100
                                            )
                                        }
                                    >
                                        ₹100
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            selectDonationAmount(
                                                500
                                            )
                                        }
                                    >
                                        ₹500
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            selectDonationAmount(
                                                1000
                                            )
                                        }
                                    >
                                        ₹1,000
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            selectDonationAmount(
                                                5000
                                            )
                                        }
                                    >
                                        ₹5,000
                                    </button>
                                </div>

                                <label>
                                    Donation Amount (₹)
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Enter donation amount"
                                    value={donationAmount}
                                    onChange={(event) =>
                                        setDonationAmount(
                                            event.target.value
                                        )
                                    }
                                />

                                {donationAmount &&
                                    Number(
                                        donationAmount
                                    ) > 0 && (
                                        <p className="demo-conversion">
                                            Demo testnet
                                            transaction: approximately{" "}
                                            {(
                                                Number(
                                                    donationAmount
                                                ) /
                                                DEMO_INR_PER_ETH
                                            ).toFixed(6)}{" "}
                                            ETH
                                        </p>
                                    )}

                                {walletAddress ? (
                                    <div className="connected-wallet-box">
                                        🟢 Connected:{" "}
                                        {shortenWallet(
                                            walletAddress
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="connect-wallet-details-btn"
                                        onClick={
                                            connectWallet
                                        }
                                    >
                                        🦊 Connect MetaMask
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="donate-btn"
                                    onClick={
                                        handleDonate
                                    }
                                    disabled={
                                        donationLoading
                                    }
                                >
                                    {donationLoading
                                        ? "Processing Transaction..."
                                        : "Donate with MetaMask"}
                                </button>
                            </>
                        )}
                    </div>

                    {/* AI ANALYSIS */}

                    <div className="ai-analysis-card">
                        <h2>
                            🤖 AI Trust Analysis
                        </h2>

                        <div className="trust-circle">
                            <h3>
                                {
                                    campaign.trust_score
                                }
                                %
                            </h3>

                            <p>Trust Score</p>
                        </div>

                        <p>
                            ⚠ Risk Level:{" "}
                            <b>
                                {
                                    campaign.risk_level
                                }
                            </b>
                        </p>

                        <p>
                            📈 Success Probability:{" "}
                            <b>
                                {
                                    campaign.success_probability
                                }
                                %
                            </b>
                        </p>

                        <p>
                            💡 Recommendation
                        </p>

                        <div className="recommendation-box">
                            {
                                campaign.recommendation
                            }
                        </div>
                    </div>

                    {/* STATUS */}

                    <div className="verify-card">
                        <h2>
                            Campaign Status
                        </h2>

                        <p>
                            📌 Status:{" "}
                            <b>
                                {campaign.status}
                            </b>
                        </p>

                        <p>
                            ⛓ Blockchain:{" "}
                            <b>
                                MetaMask Enabled
                            </b>
                        </p>

                        <p>
                            🦊 Wallet:{" "}
                            <b>
                                {walletAddress
                                    ? shortenWallet(
                                        walletAddress
                                    )
                                    : "Not Connected"}
                            </b>
                        </p>
                    </div>

                    {/* CREATOR */}

                    <div className="verify-card">
                        <h2>
                            Creator Information
                        </h2>

                        <p>
                            👤 Created By:{" "}
                            <b>
                                {
                                    campaign.creator_name
                                }
                            </b>
                        </p>

                        <p>
                            ⭐ Creator Status:{" "}
                            <b>Verified</b>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CampaignDetails;