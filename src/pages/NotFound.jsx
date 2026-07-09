import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>404</h1>
                <p>Page not found.</p>

                <Link to="/">
                    <button className="login-btn">
                        Go Home
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default NotFound;