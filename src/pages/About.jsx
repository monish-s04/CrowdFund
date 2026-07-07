function About() {
    return (
        <div className="about-page">
            <div className="about-hero">
                <p className="small-title">About BlockFund AI</p>
                <h1>Blockchain-Based Crowdfunding with AI Campaign Evaluation</h1>
                <p>
                    BlockFund AI is a secure crowdfunding platform that combines blockchain
                    transparency with artificial intelligence to improve donor trust and
                    campaign credibility.
                </p>
            </div>

            <div className="about-grid">
                <div className="about-card">
                    <h2>Problem</h2>
                    <p>
                        Traditional crowdfunding platforms face issues such as fake campaigns,
                        limited transparency, and difficulty in verifying fund usage.
                    </p>
                </div>

                <div className="about-card">
                    <h2>Solution</h2>
                    <p>
                        Our system evaluates campaigns using AI trust scoring and records
                        donation transactions on blockchain for transparency.
                    </p>
                </div>

                <div className="about-card">
                    <h2>AI Module</h2>
                    <p>
                        The AI layer analyzes campaign goal, description, duration, category,
                        and supporting details to generate a trust score.
                    </p>
                </div>

                <div className="about-card">
                    <h2>Blockchain Module</h2>
                    <p>
                        Smart contracts store donation records securely and make transactions
                        verifiable through Ethereum testnet.
                    </p>
                </div>
            </div>

            <div className="tech-section">
                <h2>Technology Stack</h2>

                <div className="tech-grid">
                    <span>React.js</span>
                    <span>Node.js</span>
                    <span>MongoDB</span>
                    <span>Flask AI API</span>
                    <span>Solidity</span>
                    <span>Ethereum</span>
                    <span>MetaMask</span>
                    <span>Smart Contracts</span>
                </div>
            </div>
        </div>
    );
}

export default About;