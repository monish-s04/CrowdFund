import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../css/notifications.css";


function NotificationBell() {
    const navigate = useNavigate();
    const notificationRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] =
        useState(false);
    const [loading, setLoading] = useState(false);

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    const getNotificationIcon = (type) => {
        if (type === "approved") {
            return "✅";
        }

        if (type === "rejected") {
            return "❌";
        }

        if (type === "donation") {
            return "💰";
        }

        if (type === "success") {
            return "🎉";
        }

        return "🔔";
    };

    const formatDate = (value) => {
        if (!value) {
            return "";
        }

        const notificationDate = new Date(value);
        const currentDate = new Date();

        const difference =
            currentDate.getTime() -
            notificationDate.getTime();

        const minutes = Math.floor(
            difference / (1000 * 60)
        );

        const hours = Math.floor(
            difference / (1000 * 60 * 60)
        );

        const days = Math.floor(
            difference / (1000 * 60 * 60 * 24)
        );

        if (minutes < 1) {
            return "Just now";
        }

        if (minutes < 60) {
            return `${minutes} minute${minutes === 1 ? "" : "s"
                } ago`;
        }

        if (hours < 24) {
            return `${hours} hour${hours === 1 ? "" : "s"
                } ago`;
        }

        if (days < 7) {
            return `${days} day${days === 1 ? "" : "s"
                } ago`;
        }

        return notificationDate.toLocaleDateString(
            "en-IN"
        );
    };

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await API.get(
                "/notifications/"
            );

            setNotifications(response.data || []);
        } catch (error) {
            console.error(
                "Unable to load notifications:",
                error
            );
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        const intervalId = window.setInterval(
            fetchNotifications,
            30000
        );

        return () => {
            window.clearInterval(intervalId);
        };
    }, [fetchNotifications]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {
                setShowNotifications(false);
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

    const toggleNotifications = async () => {
        const nextState = !showNotifications;

        setShowNotifications(nextState);

        if (nextState) {
            setLoading(true);
            await fetchNotifications();
            setLoading(false);
        }
    };

    const markAsRead = async (notification) => {
        try {
            if (!notification.is_read) {
                await API.put(
                    `/notifications/${notification.id}/read`
                );

                setNotifications(
                    (currentNotifications) =>
                        currentNotifications.map(
                            (item) =>
                                item.id ===
                                    notification.id
                                    ? {
                                        ...item,
                                        is_read: true,
                                    }
                                    : item
                        )
                );
            }

            if (notification.related_campaign_id) {
                setShowNotifications(false);

                navigate(
                    `/campaigns/${notification.related_campaign_id}`
                );
            }
        } catch (error) {
            console.error(
                "Unable to mark notification as read:",
                error
            );
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.put("/notifications/read-all");

            setNotifications(
                (currentNotifications) =>
                    currentNotifications.map(
                        (notification) => ({
                            ...notification,
                            is_read: true,
                        })
                    )
            );
        } catch (error) {
            console.error(
                "Unable to mark notifications as read:",
                error
            );
        }
    };

    const deleteNotification = async (
        event,
        notificationId
    ) => {
        event.stopPropagation();

        try {
            await API.delete(
                `/notifications/${notificationId}`
            );

            setNotifications(
                (currentNotifications) =>
                    currentNotifications.filter(
                        (notification) =>
                            notification.id !==
                            notificationId
                    )
            );
        } catch (error) {
            console.error(
                "Unable to delete notification:",
                error
            );
        }
    };

    const clearAllNotifications = async () => {
        const confirmed = window.confirm(
            "Clear all notifications?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await API.delete("/notifications/");

            setNotifications([]);
        } catch (error) {
            console.error(
                "Unable to clear notifications:",
                error
            );
        }
    };

    return (
        <div
            className="notification-box"
            ref={notificationRef}
        >
            <button
                type="button"
                className="notification-btn"
                onClick={toggleNotifications}
                aria-label="Notifications"
            >
                <span className="notification-bell-icon">
                    🔔
                </span>

                {unreadCount > 0 && (
                    <span className="notification-count">
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <div>
                            <h3>Notifications</h3>

                            <p>
                                {unreadCount} unread
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="notification-empty">
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <span>🔔</span>

                                <h4>No notifications</h4>

                                <p>
                                    Your updates will appear
                                    here.
                                </p>
                            </div>
                        ) : (
                            notifications.map(
                                (notification) => (
                                    <button
                                        type="button"
                                        key={
                                            notification.id
                                        }
                                        className={`notification-item ${notification.is_read
                                                ? "notification-read"
                                                : "notification-unread"
                                            }`}
                                        onClick={() =>
                                            markAsRead(
                                                notification
                                            )
                                        }
                                    >
                                        <span className="notification-type-icon">
                                            {getNotificationIcon(
                                                notification.notification_type
                                            )}
                                        </span>

                                        <span className="notification-content">
                                            <strong>
                                                {
                                                    notification.title
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    notification.message
                                                }
                                            </span>

                                            <small>
                                                {formatDate(
                                                    notification.created_at
                                                )}
                                            </small>
                                        </span>

                                        <span
                                            role="button"
                                            tabIndex={0}
                                            className="notification-delete"
                                            onClick={(event) =>
                                                deleteNotification(
                                                    event,
                                                    notification.id
                                                )
                                            }
                                            onKeyDown={(
                                                event
                                            ) => {
                                                if (
                                                    event.key ===
                                                    "Enter" ||
                                                    event.key ===
                                                    " "
                                                ) {
                                                    deleteNotification(
                                                        event,
                                                        notification.id
                                                    );
                                                }
                                            }}
                                        >
                                            ×
                                        </span>
                                    </button>
                                )
                            )
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="notification-footer">
                            <button
                                type="button"
                                onClick={
                                    clearAllNotifications
                                }
                            >
                                Clear all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;