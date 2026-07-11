export function clearAuthData() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("redirectAfterLogin");
}

export function getTokenPayload() {
    const token = sessionStorage.getItem("token");

    if (!token) {
        return null;
    }

    try {
        const payloadPart = token.split(".")[1];

        if (!payloadPart) {
            clearAuthData();
            return null;
        }

        const normalizedPayload = payloadPart
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const paddedPayload =
            normalizedPayload +
            "=".repeat((4 - (normalizedPayload.length % 4)) % 4);

        const decodedPayload = decodeURIComponent(
            window
                .atob(paddedPayload)
                .split("")
                .map(
                    (character) =>
                        `%${character
                            .charCodeAt(0)
                            .toString(16)
                            .padStart(2, "0")}`
                )
                .join("")
        );

        return JSON.parse(decodedPayload);
    } catch (error) {
        console.error("Invalid JWT token:", error);
        clearAuthData();
        return null;
    }
}

export function isAuthenticated() {
    const token = sessionStorage.getItem("token");

    if (!token) {
        clearAuthData();
        return false;
    }

    const payload = getTokenPayload();

    if (!payload) {
        clearAuthData();
        return false;
    }

    if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp <= currentTime) {
            clearAuthData();
            return false;
        }
    }

    return true;
}