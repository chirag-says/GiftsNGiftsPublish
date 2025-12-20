import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  RiRobot2Fill,
  RiRefreshLine,
  RiSendPlaneFill,
  RiCloseLine,
  RiCustomerService2Fill,
  RiSparklingFill,
  RiCheckDoubleLine
} from 'react-icons/ri';
import { AppContext } from '../context/Appcontext.jsx';
import { useChatbot } from '../../hooks/useChatbot.js';
import './ChatWidget.css';

const TypingIndicator = () => (
  <div className="chatbot-bubble bubble-bot typing-indicator">
    <span className="dot"></span>
    <span className="dot"></span>
    <span className="dot"></span>
  </div>
);

// Product Card Component
const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <a
      href={`/products/${product._id}`}
      className="chatbot-product-card"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="product-card-image">
        {product.image ? (
          <img src={product.image} alt={product.title} loading="lazy" />
        ) : (
          <div className="product-card-placeholder">🎁</div>
        )}
        {product.discount > 0 && (
          <span className="product-discount-badge">-{product.discount}%</span>
        )}
      </div>
      <div className="product-card-info">
        <h4 className="product-card-title">{product.title}</h4>
        {product.brand && <span className="product-card-brand">{product.brand}</span>}
        <div className="product-card-pricing">
          <span className="product-card-price">{formatPrice(product.price)}</span>
          {product.oldPrice > product.price && (
            <span className="product-card-old-price">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
        {!product.isAvailable && (
          <span className="product-out-of-stock">Out of Stock</span>
        )}
      </div>
    </a>
  );
};

// Product List Component
const ProductList = ({ products }) => (
  <div className="chatbot-product-list">
    {products.map((product) => (
      <ProductCard key={product._id} product={product} />
    ))}
  </div>
);

