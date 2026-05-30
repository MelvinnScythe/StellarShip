import React, { useCallback, useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const readError = async (response) => {
  const data = await response.json().catch(() => ({}));
  return data.msg || data.error || `Request failed with status ${response.status}`;
};

const SiteAlertBar = ({ isEnabled, onVisibilityChange }) => {
  const [siteAlert, setSiteAlert] = useState(null);

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
    const onChanged = () => loadSiteAlert();
    window.addEventListener('site-alert-changed', onChanged);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
      window.removeEventListener('site-alert-changed', onChanged);
    };
  }, [loadSiteAlert]);

  useEffect(() => {
    onVisibilityChange?.(Boolean(siteAlert));
  }, [onVisibilityChange, siteAlert]);

  const handleClearAlert = async () => {
    try {
      const response = await fetch(`${API_ROOT}/api/messages/alert`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!response.ok) throw new Error(await readError(response));
      setSiteAlert(null);
      window.dispatchEvent(new CustomEvent('site-alert-changed'));
    } catch {
      /* ignore */
    }
  };

  if (!isEnabled || !siteAlert) return null;

  return (
    <div className="site-alert-bar" role="region" aria-live="polite" aria-label="Community alert">
      <div className="site-alert-bar-inner container">
        <Bell size={14} aria-hidden="true" />
        <p>
          <strong>{siteAlert.author?.nickname || siteAlert.author?.name}:</strong>
          {' '}
          {siteAlert.body}
        </p>
        <button
          type="button"
          className="site-alert-dismiss"
          onClick={handleClearAlert}
          title="Dismiss alert"
          aria-label="Dismiss alert"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default SiteAlertBar;
