import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Inbox, Loader2, Mail, Megaphone, RefreshCw, Search, Send, UserCircle, Users } from 'lucide-react';
import { useSiteAlert } from '../hooks/useSiteAlert';

const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const readError = async (response) => {
  const data = await response.json().catch(() => ({}));
  return data.msg || data.error || `Request failed with status ${response.status}`;
};

const formatMessageTime = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const getInitial = (user) => {
  const source = user?.nickname || user?.name || user?.email || '?';
  return source.charAt(0).toUpperCase();
};

const sameRecipient = (typedRecipient, user) => {
  const value = typedRecipient.trim().toLowerCase();
  if (!value || !user) return false;
  return [user.nickname, user.name, user.email]
    .filter(Boolean)
    .some((option) => option.toLowerCase() === value);
};

const mergeMailbox = (users, conversations) => {
  const byUser = new Map(conversations.map((conversation) => [conversation.user.id, conversation]));

  return users
    .map((user) => {
      const conversation = byUser.get(user.id);
      return {
        ...user,
        lastMessage: conversation?.lastMessage || null,
        unreadCount: conversation?.unreadCount || 0
      };
    })
    .sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      return a.name.localeCompare(b.name);
    });
};

const Messages = ({ currentUser, onUnreadChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [peopleFilter, setPeopleFilter] = useState('friends');
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [thread, setThread] = useState([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isLoadingMailbox, setIsLoadingMailbox] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [alertDraft, setAlertDraft] = useState('');
  const [showAlertComposer, setShowAlertComposer] = useState(false);
  const { postAlert, isPostingAlert } = useSiteAlert(Boolean(currentUser));
  const knownThreadRef = useRef({ userId: '', ids: new Set() });
  const threadScrollRef = useRef(null);

  const token = localStorage.getItem('antigravity_token');

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  const directorySource = peopleFilter === 'friends' ? friends : users;
  const mailboxUsers = useMemo(
    () => mergeMailbox(directorySource, conversations),
    [directorySource, conversations]
  );
  const activeUserId = selectedUserId || mailboxUsers[0]?.id || '';

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return mailboxUsers;

    return mailboxUsers.filter((user) => (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.nickname.toLowerCase().includes(query)
    ));
  }, [mailboxUsers, searchTerm]);

  const selectedUser = useMemo(() => (
    mailboxUsers.find((user) => user.id === activeUserId) || null
  ), [activeUserId, mailboxUsers]);

  const selectedRecipientLabel = selectedUser
    ? selectedUser.nickname || selectedUser.name || selectedUser.email
    : '';
  const recipientValue = recipientInput || selectedRecipientLabel;

  const loadMailbox = useCallback(async () => {
    if (!token) {
      setError('You need to sign in again to use messages.');
      return;
    }

    setIsLoadingMailbox(true);
    setError('');

    try {
      const [usersResponse, conversationsResponse] = await Promise.all([
        fetch(`${API_ROOT}/api/messages/users`, { headers: authHeaders }),
        fetch(`${API_ROOT}/api/messages/conversations`, { headers: authHeaders })
      ]);

      if (!usersResponse.ok) throw new Error(await readError(usersResponse));
      if (!conversationsResponse.ok) throw new Error(await readError(conversationsResponse));

      const [directory, summaries] = await Promise.all([
        usersResponse.json(),
        conversationsResponse.json()
      ]);

      setUsers(Array.isArray(directory) ? directory : []);
      setConversations(Array.isArray(summaries) ? summaries : []);
      onUnreadChange?.();
      window.dispatchEvent(new CustomEvent('mailbox-changed'));
    } catch (err) {
      setError(err.message || 'Failed to load messages.');
    } finally {
      setIsLoadingMailbox(false);
    }
  }, [authHeaders, onUnreadChange, token]);

  const loadFriends = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_ROOT}/api/friends`, { headers: authHeaders });
      if (!response.ok) return;
      const data = await response.json();
      setFriends(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    }
  }, [authHeaders, token]);

  const loadThread = useCallback(async (userId) => {
    if (!userId || !token) {
      setThread([]);
      return;
    }

    setIsLoadingThread(true);
    setError('');

    try {
      const response = await fetch(`${API_ROOT}/api/messages/thread/${userId}`, {
        headers: authHeaders
      });

      if (!response.ok) throw new Error(await readError(response));

      const data = await response.json();
      const messages = Array.isArray(data.messages) ? data.messages : [];
      const previousThread = knownThreadRef.current;
      const isSameThread = previousThread.userId === userId;
      const hasNewIncoming = isSameThread
        ? messages.some((message) => !message.isMine && !previousThread.ids.has(message.id))
        : false;

      knownThreadRef.current = {
        userId,
        ids: new Set(messages.map((message) => message.id))
      };

      setThread(messages);

      if (hasNewIncoming) {
        window.requestAnimationFrame(() => {
          threadScrollRef.current?.scrollTo({
            top: threadScrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        });
      }

      setConversations((current) => current.map((conversation) => (
        conversation.user.id === userId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )));
      onUnreadChange?.();
      window.dispatchEvent(new CustomEvent('mailbox-changed'));
    } catch (err) {
      setError(err.message || 'Failed to load this conversation.');
    } finally {
      setIsLoadingThread(false);
    }
  }, [authHeaders, onUnreadChange, token]);

  const refreshCurrentChat = useCallback(async () => {
    await Promise.all([
      loadMailbox(),
      loadThread(activeUserId)
    ]);
  }, [activeUserId, loadMailbox, loadThread]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadMailbox();
      loadFriends();
    }, 0);

    const onFriendsChanged = () => loadFriends();
    window.addEventListener('friends-changed', onFriendsChanged);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('friends-changed', onFriendsChanged);
    };
  }, [loadFriends, loadMailbox]);

  useEffect(() => {
    const openUserId = location.state?.openUserId;
    if (!openUserId) return;
    setSelectedUserId(openUserId);
    setPeopleFilter('friends');
    navigate('/messages', { replace: true, state: {} });
  }, [location.state?.openUserId, navigate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadThread(activeUserId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeUserId, loadThread]);

  useEffect(() => {
    if (!activeUserId) return undefined;

    const timer = window.setInterval(() => {
      loadThread(activeUserId);
      loadMailbox();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [activeUserId, loadMailbox, loadThread]);

  const handlePostAlert = async (event) => {
    event.preventDefault();
    const body = alertDraft.trim();
    if (!body) return;

    setError('');
    const result = await postAlert(body);
    if (!result.ok) {
      setError(result.error || 'Failed to send alert.');
      return;
    }

    setAlertDraft('');
    setShowAlertComposer(false);
    setStatus('Alert sent to everyone.');
    window.dispatchEvent(new CustomEvent('site-alert-changed'));
  };

  const handleSelectUser = (user) => {
    setSelectedUserId(user.id);
    setRecipientInput(user.nickname || user.name || user.email);
    setStatus('');
    setError('');
  };

  const handleSend = async (event) => {
    event.preventDefault();

    const body = draft.trim();
    const recipient = recipientValue.trim();

    if (!body) {
      setError('Write a message before sending.');
      return;
    }

    if (!recipient && !selectedUser) {
      setError('Choose a person or type a nickname.');
      return;
    }

    setIsSending(true);
    setError('');
    setStatus('');

    const shouldUseSelectedUser = selectedUser && sameRecipient(recipient, selectedUser);
    const payload = {
      body,
      recipientId: shouldUseSelectedUser ? selectedUser.id : undefined,
      recipientQuery: shouldUseSelectedUser ? undefined : recipient
    };

    try {
      const response = await fetch(`${API_ROOT}/api/messages`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(await readError(response));

      const message = await response.json();
      const otherUser = message.isMine ? message.recipient : message.sender;

      setUsers((current) => {
        if (current.some((user) => user.id === otherUser.id)) return current;
        return [...current, otherUser];
      });

      setSelectedUserId(otherUser.id);
      setRecipientInput(otherUser.nickname || otherUser.name || otherUser.email);
      setDraft('');
      setStatus('Message sent.');

      if (otherUser.id === activeUserId) {
        setThread((current) => [...current, message]);
      }

      await Promise.all([
        loadMailbox(),
        loadThread(otherUser.id)
      ]);
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="messages-page">
      <div className="container">
        <div className="messages-header">
          <div>
            <div className="messages-eyebrow">
              <Mail size={16} />
              Inbox
            </div>
            <h1>Messages</h1>
          </div>
          <div className="messages-header-actions">
            {showAlertComposer ? (
              <form className="messages-broadcast-form" onSubmit={handlePostAlert}>
                <Megaphone size={16} aria-hidden="true" />
                <input
                  type="text"
                  value={alertDraft}
                  onChange={(event) => setAlertDraft(event.target.value)}
                  placeholder="Broadcast alert to all users…"
                  maxLength={280}
                  autoFocus
                />
                <button type="submit" disabled={isPostingAlert || !alertDraft.trim()}>
                  {isPostingAlert ? <Loader2 size={16} className="spin" /> : 'Send'}
                </button>
                <button
                  type="button"
                  className="messages-broadcast-cancel"
                  onClick={() => {
                    setShowAlertComposer(false);
                    setAlertDraft('');
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="messages-icon-button"
                onClick={() => setShowAlertComposer(true)}
                title="Alert everyone"
                aria-label="Broadcast alert to all users"
              >
                <Megaphone size={18} />
              </button>
            )}
            <button
              type="button"
              className="messages-icon-button"
              onClick={refreshCurrentChat}
              title="Refresh messages"
              aria-label="Refresh messages"
              disabled={isLoadingMailbox || isLoadingThread}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {(error || status) && (
          <div className={`messages-notice ${error ? 'is-error' : 'is-success'}`}>
            {error ? <AlertCircle size={18} /> : <Inbox size={18} />}
            <span>{error || status}</span>
          </div>
        )}

        <div className="messages-layout">
          <aside className="messages-sidebar" aria-label="Signed-up people">
            <div className="messages-sidebar-top">
              <div>
                <h2>{peopleFilter === 'friends' ? 'Friends' : 'Everyone'}</h2>
                <span>{mailboxUsers.length} {peopleFilter === 'friends' ? 'friends' : 'signed up'}</span>
              </div>
              <button
                type="button"
                className="messages-icon-button"
                onClick={() => navigate('/friends')}
                title="Manage friends"
                aria-label="Manage friends"
              >
                <Users size={18} />
              </button>
            </div>

            <div className="messages-people-filter">
              <button
                type="button"
                className={peopleFilter === 'friends' ? 'is-active' : ''}
                onClick={() => setPeopleFilter('friends')}
              >
                Friends
              </button>
              <button
                type="button"
                className={peopleFilter === 'all' ? 'is-active' : ''}
                onClick={() => setPeopleFilter('all')}
              >
                Everyone
              </button>
            </div>

            <label className="messages-search">
              <Search size={18} />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, nickname, email"
              />
            </label>

            <div className="messages-user-list">
              {filteredUsers.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  className={`messages-user-row ${activeUserId === user.id ? 'is-active' : ''}`}
                  onClick={() => handleSelectUser(user)}
                >
                  <span className="messages-avatar" aria-hidden="true">{getInitial(user)}</span>
                  <span className="messages-user-copy">
                    <span className="messages-user-name">{user.name}</span>
                    <span className="messages-user-meta">@{user.nickname} - {user.email}</span>
                    {user.lastMessage && (
                      <span className="messages-user-preview">
                        {user.lastMessage.isMine ? 'You: ' : ''}
                        {user.lastMessage.body}
                      </span>
                    )}
                  </span>
                  {user.unreadCount > 0 && (
                    <span className="messages-badge">{user.unreadCount}</span>
                  )}
                </button>
              ))}

              {!isLoadingMailbox && filteredUsers.length === 0 && (
                <div className="messages-empty">
                  <UserCircle size={28} />
                  <span>
                    {peopleFilter === 'friends'
                      ? 'No friends yet. Add some from the Friends page.'
                      : 'No people found.'}
                  </span>
                </div>
              )}
            </div>
          </aside>

          <section className="messages-thread-panel" aria-label="Conversation">
            <div className="messages-thread-header">
              {selectedUser ? (
                <>
                  <span className="messages-avatar is-large" aria-hidden="true">{getInitial(selectedUser)}</span>
                  <div>
                    <h2>{selectedUser.name}</h2>
                    <span>@{selectedUser.nickname} - {selectedUser.email}</span>
                  </div>
                </>
              ) : (
                <div className="messages-thread-placeholder">
                  <Inbox size={24} />
                  <span>Choose a person</span>
                </div>
              )}
            </div>

            <div className="messages-thread-scroll" ref={threadScrollRef}>
              {selectedUser && thread.length === 0 && (
                <div className="messages-empty is-thread">
                  <Mail size={30} />
                  <span>No messages yet.</span>
                </div>
              )}

              <AnimatePresence initial={false} key={activeUserId}>
                {thread.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`messages-message-row ${message.isMine ? 'is-mine' : 'is-theirs'}`}
                    initial={
                      message.isMine
                        ? { opacity: 0, y: 12, scale: 0.96 }
                        : { opacity: 0, y: 24, scale: 0.9, x: -10 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 440,
                      damping: 26
                    }}
                  >
                    <div className="messages-message">
                      <p>{message.body}</p>
                      <span>{formatMessageTime(message.createdAt)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <form className="messages-compose" onSubmit={handleSend}>
              <input
                type="text"
                value={recipientValue}
                onChange={(event) => setRecipientInput(event.target.value)}
                placeholder="To nickname, name, or email"
                className="messages-recipient-input"
              />
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={currentUser ? `Message as ${currentUser.name}` : 'Write a message'}
                rows={3}
              />
              <button type="submit" disabled={isSending || !draft.trim()}>
                {isSending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                Send
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Messages;
