import { NavLink, Link } from "react-router-dom";
import { useState } from "react";

function Navbar() {
    const [account, setAccount] = useState("");

    const connectWallet = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            setAccount(accounts[0]);
        } else {
            alert("Please install MetaMask");
        }
    };

    return (
        <nav className="navbar">
            <Link to="/" className="logo">
                <span>BF</span>
                <div>
                    <h2>BlockFund AI</h2>
                    <p>Secure Crowdfunding</p>
                </div>
            </Link>

            <div className="nav-links">
                <NavLink to="/">Landing</NavLink>
                <NavLink to="/home">Dashboard</NavLink>
                <NavLink to="/campaigns">Campaigns</NavLink>
                <NavLink to="/create">Create</NavLink>
                <NavLink to="/profile">Profile</NavLink>
                <NavLink to="/about">About</NavLink>
                <NavLink to="/contact">Contact</NavLink>

                <button onClick={connectWallet} className="wallet-btn">
                    {account ? `🟢 ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
                </button>
            </div>
        </nav>
    );
}

export default Navbar;