const MessageBubble = ({ data, isLast }) => {
  const isUser = data.sender === 'user';
  const bubbleClass = `chatbot-bubble ${isUser ? 'bubble-user' : 'bubble-bot'}`;
  const time = new Date(data.timestamp || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`message-row ${isUser ? 'row-user' : 'row-bot'}`}>
      {!isUser && (
        <div className="bot-avatar-small">
          <RiSparklingFill />
        </div>
      )}
      <div className={bubbleClass}>
        <p className="chatbot-bubble-text">{data.message}</p>

        {/* Product List from search results */}
        {data.payload?.type === 'product-list' && data.payload.products?.length > 0 && (
          <ProductList products={data.payload.products} />
        )}

        {/* Order Card with enhanced styling */}
        {data.payload?.order && (
          <div className="chatbot-order-card">
            <div className="chatbot-order-card__header">
              <span className="order-id">#{data.payload.order.orderShort}</span>
              <span className={`status-badge ${data.payload.order.statusLabel?.toLowerCase().replace(/\s+/g, '-')}`}>
                {data.payload.order.statusLabel}
              </span>
            </div>
            <div className="chatbot-order-card__body">
              <p className="amount">{data.payload.order.totalAmount}</p>
              <p className="meta">{data.payload.order.itemCount} items</p>
            </div>
          </div>
        )}

        {/* Timeline with progress visualization */}
        {data.payload?.timeline && (
          <div className="chatbot-timeline">
            {data.payload.timeline.map((step, idx) => (
              <div key={step.key || idx} className={`timeline-step ${step.done ? 'done' : ''}`}>
                <div className="step-indicator">
                  <div className="dot" />
                  {idx < data.payload.timeline.length - 1 && <div className="line" />}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Support Ticket Chip */}
        {data.payload?.ticketId && (
          <div className="chatbot-ticket-chip">
            <RiCustomerService2Fill /> Ticket #{data.payload.ticketId}
          </div>
        )}

        <span className="message-time">
          {time}
          {isUser && isLast && <RiCheckDoubleLine style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
        </span>
      </div>
    </div>
  );
};

const QuickActions = ({ actions, onSelect, disabled }) => (
  <div className="chatbot-quick-actions-container">
    <div className="chatbot-quick-actions">
      {actions.slice(0, 5).map((action) => (
        <button
          key={action}
          type="button"
          className="quick-action-chip"
          onClick={() => onSelect(action)}
          disabled={disabled}
        >
          {action}
        </button>
      ))}
    </div>
  </div>
);

const WelcomeScreen = ({ userName }) => (
  <div className="chatbot-welcome">
    <div className="welcome-emoji">👋</div>
    <h4>Hi{userName ? `, ${userName.split(' ')[0]}` : ''}!</h4>
    <p>How can I help you today?</p>
  </div>
);

const ChatWidget = () => {
  const { backendurl, userData } = useContext(AppContext);
  const [draft, setDraft] = useState('');
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const {
    session,
    messages,
    suggestions,
    isBootstrapping,
    isSending,
    error,
    resetError,
    isOpen,
    toggleWidget,
    sendMessage
  } = useChatbot({ backendurl, userData });

  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !hasOpenedOnce) {
      setHasOpenedOnce(true);
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, hasOpenedOnce]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen, isSending]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleRestart = () => {
    localStorage.removeItem('chatbotSessionId');
    window.location.reload();
  };

  const orderSummary = useMemo(() => session?.context?.orderSnapshot, [session]);
  const userName = userData?.name || session?.userName;

  return (
    <div className={`chatbot-shell ${isOpen ? 'active' : ''}`}>
      {/* Floating Action Button */}
      <button
        type="button"
        className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`}
        onClick={toggleWidget}
        aria-label="Open Support Chat"
      >
        <RiRobot2Fill size={28} />
        <span className="notification-dot"></span>
      </button>

      {/* Chat Panel */}
      <div className={`chatbot-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <header className="chatbot-header">
          <div className="header-info">
            <div className="avatar-ring">
              <RiSparklingFill size={24} />
            </div>
            <div className="meta">
              <h3 className="title">GNG Assistant</h3>
              <p className="status">
                <span className="status-dot"></span>
                {isBootstrapping ? 'Connecting...' : 'Online • Ready to help'}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={handleRestart}
              title="Start New Chat"
            >
              <RiRefreshLine size={20} />
            </button>
            <button
              type="button"
              className="icon-btn close-btn"
              onClick={toggleWidget}
              aria-label="Close Chat"
            >
              <RiCloseLine size={24} />
            </button>
          </div>
        </header>

        {/* Context Bar - Shows active order */}
        {orderSummary && (
          <div className="chatbot-context-bar">
            <div className="context-info">
              <span className="label">Tracking</span>
              <span className="value">#{orderSummary.orderShort}</span>
            </div>
            <span className="context-status">{orderSummary.statusLabel}</span>
          </div>
        )}

        {/* Chat Body */}
        <div className="chatbot-body">
          {isBootstrapping ? (
            <div className="chatbot-loading-state">
              <div className="spinner"></div>
              <p>Starting secure session...</p>
            </div>
          ) : (
            <div className="chatbot-messages-list">
              <div className="messages-start">
                <p>Today</p>
              </div>

              {messages.map((message, idx) => (
                <MessageBubble
                  data={message}
                  key={`${message.timestamp}-${idx}`}
                  isLast={idx === messages.length - 1}
                />
              ))}

              {isSending && (
                <div className="message-row row-bot">
                  <div className="bot-avatar-small">
                    <RiSparklingFill />
                  </div>
                  <TypingIndicator />
                </div>
              )}

              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Error Banner */}
        {!!error && (
          <div className="chatbot-error-banner">
            <span>{error}</span>
            <button onClick={resetError} aria-label="Dismiss error">
              <RiCloseLine size={18} />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="chatbot-footer">
          <QuickActions
            actions={suggestions}
            onSelect={(value) => sendMessage(value)}
            disabled={isSending || isBootstrapping}
          />

          <div className="chatbot-input-area">
            <textarea
              ref={inputRef}
              placeholder="Type your message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isBootstrapping}
              rows={1}
            />
            <button
              type="button"
              className="send-btn"
              onClick={handleSend}
              disabled={!draft.trim() || isSending || isBootstrapping}
              aria-label="Send message"
            >
              <RiSendPlaneFill size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
