import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  Loader2,
  MessageCircle,
  Search,
  UserMinus,
  UserPlus,
  Users,
  X
} from 'lucide-react';

const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const readError = async (response) => {
  const data = await response.json().catch(() => ({}));
  return data.msg || data.error || `Request failed with status ${response.status}`;
};

const getInitial = (user) => {
  const source = user?.nickname || user?.name || user?.email || '?';
  return source.charAt(0).toUpperCase();
};

const notifyFriendsChanged = () => {
  window.dispatchEvent(new CustomEvent('friends-changed'));
};

const Friends = ({ currentUser }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addQuery, setAddQuery] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const token = localStorage.getItem('antigravity_token');
  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  const loadFriends = useCallback(async () => {
    if (!token) return;
    const response = await fetch(`${API_ROOT}/api/friends`, { headers: authHeaders });
    if (!response.ok) throw new Error(await readError(response));
    const data = await response.json();
    setFriends(Array.isArray(data) ? data : []);
  }, [authHeaders, token]);

  const loadRequests = useCallback(async () => {
    if (!token) return;
    const response = await fetch(`${API_ROOT}/api/friends/requests`, { headers: authHeaders });
    if (!response.ok) throw new Error(await readError(response));
    const data = await response.json();
    setIncoming(Array.isArray(data.incoming) ? data.incoming : []);
    setOutgoing(Array.isArray(data.outgoing) ? data.outgoing : []);
  }, [authHeaders, token]);

  const refreshAll = useCallback(async () => {
    if (!token) {
      setError('Sign in to use friends.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await Promise.all([loadFriends(), loadRequests()]);
    } catch (err) {
      setError(err.message || 'Failed to load friends.');
    } finally {
      setIsLoading(false);
    }
  }, [loadFriends, loadRequests, token]);

  useEffect(() => {
    const timer = window.setTimeout(refreshAll, 0);
    return () => window.clearTimeout(timer);
  }, [refreshAll]);

  useEffect(() => {
    const query = searchTerm.trim();
    if (query.length < 2) {
      setSearchResults([]);
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `${API_ROOT}/api/friends/search?q=${encodeURIComponent(query)}`,
          { headers: authHeaders }
        );
        if (!response.ok) throw new Error(await readError(response));
        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Search failed.');
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [authHeaders, searchTerm]);

  const runAction = async (action) => {
    setError('');
    setStatus('');
    try {
      await action();
      await refreshAll();
      notifyFriendsChanged();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    }
  };

  const acceptRequest = (userId) => runAction(async () => {
    const response = await fetch(`${API_ROOT}/api/friends/accept/${userId}`, {
      method: 'POST',
      headers: authHeaders
    });
    if (!response.ok) throw new Error(await readError(response));
    setStatus('Friend request accepted.');
  });

  const declineRequest = (userId) => runAction(async () => {
    const response = await fetch(`${API_ROOT}/api/friends/decline/${userId}`, {
      method: 'POST',
      headers: authHeaders
    });
    if (!response.ok) throw new Error(await readError(response));
    setStatus('Request declined.');
  });

  const removeFriend = (userId) => runAction(async () => {
    const response = await fetch(`${API_ROOT}/api/friends/${userId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    if (!response.ok) throw new Error(await readError(response));
    setStatus('Friend removed.');
  });

  const sendRequest = async (payload) => {
    setIsAdding(true);
    setError('');
    setStatus('');
    try {
      const response = await fetch(`${API_ROOT}/api/friends/request`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.msg || await readError(response));
      setStatus(data.msg || 'Request sent.');
      setAddQuery('');
      await refreshAll();
      notifyFriendsChanged();
      if (tab === 'add') setSearchTerm('');
    } catch (err) {
      setError(err.message || 'Failed to send request.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddByQuery = (event) => {
    event.preventDefault();
    const query = addQuery.trim();
    if (!query) return;
    sendRequest({ query });
  };

  const relationAction = (user) => {
    if (user.relation === 'accepted' || user.relation === 'friends') {
      return (
        <span className="friends-pill is-friends">Friends</span>
      );
    }
    if (user.relation === 'pending_outgoing') {
      return (
        <button type="button" className="friends-action is-muted" onClick={() => removeFriend(user.id)}>
          Cancel
        </button>
      );
    }
    if (user.relation === 'pending_incoming') {
      return (
        <div className="friends-action-row">
          <button type="button" className="friends-action is-accept" onClick={() => acceptRequest(user.id)}>
            <Check size={16} /> Accept
          </button>
          <button type="button" className="friends-action is-decline" onClick={() => declineRequest(user.id)}>
            <X size={16} />
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        className="friends-action is-add"
        disabled={isAdding}
        onClick={() => sendRequest({ userId: user.id })}
      >
        <UserPlus size={16} /> Add
      </button>
    );
  };

  const pendingTotal = incoming.length;

  return (
    <main className="friends-page messages-page">
      <div className="container">
        <div className="messages-header">
          <div>
            <div className="messages-eyebrow">
              <Users size={16} />
              Social
            </div>
            <h1>Friends</h1>
          </div>
        </div>

        <div className="friends-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={tab === 'friends' ? 'is-active' : ''}
            onClick={() => setTab('friends')}
          >
            My friends
            {friends.length > 0 && <span className="friends-tab-count">{friends.length}</span>}
          </button>
          <button
            type="button"
            role="tab"
            className={tab === 'requests' ? 'is-active' : ''}
            onClick={() => setTab('requests')}
          >
            Requests
            {pendingTotal > 0 && <span className="friends-tab-count is-alert">{pendingTotal}</span>}
          </button>
          <button
            type="button"
            role="tab"
            className={tab === 'add' ? 'is-active' : ''}
            onClick={() => setTab('add')}
          >
            Add friend
          </button>
        </div>

        {(error || status) && (
          <div className={`messages-notice ${error ? 'is-error' : 'is-success'}`}>
            {error ? <AlertCircle size={18} /> : <Check size={18} />}
            <span>{error || status}</span>
          </div>
        )}

        {isLoading && (
          <div className="friends-loading">
            <Loader2 size={22} className="spin" />
            <span>Loading…</span>
          </div>
        )}

        {!isLoading && tab === 'friends' && (
          <section className="friends-panel">
            {friends.length === 0 ? (
              <div className="messages-empty">
                <Users size={32} />
                <span>No friends yet. Search for classmates in Add friend.</span>
              </div>
            ) : (
              <ul className="friends-list">
                {friends.map((user) => (
                  <li key={user.id} className="friends-card">
                    <span className="messages-avatar">{getInitial(user)}</span>
                    <div className="friends-card-copy">
                      <strong>{user.name}</strong>
                      <span>@{user.nickname} · Class {user.selectedClass}</span>
                    </div>
                    <div className="friends-card-actions">
                      <button
                        type="button"
                        className="friends-action is-message"
                        onClick={() => navigate('/messages', { state: { openUserId: user.id } })}
                        title="Message"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        type="button"
                        className="friends-action is-remove"
                        onClick={() => removeFriend(user.id)}
                        title="Remove friend"
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {!isLoading && tab === 'requests' && (
          <section className="friends-panel">
            <h2 className="friends-section-title">Incoming</h2>
            {incoming.length === 0 ? (
              <p className="friends-muted">No incoming requests.</p>
            ) : (
              <ul className="friends-list">
                {incoming.map((item) => (
                  <li key={item.id} className="friends-card">
                    <span className="messages-avatar">{getInitial(item.user)}</span>
                    <div className="friends-card-copy">
                      <strong>{item.user.name}</strong>
                      <span>@{item.user.nickname}</span>
                    </div>
                    <div className="friends-action-row">
                      <button type="button" className="friends-action is-accept" onClick={() => acceptRequest(item.user.id)}>
                        <Check size={16} /> Accept
                      </button>
                      <button type="button" className="friends-action is-decline" onClick={() => declineRequest(item.user.id)}>
                        <X size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <h2 className="friends-section-title">Sent</h2>
            {outgoing.length === 0 ? (
              <p className="friends-muted">No pending sent requests.</p>
            ) : (
              <ul className="friends-list">
                {outgoing.map((item) => (
                  <li key={item.id} className="friends-card">
                    <span className="messages-avatar">{getInitial(item.user)}</span>
                    <div className="friends-card-copy">
                      <strong>{item.user.name}</strong>
                      <span>Waiting for response</span>
                    </div>
                    <button type="button" className="friends-action is-muted" onClick={() => removeFriend(item.user.id)}>
                      Cancel
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {!isLoading && tab === 'add' && (
          <section className="friends-panel">
            <form className="friends-add-form" onSubmit={handleAddByQuery}>
              <UserPlus size={18} />
              <input
                type="text"
                value={addQuery}
                onChange={(event) => setAddQuery(event.target.value)}
                placeholder="Nickname, name, or email"
              />
              <button type="submit" disabled={isAdding || !addQuery.trim()}>
                {isAdding ? <Loader2 size={16} className="spin" /> : 'Send request'}
              </button>
            </form>

            <label className="messages-search friends-search">
              <Search size={18} />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search people (min 2 characters)"
              />
            </label>

            {isSearching && (
              <div className="friends-loading is-compact">
                <Loader2 size={18} className="spin" />
              </div>
            )}

            {!isSearching && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
              <p className="friends-muted">No users found.</p>
            )}

            <ul className="friends-list">
              {searchResults.map((user) => (
                <li key={user.id} className="friends-card">
                  <span className="messages-avatar">{getInitial(user)}</span>
                  <div className="friends-card-copy">
                    <strong>{user.name}</strong>
                    <span>@{user.nickname} · {user.email}</span>
                  </div>
                  {relationAction(user)}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
};

export default Friends;
