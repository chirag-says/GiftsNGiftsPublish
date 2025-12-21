import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  RiChatSmile3Fill,
  RiSendPlaneFill,
  RiCloseLine,
  RiCustomerService2Fill,
  RiSparklingFill,
  RiCheckDoubleLine,
  RiRefreshLine,
  RiShoppingBag3Line,
  RiArrowLeftSLine,
  RiArrowRightSLine
} from 'react-icons/ri';
import { AppContext } from '../context/Appcontext.jsx';
import { useChatbot } from '../../hooks/useChatbot.js';
import './ChatWidget.css';

// --- Sub-Components ---

const TypingIndicator = () => (
  <div className="chat-bubble bot typing">
    <div className="dot"></div>
    <div className="dot"></div>
    <div className="dot"></div>
  </div>
);

const ProductCard = ({ product }) => {
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);

  return (
    <a
      href={`/products/${product._id}`}
      className="chat-product-card"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="product-image-container">
        {product.image ? (
          <img src={product.image} alt={product.title} loading="lazy" />
        ) : (
          <div className="placeholder-icon"><RiShoppingBag3Line /></div>
        )}
        {product.discount > 0 && (
          <span className="badge discount">-{product.discount}%</span>
        )}
      </div>
      <div className="product-details">
        <h4 className="product-title">{product.title}</h4>
        <div className="product-price-row">
          <span className="current-price">{formatPrice(product.price)}</span>
          {product.oldPrice > product.price && (
            <span className="old-price">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
        {!product.isAvailable ? (
          <span className="stock-status out">Out of Stock</span>
        ) : (
          <span className="stock-status in">In Stock</span>
        )}
      </div>
    </a>
  );
};

// New Carousel Component with Arrows
const ProductCarousel = ({ products }) => {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 0);
    // Allow a small buffer (1px) for calculation errors
    setShowRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    // Check again if products change
  }, [products]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 180; // Approximate card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="carousel-wrapper">
      {showLeft && (
        <button
          className="nav-arrow left"
          onClick={(e) => { e.preventDefault(); scroll('left'); }}
          aria-label="Scroll Left"
        >
          <RiArrowLeftSLine />
        </button>
      )}

      <div
        className="product-carousel"
        ref={scrollRef}
        onScroll={checkScroll}
      >
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {showRight && (
        <button
          className="nav-arrow right"
          onClick={(e) => { e.preventDefault(); scroll('right'); }}
          aria-label="Scroll Right"
        >
          <RiArrowRightSLine />
        </button>
      )}
    </div>
  );
};

const OrderCard = ({ order }) => (
  <div className="chat-order-card">
    <div className="order-header">
      <div className="order-id-group">
        <span className="label">Order</span>
        <span className="id">#{order.orderShort}</span>
      </div>
      <span className={`status-pill ${order.statusLabel?.toLowerCase().replace(/\s+/g, '-')}`}>
        {order.statusLabel}
      </span>
    </div>
    <div className="order-details">
      <div className="detail-item">
        <span className="label">Amount</span>
        <span className="value">{order.totalAmount}</span>
      </div>
      <div className="detail-item">
        <span className="label">Items</span>
        <span className="value">{order.itemCount}</span>
      </div>
    </div>
  </div>
);

const MessageBubble = ({ data, isLast }) => {
  const isUser = data.sender === 'user';
  const time = new Date(data.timestamp || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`message-group ${isUser ? 'user' : 'bot'}`}>
      {!isUser && (
        <div className="bot-avatar">
          <RiCustomerService2Fill />
        </div>
      )}

      <div className="message-content">
        <div className={`chat-bubble ${isUser ? 'user' : 'bot'}`}>
          <p>{data.message}</p>
        </div>

        {/* Carousel Renderer */}
        {data.payload?.type === 'product-list' && data.payload.products?.length > 0 && (
          <ProductCarousel products={data.payload.products} />
        )}

        {data.payload?.order && <OrderCard order={data.payload.order} />}

        {data.payload?.timeline && (
          <div className="timeline-container">
            {data.payload.timeline.map((step, idx) => (
              <div key={idx} className={`timeline-item ${step.done ? 'completed' : ''}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <span className="timeline-label">{step.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.payload?.ticketId && (
          <div className="ticket-chip">
            <RiSparklingFill /> Ticket #{data.payload.ticketId} Created
          </div>
        )}

        <div className="message-meta">
          <span>{time}</span>
          {isUser && isLast && <RiCheckDoubleLine className="read-receipt" />}
        </div>
      </div>
    </div>
  );
};

const QuickActions = ({ actions, onSelect, disabled }) => (
  <div className="quick-actions-scroll">
    <div className="quick-actions-wrapper">
      {actions.slice(0, 5).map((action) => (
        <button
          key={action}
          className="action-chip"
          onClick={() => onSelect(action)}
          disabled={disabled}
        >
          {action}
        </button>
      ))}
    </div>
  </div>
);

// --- Main Widget ---

const ChatWidget = () => {
  const { backendurl, userData } = useContext(AppContext);
  const [draft, setDraft] = useState('');
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const {
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
    if (isOpen) {
      if (!hasOpenedOnce) setHasOpenedOnce(true);
      setTimeout(() => inputRef.current?.focus(), 150);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [isOpen, messages, isSending, hasOpenedOnce]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  };

  const handleRestart = () => {
    localStorage.removeItem('chatbotSessionId');
    window.location.reload();
  };

  return (
    <div className={`chat-widget-container ${isOpen ? 'active' : ''}`}>
      <button
        className={`launcher-btn ${isOpen ? 'rotate-out' : 'rotate-in'}`}
        onClick={toggleWidget}
        aria-label="Toggle Chat"
      >
        <RiChatSmile3Fill size={28} />
      </button>

      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="brand-lockup">
            <div className="brand-logo">
              <RiCustomerService2Fill />
            </div>
            <div className="brand-info">
              <h3>Support Assistant</h3>
              <p className={isBootstrapping ? 'connecting' : 'online'}>
                {isBootstrapping ? 'Connecting...' : 'Replies instantly'}
              </p>
            </div>
          </div>
          <div className="header-controls">
            <button onClick={handleRestart} title="Reset Chat"><RiRefreshLine /></button>
            <button onClick={toggleWidget} title="Close"><RiCloseLine size={20} /></button>
          </div>
        </div>

        <div className="chat-viewport">
          <div className="date-separator"><span>Today</span></div>

          {messages.map((msg, idx) => (
            <MessageBubble
              key={`${msg.timestamp}-${idx}`}
              data={msg}
              isLast={idx === messages.length - 1}
            />
          ))}

          {isSending && (
            <div className="message-group bot">
              <div className="bot-avatar"><RiCustomerService2Fill /></div>
              <TypingIndicator />
            </div>
          )}

          {error && (
            <div className="error-toast">
              {error}
              <button onClick={resetError}><RiCloseLine /></button>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="chat-footer">
          <QuickActions
            actions={suggestions}
            onSelect={sendMessage}
            disabled={isSending || isBootstrapping}
          />

          <div className="input-group">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Type your message..."
              rows={1}
              disabled={isBootstrapping}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!draft.trim() || isSending}
            >
              <RiSendPlaneFill />
            </button>
          </div>
          <div className="branding-footer">
            Powered by Gifts n Gifts AI
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;