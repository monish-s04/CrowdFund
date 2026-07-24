import {
    Link,
    NavLink,
    useNavigate,
} from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import {
    clearAuthData,
    isAuthenticated,
} from "../utils/auth";

import NotificationBell from "./NotificationBell";


function Navbar() {
    const navigate = useNavigate();
    const userMenuRef = useRef(null);

    const [account, setAccount] = useState("");
    const [showUserMenu, setShowUserMenu] =
        useState(false);

    const isLoggedIn = isAuthenticated();

    const role =
        sessionStorage.getItem("role");

    const username =
        sessionStorage.getItem("username") ||
        "User";

    useEffect(() => {
        const checkConnectedWallet = async () => {
            if (!window.ethereum) {
                return;
            }

            try {
                const accounts =
                    await window.ethereum.request({
                        method: "eth_accounts",
                    });

                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                }
            } catch (error) {
                console.error(
                    "Wallet connection check failed:",
                    error
                );
            }
        };

        checkConnectedWallet();
    }, []);

    useEffect(() => {
        if (!window.ethereum) {
            return;
        }

        const handleAccountsChanged = (accounts) => {
            if (accounts.length > 0) {
                setAccount(accounts[0]);
            } else {
                setAccount("");
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

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(
                    event.target
                )
            ) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert(
                "Please install MetaMask first."
            );

            return;
        }

        try {
            const accounts =
                await window.ethereum.request({
                    method: "eth_requestAccounts",
                });

            if (accounts.length > 0) {
                setAccount(accounts[0]);
            }
        } catch (error) {
            console.error(
                "MetaMask connection failed:",
                error
            );

            if (error.code === 4001) {
                alert(
                    "MetaMask connection was cancelled."
                );
            } else {
                alert(
                    error.message ||
                    "Unable to connect MetaMask"
                );
            }
        }
    };

    const logout = () => {
        clearAuthData();
        navigate("/");
        window.location.reload();
    };

    const logoPath = isLoggedIn
        ? role === "admin"
            ? "/admin-dashboard"
            : "/home"
        : "/";

    return (
        <nav className="navbar">
            <Link
                to={logoPath}
                className="logo"
            >
                <span>BF</span>

                <div>
                    <h2>BlockFund AI</h2>
                    <p>Secure Crowdfunding</p>
                </div>
            </Link>

            <div className="nav-links">
                {!isLoggedIn && (
                    <>
                        <NavLink to="/">
                            Home
                        </NavLink>

                        <NavLink to="/about">
                            About
                        </NavLink>

                        <NavLink to="/contact">
                            Contact
                        </NavLink>

                        <NavLink to="/login">
                            Login
                        </NavLink>

                        <NavLink to="/register">
                            Register
                        </NavLink>
                    </>
                )}

                {isLoggedIn &&
                    role === "user" && (
                        <>
                            <NavLink to="/home">
                                Dashboard
                            </NavLink>

                            <NavLink to="/campaigns">
                                Campaigns
                            </NavLink>

                            <NavLink to="/create">
                                Create
                            </NavLink>

                            <NavLink to="/about">
                                About
                            </NavLink>

                            <NavLink to="/contact">
                                Contact
                            </NavLink>
                        </>
                    )}

                {isLoggedIn &&
                    role === "admin" && (
                        <>
                            <NavLink to="/admin-dashboard">
                                Admin Dashboard
                            </NavLink>

                            <NavLink to="/campaigns">
                                Campaigns
                            </NavLink>

                            <NavLink to="/about">
                                About
                            </NavLink>

                            <NavLink to="/contact">
                                Contact
                            </NavLink>
                        </>
                    )}

                {isLoggedIn && (
                    <>
                        <NotificationBell />

                        <button
                            type="button"
                            onClick={connectWallet}
                            className="wallet-btn"
                        >
                            {account
                                ? `🟢 ${account.slice(
                                    0,
                                    6
                                )}...${account.slice(
                                    -4
                                )}`
                                : "Connect Wallet"}
                        </button>

                        <div
                            className="user-box"
                            ref={userMenuRef}
                        >
                            <button
                                type="button"
                                className="user-btn"
                                onClick={() =>
                                    setShowUserMenu(
                                        (current) =>
                                            !current
                                    )
                                }
                            >
                                👤 {username} ▼
                            </button>

                            {showUserMenu && (
                                <div className="dropdown user-dropdown">
                                    <Link
                                        to="/profile"
                                        onClick={() =>
                                            setShowUserMenu(
                                                false
                                            )
                                        }
                                    >
                                        My Profile
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={logout}
                                    >
                                        Logout
                                    </button>
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