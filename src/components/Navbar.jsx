import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
    const navigate = useNavigate();

    const [account, setAccount] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username") || "User";

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

    const logout = () => {
        localStorage.clear();
        navigate("/");
        window.location.reload();
    };

    return (
        <nav className="navbar">
            <Link to={isLoggedIn ? role === "admin" ? "/admin-dashboard" : "/home" : "/"} className="logo">
                <span>BF</span>
                <div>
                    <h2>BlockFund AI</h2>
                    <p>Secure Crowdfunding</p>
                </div>
            </Link>

            <div className="nav-links">
                {!isLoggedIn && (
                    <>
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/about">About</NavLink>
                        <NavLink to="/contact">Contact</NavLink>
                        <NavLink to="/login">Login</NavLink>
                        <NavLink to="/register">Register</NavLink>
                    </>
                )}

                {isLoggedIn && role === "user" && (
                    <>
                        <NavLink to="/home">Dashboard</NavLink>
                        <NavLink to="/campaigns">Campaigns</NavLink>
                        <NavLink to="/create">Create</NavLink>
                        <NavLink to="/about">About</NavLink>
                        <NavLink to="/contact">Contact</NavLink>
                    </>
                )}

                {isLoggedIn && role === "admin" && (
                    <>
                        <NavLink to="/admin-dashboard">Admin Dashboard</NavLink>
                        <NavLink to="/campaigns">Campaigns</NavLink>
                        <NavLink to="/about">About</NavLink>
                        <NavLink to="/contact">Contact</NavLink>
                    </>
                )}

                {isLoggedIn && (
                    <>
                        <div className="notification-box">
                            <button
                                className="notification-btn"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                🔔 <span>3</span>
                            </button>

                            {showNotifications && (
                                <div className="dropdown notification-dropdown">
                                    <p>✅ Campaign approved</p>
                                    <p>💰 New donation received</p>
                                    <p>🤖 AI review completed</p>
                                </div>
                            )}
                        </div>

                        <button onClick={connectWallet} className="wallet-btn">
                            {account ? `🟢 ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
                        </button>

                        <div className="user-box">
                            <button className="user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                                👤 {username} ▼
                            </button>

                            {showUserMenu && (
                                <div className="dropdown user-dropdown">
                                    <Link to="/profile">My Profile</Link>
                                    <button onClick={logout}>Logout</button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;