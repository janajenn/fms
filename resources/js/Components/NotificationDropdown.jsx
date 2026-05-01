import { useState, useEffect, useRef } from 'react';
import { Bell, Package, Truck, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function NotificationDropdown({ notifications, unreadCount, userType = 'customer' }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_order':
                return <ShoppingBag className="w-5 h-5 text-emerald-500" />;
            case 'order_status_updated':
                return <Package className="w-5 h-5 text-blue-500" />;
            default:
                return <Bell className="w-5 h-5 text-stone-500" />;
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { icon: <Package className="w-3 h-3" />, text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
            processing: { icon: <Package className="w-3 h-3" />, text: 'Processing', color: 'bg-blue-100 text-blue-800' },
            shipped: { icon: <Truck className="w-3 h-3" />, text: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
            completed: { icon: <CheckCircle className="w-3 h-3" />, text: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
            cancelled: { icon: <XCircle className="w-3 h-3" />, text: 'Cancelled', color: 'bg-red-100 text-red-800' },
        };
        return badges[status] || badges.pending;
    };

    const handleNotificationClick = (notificationId, actionUrl) => {
        // First, mark as read
        router.post('/notifications/mark-as-read', { notification_id: notificationId }, {
            preserveScroll: true,
            onSuccess: () => {
                // Then redirect to the action URL
                if (actionUrl) {
                    router.visit(actionUrl);
                }
            },
        });
    };

    const handleMarkAllAsRead = () => {
        router.post('/notifications/mark-all-read', {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Close the dropdown after marking all as read
                setIsOpen(false);
            },
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-stone-400 hover:text-white transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-stone-200 z-50 overflow-hidden">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-white/80 hover:text-white transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-stone-100">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                                <p className="text-stone-500 text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const isUnread = !notification.read_at;
                                const statusBadge = notification.data.new_status ? getStatusBadge(notification.data.new_status) : null;

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id, notification.data.action_url)}
                                        className={`p-4 hover:bg-stone-50 cursor-pointer transition-colors ${isUnread ? 'bg-amber-50' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0">
                                                {getNotificationIcon(notification.data.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-stone-800">{notification.data.message}</p>
                                                {statusBadge && (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${statusBadge.color}`}>
                                                        {statusBadge.icon}
                                                        {statusBadge.text}
                                                    </span>
                                                )}
                                                <p className="text-xs text-stone-400 mt-1">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {isUnread && (
                                                <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-2"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
