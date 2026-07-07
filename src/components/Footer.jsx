import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-grid">
                <div>
                    <h2>BlockFund AI</h2>
                    <p>
                        Blockchain-Based Crowdfunding Platform with AI-Powered Campaign
                        Evaluation.
                    </p>
                </div>

                <div>
                    <h3>Quick Links</h3>
                    <Link to="/home">Dashboard</Link>
                    <Link to="/campaigns">Campaigns</Link>
                    <Link to="/create">Create Campaign</Link>
                    <Link to="/about">About</Link>
                </div>

                <div>
                    <h3>Technologies</h3>
                    <p>React.js</p>
                    <p>Node.js</p>
                    <p>MongoDB</p>
                    <p>Ethereum</p>
                </div>

                <div>
                    <h3>Contact</h3>
                    <p>Bangalore, India</p>
                    <p>support@blockfundai.com</p>
                    <p>+91 9876543210</p>
                </div>
            </div>

            <p className="footer-copy">© 2026 BlockFund AI. MCA Final Year Project.</p>
        </footer>
    );
}

export default Footer;