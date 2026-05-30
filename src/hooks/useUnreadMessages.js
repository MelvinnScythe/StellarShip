import { useCallback, useEffect, useState } from 'react';

const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useUnreadMessages = (isEnabled = true, pollMs = 5000) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    const token = localStorage.getItem('antigravity_token');
    if (!token || !isEnabled) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch(`${API_ROOT}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) return;

      const conversations = await response.json();
      const total = Array.isArray(conversations)
        ? conversations.reduce((sum, item) => sum + (item.unreadCount || 0), 0)
        : 0;

      setUnreadCount(total);
    } catch {
      /* ignore polling errors */
    }
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      setUnreadCount(0);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      refreshUnread();
    }, 0);

    const interval = window.setInterval(refreshUnread, pollMs);
    const onMailboxChange = () => refreshUnread();
    window.addEventListener('mailbox-changed', onMailboxChange);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
      window.removeEventListener('mailbox-changed', onMailboxChange);
    };
  }, [isEnabled, pollMs, refreshUnread]);

  return { unreadCount, refreshUnread };
};
