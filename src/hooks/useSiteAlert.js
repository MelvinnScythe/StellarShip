import { useCallback, useEffect, useState } from 'react';

const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const readError = async (response) => {
  const data = await response.json().catch(() => ({}));
  return data.msg || data.error || `Request failed with status ${response.status}`;
};

export const useSiteAlert = (isEnabled = true) => {
  const [siteAlert, setSiteAlert] = useState(null);
  const [isPostingAlert, setIsPostingAlert] = useState(false);

  const token = localStorage.getItem('antigravity_token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadSiteAlert = useCallback(async () => {
    if (!isEnabled || !token) {
      setSiteAlert(null);
      return;
    }

    try {
      const response = await fetch(`${API_ROOT}/api/messages/alert`, { headers: authHeaders });
      if (!response.ok) return;
      const data = await response.json();
      setSiteAlert(data || null);
    } catch {
      /* ignore */
    }
  }, [isEnabled, token]);

  useEffect(() => {
    const timer = window.setTimeout(loadSiteAlert, 0);
    const interval = window.setInterval(loadSiteAlert, 8000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [loadSiteAlert]);

  const postAlert = useCallback(async (body) => {
    const trimmed = body.trim();
    if (!trimmed || !token) return { ok: false, error: 'Alert cannot be empty' };

    setIsPostingAlert(true);
    try {
      const response = await fetch(`${API_ROOT}/api/messages/alert`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: trimmed })
      });

      if (!response.ok) {
        return { ok: false, error: await readError(response) };
      }

      const alert = await response.json();
      setSiteAlert(alert);
      return { ok: true, alert };
    } catch (err) {
      return { ok: false, error: err.message || 'Failed to send alert' };
    } finally {
      setIsPostingAlert(false);
    }
  }, [authHeaders, token]);

  return { siteAlert, loadSiteAlert, postAlert, isPostingAlert };
};
