import { useCallback, useEffect, useState } from 'react';

const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useFriendRequests = (isEnabled = true, pollMs = 10000) => {
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('antigravity_token');
    if (!token || !isEnabled) {
      setPendingCount(0);
      return;
    }

    try {
      const response = await fetch(`${API_ROOT}/api/friends/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) return;
      const data = await response.json();
      setPendingCount(data.pendingCount || data.incoming?.length || 0);
    } catch {
      /* ignore */
    }
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      setPendingCount(0);
      return undefined;
    }

    const timer = window.setTimeout(refresh, 0);
    const interval = window.setInterval(refresh, pollMs);
    const onChanged = () => refresh();
    window.addEventListener('friends-changed', onChanged);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
      window.removeEventListener('friends-changed', onChanged);
    };
  }, [isEnabled, pollMs, refresh]);

  return { pendingCount, refresh };
};
