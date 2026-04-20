import { useState } from 'react';

const STEPS = [
  { label: 'Order Placed', icon: '📋' },
  { label: 'In Preparation', icon: '🍳' },
  { label: 'Ready for Pickup', icon: '✅' },
  { label: 'Completed', icon: '🎉' },
];

const STATUS_INDEX = { pending: 0, processing: 1, ready: 2, completed: 3 };

const DUMMY_ORDER = {
  _id: 'o1',
  guestName: 'Anna M.',
  guestToken: 'abc-123',
  status: 'processing',
  queuePosition: 2,
  items: [
    { name: 'Beer', quantity: 2, price: 400 },
    { name: 'Pretzel', quantity: 1, price: 250 },
  ],
  totalAmount: 1050,
  eventName: 'Campus Spring Festival',
  stationName: 'Drinks & Snacks',
};

export default function GuestView() {
  const [token, setToken] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const lookupOrder = (e) => {
    e.preventDefault();
    setNotFound(false);
    // In production: fetch(`/api/orders/token/${token}`)
    if (token.toLowerCase() === 'abc-123' || token === '') {
      setOrder(DUMMY_ORDER);
    } else {
      setNotFound(true);
    }
    setSubmitted(true);
  };

  const stepIndex = order ? STATUS_INDEX[order.status] ?? 0 : 0;

  if (!submitted) {
    return (
      <div style={{ maxWidth: 480, margin: '4rem auto' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Track Your Order</h1>
          <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Enter your order token from the QR code to see live status.
          </p>
          <form onSubmit={lookupOrder}>
            <div className="form-group">
              <label>Order Token</label>
              <input
                placeholder="e.g. abc-123 (demo)"
                value={token}
                onChange={e => setToken(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '0.1em', fontSize: '1rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              🔍 Find My Order
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ maxWidth: 480, margin: '4rem auto' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Order Not Found</h1>
          <p style={{ color: 'var(--color-muted)', margin: '0.75rem 0 1.5rem' }}>Check the token on your QR code and try again.</p>
          <button className="btn btn-primary" onClick={() => { setSubmitted(false); setToken(''); }}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '2rem auto' }}>
      {/* Event Info */}
      <div className="card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{order.eventName}</div>
          <div style={{ fontWeight: 600 }}>{order.stationName}</div>
        </div>
        <span className={`badge badge-${order.status}`}>{order.status}</span>
      </div>

      {/* Progress Stepper */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Live Status · Queue #{order.queuePosition}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {STEPS.map((step, i) => {
            const isDone = i < stepIndex;
            const isActive = i === stepIndex;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem',
                  background: isDone ? 'rgba(74,222,128,0.15)' : isActive ? 'rgba(108,99,255,0.2)' : 'var(--color-surface2)',
                  border: `2px solid ${isDone ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  boxShadow: isActive ? '0 0 12px rgba(108,99,255,0.4)' : 'none',
                }}>
                  {isDone ? '✓' : step.icon}
                </div>
                <div>
                  <div style={{
                    fontWeight: isActive ? 700 : 400,
                    color: isDone ? 'var(--color-success)' : isActive ? 'var(--color-text)' : 'var(--color-muted)',
                  }}>
                    {step.label}
                  </div>
                  {isActive && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-primary-h)', marginTop: '0.1rem' }}>
                      ● Currently here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Detail */}
      <div className="card">
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Your Items – {order.guestName}
        </h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {order.items.map((item, i) => (
            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>{item.name} × {item.quantity}</span>
              <span style={{ color: 'var(--color-muted)' }}>€{(item.price * item.quantity / 100).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>Total</span>
          <span>€{(order.totalAmount / 100).toFixed(2)}</span>
        </div>
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button className="btn" style={{ background: 'transparent', color: 'var(--color-muted)', fontSize: '0.82rem' }}
          onClick={() => { setSubmitted(false); setToken(''); setOrder(null); }}>
          ← Look up a different order
        </button>
      </div>
    </div>
  );
}
