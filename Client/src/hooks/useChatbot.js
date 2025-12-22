import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

const BASE_SUGGESTIONS = [
  'Track my order',
  'Cancel an order',
  'Return or replace',
  'Search products',
  'Talk to support'
];

const buildMetadataSnapshot = () => ({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  locale: navigator.language,
  platform: navigator.userAgentData?.platform || navigator.platform || 'web',
  browser: navigator.userAgentData?.brands?.[0]?.brand || navigator.userAgent
});

export const useChatbot = ({ backendurl, userData }) => {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState(BASE_SUGGESTIONS);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const sessionIdRef = useRef(localStorage.getItem('chatbotSessionId') || '');
  const abortRef = useRef(false);

  const userId = userData?._id || userData?.id;
  const userName = userData?.name;
  const userEmail = userData?.email;

  const userEnvelope = useCallback(() => ({
    userId,
    userName,
    userEmail
  }), [userEmail, userId, userName]);

  const hydrateSession = useCallback(async () => {
    if (!backendurl) {
      console.warn('Chatbot: No backend URL provided.');
      setError('Unable to connect: Server URL missing.');
      setIsBootstrapping(false);
      return;
    }

    setIsBootstrapping(true);
    setError('');

    try {
      const payload = {
        sessionId: sessionIdRef.current || undefined,
        ...userEnvelope(),
        metadata: buildMetadataSnapshot()
      };

      console.log('[Chatbot] Connecting to:', `${backendurl}/api/chatbot/session`);

      // Add a timeout to the request
      const { data } = await axios.post(`${backendurl}/api/chatbot/session`, payload, {
        timeout: 10000, // 10 seconds timeout
        withCredentials: true
      });

      if (abortRef.current) return;

      console.log('[Chatbot] Session established:', data.session?.sessionId);
      sessionIdRef.current = data.session.sessionId;
      localStorage.setItem('chatbotSessionId', data.session.sessionId);
      setSession(data.session);
      setMessages(data.session.messages || []);
      setSuggestions(data.session.context?.quickReplies?.length ? data.session.context.quickReplies : BASE_SUGGESTIONS);
    } catch (err) {
      if (!abortRef.current) {
        console.error('[Chatbot] Connection error:', err.message, err.response?.status);
        const errorMsg = err.code === 'ECONNABORTED'
          ? 'Connection timed out. Please try again.'
          : err.response?.data?.message || 'Unable to connect to the assistant.';
        setError(errorMsg);
      }
    } finally {
      // Always turn off bootstrapping, even if aborted, to prevent stuck UI
      setIsBootstrapping(false);
    }
  }, [backendurl, userEnvelope]);

  const sendMessage = useCallback(async (text, extraPayload = {}) => {
    const trimmed = text.trim();
    if (!trimmed || !backendurl || isSending) return;

    setMessages((prev) => ([
      ...prev,
      {
        _id: `local-${Date.now()}`,
        sender: 'user',
        message: trimmed,
        timestamp: new Date().toISOString()
      }
    ]));

    setIsSending(true);
    setError('');

    try {
      const payload = {
        sessionId: sessionIdRef.current,
        message: trimmed,
        ...userEnvelope(),
        ...extraPayload,
        metadata: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      };

      const { data } = await axios.post(`${backendurl}/api/chatbot/message`, payload);
      if (abortRef.current) return;

      sessionIdRef.current = data.session.sessionId;
      localStorage.setItem('chatbotSessionId', data.session.sessionId);
      setSession(data.session);
      setMessages(data.session.messages || []);
      setSuggestions(data.suggestions?.length ? data.suggestions : BASE_SUGGESTIONS);
    } catch (err) {
      if (!abortRef.current) {
        setError(err.response?.data?.message || 'Message failed to send. Please try again.');
      }
    } finally {
      if (!abortRef.current) setIsSending(false);
    }
  }, [backendurl, isSending, userEnvelope]);

  const hydratedRef = useRef(false);
  const previousUserIdRef = useRef(userId);

  // Initial hydration on mount
  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      hydrateSession();
    }
    return () => {
      abortRef.current = true;
    };
  }, []);

  // Detect logout: when userId changes from a value to undefined/null
  useEffect(() => {
    const prevId = previousUserIdRef.current;
    previousUserIdRef.current = userId;

    // If user logged out (had userId, now doesn't)
    if (prevId && !userId) {
      console.log('[Chatbot] User logged out, resetting session');
      // Clear stored session
      localStorage.removeItem('chatbotSessionId');
      sessionIdRef.current = '';

      // Reset ALL chatbot state
      setSession(null);
      setMessages([]);
      setSuggestions(BASE_SUGGESTIONS);
      setError('');
      setIsOpen(false); // Close the widget
      setIsBootstrapping(true); // Show loading state

      // Start fresh anonymous session after a brief delay
      abortRef.current = false;
      hydratedRef.current = false;
      setTimeout(() => {
        hydratedRef.current = true;
        hydrateSession();
      }, 300);
    }

    // If user logged in (didn't have userId, now has)
    if (!prevId && userId) {
      console.log('[Chatbot] User logged in, refreshing session');
      // Clear old session and get new one linked to user
      localStorage.removeItem('chatbotSessionId');
      sessionIdRef.current = '';
      setIsBootstrapping(true);
      hydrateSession();
    }
  }, [userId, hydrateSession]);

  const toggleWidget = () => setIsOpen((prev) => !prev);
  const openWidget = () => setIsOpen(true);
  const closeWidget = () => setIsOpen(false);

  const resetError = () => setError('');

  return {
    session,
    messages,
    suggestions,
    isBootstrapping,
    isSending,
    error,
    resetError,
    isOpen,
    toggleWidget,
    openWidget,
    closeWidget,
    sendMessage
  };
};
